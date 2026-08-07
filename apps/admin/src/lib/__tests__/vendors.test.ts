import { describe, expect, it } from 'vitest';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import {
  formatCount,
  formatNaira,
  formatOnboardedDate,
  getVendorEmail,
  getVendorInitial,
  getVendorName,
  getVendorStatus,
} from '../vendors';

const vendor = (patch: Record<string, unknown> = {}) =>
  patch as unknown as Business;

describe('getVendorStatus', () => {
  it('collapses the approved-ish statuses to Active', () => {
    for (const status of ['active', 'approved', 'verified', 'VERIFIED']) {
      expect(getVendorStatus(vendor({ status }))).toEqual({
        variant: 'active',
        label: 'Active',
      });
    }
  });

  it('collapses the blocked-ish statuses to Inactive', () => {
    for (const status of ['inactive', 'rejected', 'suspended', 'disabled']) {
      expect(getVendorStatus(vendor({ status })).variant).toBe('inactive');
    }
  });

  // Anything unrecognised is treated as "not yet verified" — never as active.
  it('treats pending, unknown and missing statuses as awaiting verification', () => {
    for (const status of ['pending', 'in-review', 'something-new', '', undefined]) {
      expect(getVendorStatus(vendor({ status }))).toEqual({
        variant: 'awaiting',
        label: 'Awaiting verification',
      });
    }
  });
});

describe('vendor identity', () => {
  it('reads the name across the API spellings, in order', () => {
    expect(getVendorName(vendor({ business_name: 'Qlozet', name: 'Other' }))).toBe(
      'Qlozet'
    );
    expect(getVendorName(vendor({ name: 'Other' }))).toBe('Other');
    expect(getVendorName(vendor({ personal_name: 'Ada' }))).toBe('Ada');
    expect(getVendorName(vendor({ full_name: 'Ada Obi' }))).toBe('Ada Obi');
    expect(getVendorName(vendor({}))).toBe('Unnamed vendor');
  });

  it('reads the email, dashing when absent', () => {
    expect(getVendorEmail(vendor({ business_email: 'shop@q.co' }))).toBe('shop@q.co');
    expect(getVendorEmail(vendor({ email: 'a@b.co' }))).toBe('a@b.co');
    expect(getVendorEmail(vendor({}))).toBe('—');
  });

  it('derives an uppercase avatar initial', () => {
    expect(getVendorInitial(vendor({ business_name: 'qlozet' }))).toBe('Q');
    expect(getVendorInitial(vendor({}))).toBe('U'); // "Unnamed vendor"
  });
});

describe('vendor formatters', () => {
  it('formats naira and counts, including zero', () => {
    expect(formatNaira(180000)).toBe('₦180,000');
    expect(formatNaira(0)).toBe('₦0');
    expect(formatCount(1200)).toBe('1,200');
    expect(formatCount(0)).toBe('0');
  });

  it('dashes missing or NaN figures', () => {
    expect(formatNaira(undefined)).toBe('—');
    expect(formatNaira(Number.NaN)).toBe('—');
    expect(formatCount(undefined)).toBe('—');
    expect(formatCount(Number.NaN)).toBe('—');
  });

  it('formats the onboarded date as zero-padded DD/MM/YYYY', () => {
    expect(formatOnboardedDate('2025-02-04T12:00:00.000Z')).toBe('04/02/2025');
  });

  it('dashes a missing or unparseable onboarded date', () => {
    expect(formatOnboardedDate(undefined)).toBe('—');
    expect(formatOnboardedDate('')).toBe('—');
    expect(formatOnboardedDate('not-a-date')).toBe('—');
  });
});
