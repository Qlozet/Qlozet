import { describe, expect, it } from 'vitest';
import {
  buildDraft,
  buildPayload,
  changedKeys,
  validateDraft,
  type SettingsDraft,
} from '../settings-form';
import {
  AI_TOKENS_TAB_SLUG,
  SETTINGS_TABS,
  TOKEN_PRICE_USD_KEY,
  fieldKeysForTab,
  tabFromSlug,
} from '../settings-tabs';
import type { PlatformSettings } from '@/redux/services/settings/settings.api-slice';

// The backend's defaults, which is what a fresh environment answers with.
const SETTINGS: PlatformSettings = {
  _id: 'settings-1',
  payout_cycle: 'weekly',
  minimum_payout: 2000,
  payout_delay_days: 3,
  auto_release_days: 10,
  tailored_order_upfront_percent: 65,
  reservation_fee_percent: 10,
  platform_commission_type: 'percent',
  platform_commission_percent: 10,
  platform_commission_flat: 0,
  payment_handling_fee_percent: 0,
  payment_handling_fee_flat: 0,
  tax_percent: 0.75,
  auto_reject_hours: 24,
  return_window_days: 7,
  late_penalty_percent_per_day: 5,
  late_penalty_max_percent: 25,
  low_stock_threshold: 5,
  low_fabric_yards: 0,
  token_price: {
    usd: { amount: 0.01, currency: 'USD' },
    ngn: { amount: 15, currency: 'NGN', last_updated: '2026-08-27T02:00:00Z' },
  },
  image_measurement_token_price: 25,
  video_measurement_token_price: 45,
  outfit_generation_token_price: 45,
  edit_garment_token_price: 45,
  run_prediction_token_price: 45,
  ai_ask_token_price: 0,
  analyze_reference_token_price: 10,
  ai_ask_requires_auth: false,
  updatedAt: '2026-08-27T02:00:00Z',
};

const draftWith = (overrides: SettingsDraft): SettingsDraft => ({
  ...buildDraft(SETTINGS),
  ...overrides,
});

describe('buildDraft', () => {
  it('holds numbers as strings and switches as booleans', () => {
    const draft = buildDraft(SETTINGS);
    expect(draft.minimum_payout).toBe('2000');
    expect(draft.payout_cycle).toBe('weekly');
    expect(draft.ai_ask_requires_auth).toBe(false);
  });

  it('reaches into the nested USD token price', () => {
    expect(buildDraft(SETTINGS)[TOKEN_PRICE_USD_KEY]).toBe('0.01');
  });
});

describe('changedKeys', () => {
  it('sees nothing to save in an untouched draft', () => {
    expect(changedKeys(buildDraft(SETTINGS), SETTINGS)).toEqual([]);
  });

  it('ignores a retyped value that parses to the same number', () => {
    const draft = draftWith({ minimum_payout: '2000.00' });
    expect(changedKeys(draft, SETTINGS)).toEqual([]);
  });

  it('counts an emptied number so it can be flagged rather than read as zero', () => {
    // low_fabric_yards is 0, so an empty box would otherwise coerce to "unchanged".
    const draft = draftWith({ low_fabric_yards: '' });
    expect(changedKeys(draft, SETTINGS)).toEqual(['low_fabric_yards']);
  });

  it('picks up a flipped switch', () => {
    const draft = draftWith({ ai_ask_requires_auth: true });
    expect(changedKeys(draft, SETTINGS)).toEqual(['ai_ask_requires_auth']);
  });
});

describe('validateDraft', () => {
  it('leaves an untouched draft clean', () => {
    expect(validateDraft(buildDraft(SETTINGS), SETTINGS)).toEqual({});
  });

  it('rejects a percentage over 100', () => {
    const draft = draftWith({ tax_percent: '140' });
    expect(validateDraft(draft, SETTINGS).tax_percent).toBe(
      'Cannot be more than 100.'
    );
  });

  it('rejects a fractional day count', () => {
    const draft = draftWith({ payout_delay_days: '2.5' });
    expect(validateDraft(draft, SETTINGS).payout_delay_days).toBe(
      'Whole numbers only.'
    );
  });

  it('rejects text and empties', () => {
    const draft = draftWith({ minimum_payout: 'soon', auto_reject_hours: '' });
    const errors = validateDraft(draft, SETTINGS);
    expect(errors.minimum_payout).toBe('Enter a number.');
    expect(errors.auto_reject_hours).toBe('Required.');
  });

  it('leaves a stored value outside the declared bounds alone until it is edited', () => {
    // Nothing sends this field, so nothing should block the save on it.
    const stored: PlatformSettings = { ...SETTINGS, auto_reject_hours: 900 };
    const draft = { ...buildDraft(stored), tax_percent: '2' };
    expect(validateDraft(draft, stored).auto_reject_hours).toBeUndefined();
  });
});

