import { describe, expect, it } from 'vitest';
import type { Dispute } from '@/redux/services/disputes/disputes.api-slice';
import {
  canRespond,
  disputeStatusBadge,
  isEarningsFrozen,
  readDisputeCustomer,
  readDisputeReason,
  readDisputeRef,
  readDisputeStatus,
} from '../dispute-fields';

const dispute = (patch: Record<string, unknown> = {}) => patch as unknown as Dispute;

describe('dispute field readers', () => {
  it('prefers the order reference, then the order id, then the dispute id', () => {
    expect(readDisputeRef(dispute({ order_reference: 'QLZ-1', _id: 'd1' }))).toBe('QLZ-1');
    expect(readDisputeRef(dispute({ order_id: 'o1', _id: 'd1' }))).toBe('o1');
    expect(readDisputeRef(dispute({ _id: 'd1' }))).toBe('d1');
    expect(readDisputeRef(dispute({}))).toBe('—');
  });

  it('reads the reason, falling back to the description', () => {
    expect(readDisputeReason(dispute({ reason: 'Wrong size' }))).toBe('Wrong size');
    expect(readDisputeReason(dispute({ description: 'Late' }))).toBe('Late');
    expect(readDisputeReason(dispute({ reason: '   ' }))).toBe('—');
    expect(readDisputeReason(dispute({}))).toBe('—');
  });

  it('reads the customer handle, falling back to the email', () => {
    expect(readDisputeCustomer(dispute({ customer: { username: 'ada' } }))).toBe('ada');
    expect(readDisputeCustomer(dispute({ customer: { email: 'a@b.co' } }))).toBe('a@b.co');
    expect(readDisputeCustomer(dispute({}))).toBe('—');
  });

  it('lower-cases the status and defaults to open', () => {
    expect(readDisputeStatus(dispute({ status: 'UNDER_REVIEW' }))).toBe('under_review');
    expect(readDisputeStatus(dispute({}))).toBe('open');
  });
});

describe('canRespond', () => {
  it('allows a response while the dispute is live', () => {
    for (const status of ['open', 'under_review', 'vendor_responded', 'anything']) {
      expect(canRespond(dispute({ status }))).toBe(true);
    }
  });

  it('blocks a response once the dispute is settled', () => {
    for (const status of ['resolved', 'closed', 'rejected', 'refunded', 'cancelled']) {
      expect(canRespond(dispute({ status }))).toBe(false);
    }
  });
});

describe('disputeStatusBadge', () => {
  it('maps the known statuses', () => {
    expect(disputeStatusBadge('under_review').label).toBe('Under Review');
    expect(disputeStatusBadge('vendor_responded').label).toBe('Responded');
    expect(disputeStatusBadge('resolved').label).toBe('Resolved');
  });

  it('humanises an unknown status instead of rendering the raw key', () => {
    expect(disputeStatusBadge('awaiting_customer').label).toBe('Awaiting customer');
    expect(disputeStatusBadge('').label).toBe('Unknown');
  });
});

// Earnings frozen = the vendor is not paid out yet. Getting this wrong either
// hides a real hold or invents one, so every signal the backend uses is covered.
describe('isEarningsFrozen', () => {
  it('is true for the explicit flags', () => {
    expect(isEarningsFrozen({ earnings_frozen: true })).toBe(true);
    expect(isEarningsFrozen({ has_dispute: true })).toBe(true);
  });

  it('is true for a live dispute_status string', () => {
    expect(isEarningsFrozen({ dispute_status: 'open' })).toBe(true);
    expect(isEarningsFrozen({ dispute_status: 'UNDER_REVIEW' })).toBe(true);
  });

  it('is false once the dispute_status is settled', () => {
    for (const dispute_status of ['resolved', 'closed', 'rejected', 'refunded', 'cancelled']) {
      expect(isEarningsFrozen({ dispute_status })).toBe(false);
    }
  });

  it('treats "none" as no dispute', () => {
    expect(isEarningsFrozen({ dispute_status: 'none' })).toBe(false);
  });

  it('reads a nested dispute object', () => {
    expect(isEarningsFrozen({ dispute: { status: 'open' } })).toBe(true);
    expect(isEarningsFrozen({ dispute: { status: 'resolved' } })).toBe(false);
  });

  it('is false for an ordinary order and for junk input', () => {
    expect(isEarningsFrozen({ status: 'completed' })).toBe(false);
    expect(isEarningsFrozen({})).toBe(false);
    expect(isEarningsFrozen(null)).toBe(false);
    expect(isEarningsFrozen(undefined)).toBe(false);
  });
});
