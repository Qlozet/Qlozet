import { describe, expect, it } from 'vitest';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import {
  MANUAL_CHECKS,
  missingManualChecks,
  readGraceDays,
  readManualChecks,
  readManualSubmission,
  readVerificationMode,
  verificationModeSwitchWarning,
  verificationPills,
} from '../manual-verification';

const vendor = (patch: Record<string, unknown> = {}) =>
  patch as unknown as Business;

describe('readManualChecks', () => {
  it('only counts a literal true as ticked', () => {
    expect(
      readManualChecks({
        cac_register: true,
        payout_name: 'yes',
        owner_call: 1,
      })
    ).toEqual({ cac_register: true, payout_name: false, owner_call: false });
    expect(readManualChecks(null)).toEqual({
      cac_register: false,
      payout_name: false,
      owner_call: false,
    });
  });
});

describe('missingManualChecks', () => {
  it('lists every unticked check, in order', () => {
    expect(missingManualChecks({})).toEqual([...MANUAL_CHECKS]);
    expect(
      missingManualChecks({ cac_register: true, owner_call: true })
    ).toEqual(['payout_name']);
    expect(
      missingManualChecks({
        cac_register: true,
        payout_name: true,
        owner_call: true,
      })
    ).toEqual([]);
  });
});

describe('readManualSubmission', () => {
  it('is null for a vendor not verified by hand', () => {
    expect(
      readManualSubmission(vendor({ verification_method: 'qoreid' }))
    ).toBeNull();
    expect(readManualSubmission(vendor({}))).toBeNull();
    expect(readManualSubmission(undefined)).toBeNull();
  });

  it('reads what the vendor gave and what was ticked', () => {
    const result = readManualSubmission(
      vendor({
        verification_method: 'manual',
        payout_bank_name: 'Fallback Bank',
        verification: {
          manual: {
            rc_number: 'RC1234567',
            payout_account_name: 'ADA STITCHES LTD',
            payout_account_last4: '6789',
            submitted_at: '2026-11-01T10:00:00.000Z',
            checks: { cac_register: true },
            note: '  Called on WhatsApp ',
          },
        },
      })
    );
    expect(result).toMatchObject({
      rcNumber: 'RC1234567',
      payoutAccountName: 'ADA STITCHES LTD',
      payoutBankName: 'Fallback Bank',
      payoutAccountLast4: '6789',
      checks: { cac_register: true, payout_name: false, owner_call: false },
      note: 'Called on WhatsApp',
    });
  });
});

describe('verificationPills', () => {
  const now = new Date('2026-11-05T12:00:00.000Z');

  it('shows nothing for a QoreID vendor', () => {
    expect(
      verificationPills(
        vendor({
          verification_method: 'qoreid',
          verification_state: 'approved',
        }),
        now
      )
    ).toEqual([]);
  });

  it('marks a manual approval', () => {
    expect(
      verificationPills(
        vendor({
          verification_method: 'manual',
          verification_state: 'approved',
        }),
        now
      )
    ).toEqual([{ label: 'Approved by hand', tone: 'neutral' }]);
  });

  it('does not call a manual submission still in review approved', () => {
    expect(
      verificationPills(
        vendor({
          verification_method: 'manual',
          verification_state: 'awaiting_review',
        }),
        now
      )
    ).toEqual([]);
  });

  it('adds the due date, and flags it once it has passed', () => {
    const upcoming = verificationPills(
      vendor({
        verification_method: 'manual',
        verification_state: 'approved',
        full_verification_due_at: '2026-12-05T12:00:00.000Z',
      }),
      now
    );
    expect(upcoming[1]).toEqual({
      label: 'Full checks due 5 Dec 2026',
      tone: 'warn',
    });

    const overdue = verificationPills(
      vendor({
        verification_method: 'manual',
        verification_state: 'action_required',
        full_verification_due_at: '2026-11-01T12:00:00.000Z',
      }),
      now
    );
    expect(overdue).toEqual([
      { label: 'Full checks overdue since 1 Nov 2026', tone: 'danger' },
    ]);
  });

  it('ignores an unreadable date', () => {
    expect(
      verificationPills(
        vendor({
          verification_method: 'manual',
          verification_state: 'approved',
          full_verification_due_at: 'not a date',
        }),
        now
      )
    ).toHaveLength(1);
  });
});

describe('readVerificationMode / readGraceDays', () => {
  it('defaults like the backend', () => {
    expect(readVerificationMode('manual')).toBe('manual');
    expect(readVerificationMode(undefined)).toBe('qoreid');
    expect(readVerificationMode('other')).toBe('qoreid');
    expect(readGraceDays('14')).toBe(14);
    expect(readGraceDays(0)).toBe(30);
    expect(readGraceDays('')).toBe(30);
  });
});

describe('verificationModeSwitchWarning', () => {
  it('is null when the mode does not change', () => {
    expect(verificationModeSwitchWarning('qoreid', 'qoreid', 30)).toBeNull();
    expect(verificationModeSwitchWarning(undefined, 'qoreid', 30)).toBeNull();
  });

  it('warns about the deadline when switching back to QoreID', () => {
    const message = verificationModeSwitchWarning('manual', 'qoreid', '14');
    expect(message).toContain(
      'Vendors approved by hand will have 14 days to finish the identity checks; after that their products are hidden until they do.'
    );
    expect(verificationModeSwitchWarning('manual', 'qoreid', 1)).toContain(
      'will have 1 day to'
    );
  });

  it('explains the hand checks when switching to manual', () => {
    expect(verificationModeSwitchWarning('qoreid', 'manual', 30)).toContain(
      'your team must check each one'
    );
  });
});
