import { describe, expect, it } from 'vitest';
import type { VerificationState } from '@/redux/services/verification/verification.api-slice';
import {
  formatLongDate,
  isManuallyApproved,
  showsManualForm,
  summariseVerification,
} from '../verification-status';

const state = (over: Partial<VerificationState> = {}): VerificationState => ({
  mode: 'qoreid',
  method: null,
  full_verification_due_at: null,
  grace_days: 30,
  manual: null,
  payout_account: null,
  can_submit_manual: false,
  configured: true,
  workflow_available: true,
  status: 'pending',
  verification: {},
  verification_state: 'not_started',
  verification_message: null,
  attempts_used: 0,
  attempts_allowed: 1,
  can_start: true,
  service_agreement: {
    required_version: '2026-11-05',
    accepted: true,
    accepted_at: '2026-11-05T09:00:00.000Z',
    outdated: false,
  },
  ...over,
});

const manualApproved = (over: Partial<VerificationState> = {}) =>
  state({
    status: 'approved',
    method: 'manual',
    verification_state: 'approved',
    ...over,
  });

describe('formatLongDate', () => {
  it('writes the date out in full', () => {
    expect(formatLongDate('2026-12-05T12:00:00.000Z')).toBe('5 December 2026');
  });

  it('returns null for nothing or nonsense', () => {
    expect(formatLongDate(null)).toBeNull();
    expect(formatLongDate(undefined)).toBeNull();
    expect(formatLongDate('not a date')).toBeNull();
  });
});

describe('showsManualForm', () => {
  it('shows the form in manual mode until the team has it', () => {
    expect(showsManualForm(state({ mode: 'manual' }))).toBe(true);
    expect(
      showsManualForm(
        state({ mode: 'manual', verification_state: 'action_required' })
      )
    ).toBe(true);
  });

  it('hides it once the state belongs to the team, or in QoreID mode', () => {
    for (const s of ['awaiting_review', 'approved', 'rejected'] as const) {
      expect(
        showsManualForm(state({ mode: 'manual', verification_state: s }))
      ).toBe(false);
    }
    expect(showsManualForm(state())).toBe(false);
  });
});

describe('isManuallyApproved', () => {
  it('is only true for an approved vendor verified by hand', () => {
    expect(isManuallyApproved(manualApproved())).toBe(true);
    expect(
      isManuallyApproved(
        manualApproved({ verification_state: 'action_required' })
      )
    ).toBe(false);
    expect(isManuallyApproved(manualApproved({ method: 'qoreid' }))).toBe(
      false
    );
  });
});

describe('summariseVerification', () => {
  it('asks a manual-mode vendor to verify, with no session to start', () => {
    const summary = summariseVerification(state({ mode: 'manual' }));
    expect(summary?.headline).toBe('Verify your store');
    expect(summary?.tone).toBe('warning');
    expect(summary?.canSell).toBe(false);
    expect(summary?.action?.href).toBe('/verification');
  });

  it('keeps the review summary for a manual submission', () => {
    const summary = summariseVerification(
      state({
        mode: 'manual',
        method: 'manual',
        verification_state: 'awaiting_review',
      })
    );
    expect(summary?.headline).toBe('Your store is being reviewed');
    expect(summary?.tone).toBe('info');
  });

  it('warns a manually approved vendor about the deadline', () => {
    const summary = summariseVerification(
      manualApproved({ full_verification_due_at: '2026-12-05T12:00:00.000Z' })
    );
    expect(summary?.headline).toBe('Finish verification by 5 December 2026');
    expect(summary?.tone).toBe('warning');
    expect(summary?.canSell).toBe(true);
    expect(summary?.action?.label).toBe('Finish verification');
  });

  it('passes on a failure message during the deadline', () => {
    const summary = summariseVerification(
      manualApproved({
        full_verification_due_at: '2026-12-05T12:00:00.000Z',
        verification_message: 'Your face did not match your ID. Try again.',
      })
    );
    expect(summary?.body).toBe('Your face did not match your ID. Try again.');
  });

  it('says nothing to a manually approved vendor with no deadline', () => {
    expect(summariseVerification(manualApproved())).toBeNull();
  });

  it('treats a missed deadline as action required', () => {
    const summary = summariseVerification(
      state({
        status: 'action_required',
        method: 'manual',
        verification_state: 'action_required',
        full_verification_due_at: '2026-11-01T12:00:00.000Z',
        verification_message:
          'Your store is paused until you finish the identity checks.',
      })
    );
    expect(summary?.headline).toBe(
      'We need something fixed before you can sell'
    );
    expect(summary?.body).toBe(
      'Your store is paused until you finish the identity checks.'
    );
    expect(summary?.canSell).toBe(false);
  });

  it('asks an approved vendor to accept a changed agreement', () => {
    const summary = summariseVerification(
      state({
        status: 'approved',
        verification_state: 'approved',
        service_agreement: {
          required_version: '2026-11-05',
          accepted: false,
          accepted_at: '2026-10-31T09:00:00.000Z',
          outdated: true,
        },
      })
    );
    expect(summary?.headline).toBe('The vendor agreement has changed');
  });

  it('still says nothing to an approved vendor who is up to date', () => {
    expect(
      summariseVerification(
        state({ status: 'approved', verification_state: 'approved' })
      )
    ).toBeNull();
  });
});