describe('buildPayload', () => {
  it('sends only what changed, coerced back to its own type', () => {
    const draft = draftWith({
      minimum_payout: '5000',
      payout_cycle: 'monthly',
      ai_ask_requires_auth: true,
    });

    expect(buildPayload(draft, SETTINGS)).toEqual({
      minimum_payout: 5000,
      payout_cycle: 'monthly',
      ai_ask_requires_auth: true,
    });
  });

  it('is empty when nothing moved', () => {
    expect(buildPayload(buildDraft(SETTINGS), SETTINGS)).toEqual({});
  });

  it('sends the whole token_price so the derived naira half survives the $set', () => {
    const draft = draftWith({ [TOKEN_PRICE_USD_KEY]: '0.02' });

    expect(buildPayload(draft, SETTINGS)).toEqual({
      token_price: {
        usd: { amount: 0.02, currency: 'USD' },
        ngn: {
          amount: 15,
          currency: 'NGN',
          last_updated: '2026-08-27T02:00:00Z',
        },
      },
    });
  });

  it('spells the tailored-order field the way the schema does', () => {
    // Mongoose strict mode drops a path the schema does not know and still
    // answers 200, so a near-miss on this name would save nothing and look
    // like it worked. The Swagger DTO carried the shorter spelling for a
    // while, which is what makes it worth pinning.
    const draft = draftWith({ tailored_order_upfront_percent: '50' });
    const payload = buildPayload(draft, SETTINGS);

    expect(payload).toEqual({ tailored_order_upfront_percent: 50 });
    expect(payload).not.toHaveProperty('tailored_order_upfront');
  });
});

// Each tab commits on its own, so the diff, the validation and the payload all
// have to stop at the tab's own fields — otherwise one tab's Save would carry
// an edit parked on another.
describe('per-tab scoping', () => {
  const payouts = tabFromSlug('payouts');
  const inventory = tabFromSlug('inventory');
  const aiAndTokens = tabFromSlug(AI_TOKENS_TAB_SLUG);

  it('gives the AI tab the token price that lives outside its sections', () => {
    expect(fieldKeysForTab(aiAndTokens)).toContain(TOKEN_PRICE_USD_KEY);
    expect(fieldKeysForTab(payouts)).not.toContain(TOKEN_PRICE_USD_KEY);
  });

  it('assigns every field to exactly one tab', () => {
    const assigned = SETTINGS_TABS.flatMap(fieldKeysForTab);
    expect(new Set(assigned).size).toBe(assigned.length);
    expect(assigned).toContain(TOKEN_PRICE_USD_KEY);
  });

  it('counts only the edits belonging to the tab', () => {
    const draft = draftWith({
      minimum_payout: '5000',
      low_stock_threshold: '9',
    });

    expect(changedKeys(draft, SETTINGS, fieldKeysForTab(payouts))).toEqual([
      'minimum_payout',
    ]);
    expect(changedKeys(draft, SETTINGS, fieldKeysForTab(inventory))).toEqual([
      'low_stock_threshold',
    ]);
  });

  it('leaves another tab’s edit out of the payload', () => {
    const draft = draftWith({
      minimum_payout: '5000',
      low_stock_threshold: '9',
    });

    expect(buildPayload(draft, SETTINGS, fieldKeysForTab(payouts))).toEqual({
      minimum_payout: 5000,
    });
  });

  it('does not let another tab’s invalid value block this tab’s save', () => {
    // Inventory is mid-edit and wrong; Payouts should still be saveable.
    const draft = draftWith({
      low_stock_threshold: 'lots',
      minimum_payout: '5000',
    });

    expect(validateDraft(draft, SETTINGS, fieldKeysForTab(payouts))).toEqual(
      {}
    );
    expect(
      validateDraft(draft, SETTINGS, fieldKeysForTab(inventory))
        .low_stock_threshold
    ).toBe('Enter a number.');
  });

  it('scopes the token price to the AI tab, whole object and all', () => {
    const draft = draftWith({ [TOKEN_PRICE_USD_KEY]: '0.05' });

    expect(buildPayload(draft, SETTINGS, fieldKeysForTab(payouts))).toEqual({});
    expect(buildPayload(draft, SETTINGS, fieldKeysForTab(aiAndTokens))).toEqual(
      {
        token_price: {
          usd: { amount: 0.05, currency: 'USD' },
          ngn: {
            amount: 15,
            currency: 'NGN',
            last_updated: '2026-08-27T02:00:00Z',
          },
        },
      }
    );
  });
});
