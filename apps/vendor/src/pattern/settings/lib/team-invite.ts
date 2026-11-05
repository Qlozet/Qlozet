// Client-side checks for the invite form, so a typo is caught before the
// request rather than coming back as a server error per row.

/** Emails are matched case-insensitively server-side; send them as stored. */
export const normalizeInviteEmail = (email: string): string =>
  email.trim().toLowerCase();

// Deliberately loose: something@something.tld, no spaces. The server has the
// final say; this only stops obvious slips like a missing "@" or domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidInviteEmail = (email: string): boolean =>
  EMAIL_PATTERN.test(normalizeInviteEmail(email));

/**
 * Did the invite go out? The server adds the member either way and reports
 * the email separately; older responses put the flag at the top level.
 * Anything other than an explicit false counts as sent.
 */
export const inviteEmailSent = (response: unknown): boolean => {
  const res = response as
    | { email_sent?: unknown; data?: { email_sent?: unknown } | null }
    | null
    | undefined;
  const flag = res?.data?.email_sent ?? res?.email_sent;
  return flag !== false;
};
