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

  // Nothing to say to a vendor who is already trading.
  if (canSell && state.verification_state === 'approved') return null;

  const step: VerificationStep = state.verification_state ?? 'not_started';
  const agreement = state.service_agreement;

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
      headline: agreement?.accepted
        ? 'Your checks are done — send them for review'
        : 'Your checks are done — one step left',
      body: agreement?.accepted
        ? 'Submit your store for review and we will take it from there.'
        : 'Accept the vendor service agreement, then submit your store for review.',
      action: { label: 'Finish verification', href: GET_VERIFIED },
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
