import type {
  VerificationState,
  VerificationStep,
} from '@/redux/services/verification/verification.api-slice';

export interface VerificationSummary {
  /** Whether customers can currently see and buy this vendor's products. */
  canSell: boolean;
  tone: 'info' | 'warning' | 'danger' | 'success';
  headline: string;
  /** What is blocked, and what to do about it. */
  body: string;
  /** Call to action, when there is one worth offering. */
  action?: { label: string; href: string };
}

const GET_VERIFIED = '/verification';

/** "5 December 2026" — for deadlines and submission dates. */
export function formatLongDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Approved by the Qlozet team by hand, rather than through the QoreID checks. */
export function isManuallyApproved(
  state: VerificationState | undefined | null
): boolean {
  return state?.method === 'manual' && state?.verification_state === 'approved';
}

/** Manual mode, and the vendor still has the form to fill in — nothing is
 *  with the Qlozet team yet. */
export function showsManualForm(
  state: VerificationState | undefined | null
): boolean {
  if (state?.mode !== 'manual') return false;
  return !['awaiting_review', 'approved', 'rejected'].includes(
    state.verification_state ?? 'not_started'
  );
}

/**
 * One reading of verification, shared by the dashboard banner and the Get
 * Verified page.
 *
 * Written as sentences a vendor can act on rather than status names. A vendor
 * whose products are saved, active and invisible will assume the site is
 * broken unless something tells them otherwise — that assumption is the
 * support ticket this exists to prevent.
 */
export function summariseVerification(
  state: VerificationState | undefined | null
): VerificationSummary | null {
  if (!state) return null;

  const canSell = ['approved', 'verified'].includes(
    String(state.status).toLowerCase()
  );

  const step: VerificationStep = state.verification_state ?? 'not_started';
  const agreement = state.service_agreement;
  // Missing on an older backend: nothing to ask then.
  const rulesPending = state.order_rules?.acknowledged === false;

  // Approved by hand while QoreID was unavailable, and now it is back: they
  // keep selling until the date, and are paused after it.
  const due = formatLongDate(state.full_verification_due_at);
  if (isManuallyApproved(state) && due) {
    return {
      canSell,
      tone: 'warning',
      headline: `Finish verification by ${due}`,
      body:
        state.verification_message ||
        'You can keep selling until then. After that your products are ' +
          'hidden until you finish the identity checks.',
      action: { label: 'Finish verification', href: GET_VERIFIED },
    };
  }

  // Nothing to say to a vendor who is already trading — unless the agreement
  // changed under them.
  if (canSell && step === 'approved') {
    if (agreement?.outdated) {
      return {
        canSell,
        tone: 'info',
        headline: 'The vendor agreement has changed',
        body: 'Read the new version and accept it on your verification page.',
        action: { label: 'Read the agreement', href: GET_VERIFIED },
      };
    }
    if (rulesPending) {
      return {
        canSell,
        tone: 'info',
        headline: state.order_rules?.outdated
          ? 'An order rule has changed'
          : 'Read how orders work',
        body: state.order_rules?.outdated
          ? 'Read the updated rules and tick "I understand" on your verification page.'
          : 'A short list of the rules every order follows: confirm and ship-by times, late charges, when you are paid. Tick "I understand" once.',
        action: { label: 'Read the rules', href: GET_VERIFIED },
      };
    }
    return null;
  }

  if (step === 'rejected') {
    return {
      canSell,
      tone: 'danger',
      headline: 'Your store was not approved',
      body:
        state.verification_message ||
        'Contact support to find out what is needed to reopen your verification.',
    };
  }

  if (step === 'action_required') {
    return {
      canSell,
      tone: 'warning',
      headline: 'We need something fixed before you can sell',
      body:
        state.verification_message ||
        'One of your verification checks did not pass. Contact support and we will reopen it.',
      action: { label: 'Open verification', href: GET_VERIFIED },
    };
  }

  if (step === 'awaiting_review') {
    return {
      canSell,
      tone: 'info',
      headline: 'Your store is being reviewed',
      body:
        'We are checking your details and your products. Nothing is needed ' +
        'from you — you can keep adding products while you wait.',
    };
  }

  if (step === 'provider_complete') {
    return {
      canSell,
      tone: 'warning',
      headline:
        agreement?.accepted && !rulesPending
          ? 'Your checks are done — send them for review'
          : 'Your checks are done — one step left',
      body: !agreement?.accepted
        ? rulesPending
          ? 'Accept the vendor service agreement, read how orders work, then submit your store for review.'
          : 'Accept the vendor service agreement, then submit your store for review.'
        : rulesPending
          ? 'Read how orders work and tick "I understand", then submit your store for review.'
          : 'Submit your store for review and we will take it from there.',
      action: { label: 'Finish verification', href: GET_VERIFIED },
    };
  }

  // Manual mode: the Qlozet team checks it by hand, so there is no session
  // to start — just details to send.
  if (state.mode === 'manual') {
    return {
      canSell,
      tone: 'warning',
      headline: 'Verify your store',
      body: canSell
        ? 'Send your CAC number and payout account to the Qlozet team to keep selling without interruption.'
        : 'Customers cannot see or order your products until your store is ' +
          'approved. Send your CAC number and payout account to the Qlozet team.',
      action: { label: 'Verify my store', href: GET_VERIFIED },
    };
  }

  // not_started / in_progress
  return {
    canSell,
    tone: 'warning',
    headline: canSell
      ? 'Finish verifying your store'
      : 'Your products are not visible to customers yet',
    body: canSell
      ? 'Complete the remaining checks to keep selling without interruption.'
      : 'Everything you add is saved, but customers cannot see or order it ' +
        'until your store is verified. It takes a few minutes.',
    action: {
      label:
        step === 'in_progress' ? 'Continue verification' : 'Verify my store',
      href: GET_VERIFIED,
    },
  };
}
