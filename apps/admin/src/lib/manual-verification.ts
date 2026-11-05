// Manual vendor verification — the mode the platform falls back to while
// QoreID is unavailable. The vendor gives their CAC number and links a payout
// account whose name the bank confirmed; the Qlozet team checks the rest by
// hand. Mirrors qlozet-backend/src/modules/qoreid/manual-verification.ts, so
// the check keys and labels here must match it: the backend refuses an
// approval until every one of them is ticked, and names the missing ones by
// these same labels.

import type { Business } from '@/redux/services/businesses/businesses.api-slice';

export type VendorVerificationMode = 'qoreid' | 'manual';

export const DEFAULT_GRACE_DAYS = 30;

/** The public register a reviewer searches the vendor's CAC number on. */
export const CAC_SEARCH_URL = 'https://search.cac.gov.ng/';

export const MANUAL_CHECKS = [
  'cac_register',
  'payout_name',
  'owner_call',
] as const;
export type ManualCheck = (typeof MANUAL_CHECKS)[number];
export type ManualChecks = Record<ManualCheck, boolean>;

export const MANUAL_CHECK_LABELS: Record<ManualCheck, string> = {
  cac_register:
    'Found the CAC number on the public CAC register, under this business name',
  payout_name: 'The payout account name matches the business or its owner',
  owner_call: 'Spoke to the owner on a call and confirmed who they are',
};

/** What the vendor submitted and what a reviewer has ticked so far. */
export interface ManualSubmission {
  rcNumber: string | null;
  payoutAccountName: string | null;
  payoutBankName: string | null;
  payoutAccountLast4: string | null;
  submittedAt: string | null;
  checks: ManualChecks;
  note: string;
  checkedAt: string | null;
}

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

export const isManualVendor = (vendor?: Business | null): boolean =>
  vendor?.verification_method === 'manual';

/** The ticks as booleans — anything but a literal true is unticked. */
export const readManualChecks = (value: unknown): ManualChecks => {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<
    string,
    unknown
  >;
  return {
    cac_register: raw.cac_register === true,
    payout_name: raw.payout_name === true,
    owner_call: raw.owner_call === true,
  };
};

/**
 * The manual submission off a business document, or null for a vendor not
 * being verified by hand. Falls back to the top-level payout name, which the
 * submission copies at the time it is made.
 */
export const readManualSubmission = (
  vendor?: Business | null
): ManualSubmission | null => {
  if (!vendor || !isManualVendor(vendor)) return null;
  const verification = (vendor.verification ?? {}) as Record<string, unknown>;
  const manual = (verification.manual ?? {}) as Record<string, unknown>;
  return {
    rcNumber: text(manual.rc_number),
    payoutAccountName:
      text(manual.payout_account_name) ?? text(vendor.payout_account_name),
    payoutBankName:
      text(manual.payout_bank_name) ?? text(vendor.payout_bank_name),
    payoutAccountLast4: text(manual.payout_account_last4),
    submittedAt: text(manual.submitted_at),
    checks: readManualChecks(manual.checks),
    note: text(manual.note) ?? '',
    checkedAt: text(manual.checked_at),
  };
};

/** Checks still unticked. Approving needs none left. */
export const missingManualChecks = (
  checks: Partial<ManualChecks>
): ManualCheck[] => MANUAL_CHECKS.filter((check) => checks[check] !== true);

const formatDay = (date: Date): string =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export interface VerificationPill {
  label: string;
  tone: 'neutral' | 'warn' | 'danger';
}

/**
 * The small labels shown beside a vendor's status: "Approved by hand" for a
 * manual approval, and the date their full checks are due once the platform
 * has switched back to QoreID — in red once it has passed.
 */
export const verificationPills = (
  vendor: Business | null | undefined,
  now: Date = new Date()
): VerificationPill[] => {
  if (!vendor || !isManualVendor(vendor)) return [];
  const pills: VerificationPill[] = [];
  if (vendor.verification_state === 'approved') {
    pills.push({ label: 'Approved by hand', tone: 'neutral' });
  }
  const due = text(vendor.full_verification_due_at);
  const dueDate = due ? new Date(due) : null;
  if (dueDate && !Number.isNaN(dueDate.getTime())) {
    const overdue = dueDate.getTime() <= now.getTime();
    pills.push({
      label: `${overdue ? 'Full checks overdue since' : 'Full checks due'} ${formatDay(dueDate)}`,
      tone: overdue ? 'danger' : 'warn',
    });
  }
  return pills;
};

/** The vendor's verification method, defaulting to QoreID like the backend. */
export const readVerificationMode = (value: unknown): VendorVerificationMode =>
  value === 'manual' ? 'manual' : 'qoreid';

/** Grace days as the backend reads them: a whole number of at least 1. */
export const readGraceDays = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.round(n) : DEFAULT_GRACE_DAYS;
};

/**
 * What an admin must confirm before saving a change of verification mode, or
 * null when the mode is not changing.
 */
export const verificationModeSwitchWarning = (
  from: unknown,
  to: unknown,
  graceDays: unknown
): string | null => {
  const before = readVerificationMode(from);
  const after = readVerificationMode(to);
  if (before === after) return null;
  if (after === 'qoreid') {
    const days = readGraceDays(graceDays);
    return `Switch vendor verification to QoreID? Vendors approved by hand will have ${days} day${days === 1 ? '' : 's'} to finish the identity checks; after that their products are hidden until they do. They are notified now.`;
  }
  return 'Switch vendor verification to manual? New vendors will submit their CAC number and a payout account their bank has confirmed, and your team must check each one by hand before approving it.';
};
