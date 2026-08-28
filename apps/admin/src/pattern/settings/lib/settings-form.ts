// Draft state for the settings form.
//
// The screen edits one document across five tabs, so the draft lives above the
// tabs and a single Save sends whatever changed — from any tab. Numbers are
// held as raw strings while they are being typed (a half-typed "1." is not yet
// a number, and coercing it early fights the cursor), and only parsed at the
// validation and diffing boundary.

import type {
  PlatformSettings,
  UpdatePlatformSettingsRequest,
} from '@/redux/services/settings/settings.api-slice';
import {
  ALL_SETTINGS_FIELDS,
  FIELD_FALLBACKS,
  TOKEN_PRICE_USD_KEY,
  type SettingsFieldKey,
  type SettingsFieldSpec,
} from './settings-tabs';

export type DraftValue = string | boolean;
export type SettingsDraft = Record<string, DraftValue>;
export type SettingsErrors = Partial<Record<SettingsFieldKey, string>>;

/** Reads a field off the settings document in the shape the draft holds it. */
export const readSettingValue = (
  settings: PlatformSettings,
  key: SettingsFieldKey
): DraftValue => {
  if (key === TOKEN_PRICE_USD_KEY) {
    return String(settings.token_price?.usd?.amount ?? 0);
  }
  const value = settings[key as keyof PlatformSettings];
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) {
    // A backend deployed before a field existed doesn't return it — fall back
    // to the schema default so the draft is clean instead of showing a phantom
    // change + "Required." on an untouched form.
    return FIELD_FALLBACKS[key] ?? '';
  }
  return String(value);
};

export const buildDraft = (settings: PlatformSettings): SettingsDraft =>
  Object.fromEntries(
    ALL_SETTINGS_FIELDS.map((field) => [
      field.key,
      readSettingValue(settings, field.key),
    ])
  );

/**
 * The message to show under a field, or null when it is fine. Selects and
 * switches cannot be wrong — their inputs only produce valid values.
 */
export const validateField = (
  spec: SettingsFieldSpec,
  value: DraftValue
): string | null => {
  if (spec.kind !== 'number') return null;

  const raw = String(value).trim();
  if (!raw) return 'Required.';

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 'Enter a number.';
  if (spec.integer && !Number.isInteger(parsed)) return 'Whole numbers only.';

  const min = spec.min ?? 0;
  if (parsed < min) return `Cannot be less than ${min}.`;
  if (spec.max !== undefined && parsed > spec.max) {
    return `Cannot be more than ${spec.max}.`;
  }
  return null;
};

/** Compares against the saved document, so re-typing the same value is not a change. */
const hasChanged = (
  spec: SettingsFieldSpec,
  draftValue: DraftValue,
  settings: PlatformSettings
): boolean => {
  const saved = readSettingValue(settings, spec.key);
  if (spec.kind === 'switch') return Boolean(draftValue) !== Boolean(saved);
  if (spec.kind === 'number') {
    const raw = String(draftValue).trim();
    // An emptied field counts as a change so it surfaces as "Required" rather
    // than coercing to zero and quietly reading as untouched.
    if (!raw) return true;
    return Number(raw) !== Number(saved);
  }
  return String(draftValue) !== String(saved);
};

/**
 * What has moved since the last save, optionally narrowed to one tab's fields.
 *
 * Each tab saves on its own, so nearly every caller passes a scope; the
 * unscoped form is what answers "is anything unsaved anywhere", which is what
 * guards the token price refresh.
 */
export const changedFields = (
  draft: SettingsDraft,
  settings: PlatformSettings,
  scope?: readonly string[]
): SettingsFieldSpec[] => {
  const inScope = scope ? new Set<string>(scope) : null;
  return ALL_SETTINGS_FIELDS.filter(
    (field) =>
      (!inScope || inScope.has(field.key)) &&
      hasChanged(field, draft[field.key] ?? '', settings)
  );
};

export const changedKeys = (
  draft: SettingsDraft,
  settings: PlatformSettings,
  scope?: readonly string[]
): SettingsFieldKey[] =>
  changedFields(draft, settings, scope).map((field) => field.key);

/**
 * Only the fields being sent are validated.
 *
 * PATCH carries the diff, so a stored value that sits outside the bounds
 * declared here — set before those bounds existed, or by another client — is
 * left alone rather than blocking a save that never touches it.
 */
export const validateDraft = (
  draft: SettingsDraft,
  settings: PlatformSettings,
  scope?: readonly string[]
): SettingsErrors => {
  const errors: SettingsErrors = {};
  changedFields(draft, settings, scope).forEach((field) => {
    const message = validateField(field, draft[field.key] ?? '');
    if (message) errors[field.key] = message;
  });
  return errors;
};

/**
 * The changed fields within `scope`, in the shape PATCH /admin/settings expects
 * — one tab's Save sends one tab's edits and leaves the other tabs' drafts
 * alone.
 *
 * `token_price` is the one field that cannot be sent piecemeal: Mongoose `$set`s
 * a nested object wholesale, so sending only the USD half would wipe the NGN
 * price the cron derived. The saved NGN half rides along untouched.
 */
export const buildPayload = (
  draft: SettingsDraft,
  settings: PlatformSettings,
  scope?: readonly string[]
): UpdatePlatformSettingsRequest => {
  const payload: Record<string, unknown> = {};

  changedFields(draft, settings, scope).forEach((spec) => {
    const key = spec.key;
    const value = draft[key];

    if (key === TOKEN_PRICE_USD_KEY) {
      payload.token_price = {
        ...settings.token_price,
        usd: {
          ...settings.token_price?.usd,
          currency: settings.token_price?.usd?.currency ?? 'USD',
          amount: Number(String(value).trim()),
        },
      };
      return;
    }

    if (spec.kind === 'switch') {
      payload[key] = Boolean(value);
      return;
    }
    if (spec.kind === 'number') {
      payload[key] = Number(String(value).trim());
      return;
    }
    payload[key] = String(value);
  });

  return payload as UpdatePlatformSettingsRequest;
};
