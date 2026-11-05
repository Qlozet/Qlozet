'use client';

// Manual verification — for while QoreID is not available to us.
//
// The vendor accepts the agreement, has a payout account linked and enters
// their CAC number; the Qlozet team checks the CAC register and the payout
// account name by hand, calls the owner and approves. When QoreID comes back,
// a manually approved vendor gets a date to finish the full checks by.

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  useSubmitManualVerificationMutation,
  type VerificationState,
} from '@/redux/services/verification/verification.api-slice';
import { readApiError } from '@/redux/services/types';
import { Card, SummaryRow } from './verification-card';
import { ServiceAgreementPanel } from './service-agreement-panel';
import { QoreIdSessionCard } from './qoreid-session-card';
import { formatLongDate } from './verification-status';

const PAYOUT_SETTINGS = '/settings?tab=payout';

const buttonCls =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50';

const payoutLine = (account: VerificationState['payout_account']) =>
  account
    ? [account.bank_name, account.account_name, `••${account.last4}`]
        .filter(Boolean)
        .join(' · ')
    : null;

const Step = ({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) => (
  <li className="flex items-start gap-3">
    {done ? (
      <CheckCircle2
        className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
        aria-hidden
      />
    ) : (
      <span
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-grey3/50 text-[11px] font-semibold text-grey2 dark:text-gray-400"
        aria-hidden
      >
        {n}
      </span>
    )}
    <div className="min-w-0 flex-1 space-y-3">
      <p className="text-sm font-semibold text-grey-black dark:text-white">
        {title}
      </p>
      {children}
    </div>
  </li>
);

/** The form: agreement, payout account, CAC number, submit. */
export const ManualVerificationCard = ({
  state,
}: {
  state: VerificationState;
}) => {
  const agreement = state.service_agreement;
  const payout = state.payout_account;
  // A resubmission (after "action required") starts from what they sent.
  const [rcNumber, setRcNumber] = useState(state.manual?.rc_number ?? '');
  const [submitManual, { isLoading }] = useSubmitManualVerificationMutation();
  const rc = rcNumber.trim();

  const submit = async () => {
    try {
      const res = await submitManual({ rc_number: rc }).unwrap();
      toast.success(
        res.data?.message ||
          'Submitted. The Qlozet team will check your details and call you.'
      );
    } catch (err) {
      toast.error(
        readApiError(err, 'Could not submit for review — try again.')
      );
    }
  };

  // Say which precondition is missing rather than leaving a grey button.
  const blocker = !agreement?.accepted
    ? 'Accept the agreement first.'
    : !payout
      ? 'Link your payout account first.'
      : !rc
        ? 'Enter your CAC number.'
        : null;

  return (
    <Card
      icon={UserCheck}
      title="Verify your business"
      tag="Required · checked by the Qlozet team"
      done={false}
      failed={state.verification_state === 'action_required'}
    >
      <div className="space-y-5">
        <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
          The Qlozet team checks your CAC number on the CAC register and the
          name on your payout account, then calls you. This usually takes up to
          2 working days.
        </p>

        {state.verification_message && (
          <div className="rounded-lg border border-amber-300/70 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-950/30">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
              {state.verification_message}
            </p>
          </div>
        )}

        <ol className="space-y-6">
          <Step
            n={1}
            title="Accept the vendor agreement"
            done={Boolean(agreement?.accepted)}
          >
            <ServiceAgreementPanel agreement={agreement} />
          </Step>

          <Step n={2} title="Link your payout account" done={Boolean(payout)}>
            {payout ? (
              <div className="space-y-2 rounded-lg bg-[#F8F9FA] p-4 dark:bg-muted/60">
                <SummaryRow label="Bank" value={payout.bank_name} />
                <SummaryRow label="Account name" value={payout.account_name} />
                <SummaryRow label="Account" value={`••${payout.last4}`} />
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
                Not linked yet.{' '}
                <Link
                  href={PAYOUT_SETTINGS}
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Add it in Settings → Payout
                </Link>
                , then come back here.
              </p>
            )}
            <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
              The account name your bank gives us is what we check.
            </p>
          </Step>

          <Step n={3} title="Enter your CAC number" done={false}>
            <Input
              className="h-11"
              placeholder="RC or BN number, such as RC1234567"
              value={rcNumber}
              onChange={(e) =>
                setRcNumber(e.target.value.toUpperCase().replace(/\s/g, ''))
              }
            />
          </Step>

          <Step n={4} title="Submit for review" done={false}>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={buttonCls}
                disabled={!state.can_submit_manual || !rc || isLoading}
                onClick={submit}
              >
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {isLoading ? 'Submitting…' : 'Submit for review'}
              </button>
              {blocker && (
                <span className="text-xs text-grey2 dark:text-gray-400">
                  {blocker}
                </span>
              )}
            </div>
          </Step>
        </ol>
      </div>
    </Card>
  );
};

/** What was sent for review, while it is with the team or once approved. */
export const ManualSubmissionSummary = ({
  state,
}: {
  state: VerificationState;
}) => {
  const approved = state.verification_state === 'approved';
  const rejected = state.verification_state === 'rejected';
  return (
    <Card
      icon={UserCheck}
      title={approved ? 'Approved by the Qlozet team' : 'Verify your business'}
      tag={
        approved
          ? 'Checked by hand · your products are visible to customers'
          : rejected
            ? 'Not approved'
            : 'Submitted · the Qlozet team is checking it'
      }
      done={!rejected}
      failed={rejected}
      doneLabel={approved ? 'Approved' : 'Submitted'}
    >
      <div className="space-y-2">
        <SummaryRow label="CAC number" value={state.manual?.rc_number} />
        <SummaryRow
          label="Payout account"
          value={payoutLine(state.payout_account)}
        />
        <SummaryRow
          label="Submitted"
          value={formatLongDate(state.manual?.submitted_at)}
        />
      </div>
    </Card>
  );
};

/**
 * A manually approved vendor, once QoreID is back: finish the full checks by
 * the date, or the store is paused. With no date yet (still manual mode), a
 * quiet note that the checks will come.
 */
export const FinishVerificationCard = ({
  state,
  attemptsLeft,
}: {
  state: VerificationState;
  attemptsLeft: number;
}) => {
  const due = formatLongDate(state.full_verification_due_at);
  const agreement = state.service_agreement;

  if (!due) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-border bg-[#F8F9FA] p-4 dark:bg-muted/40">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brown3" />
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
            When identity checks open, we will ask you to complete them. You can
            keep selling as you are until then.
          </p>
          {!agreement?.accepted && (
            <ServiceAgreementPanel agreement={agreement} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-amber-300/70 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/30">
      <div className="flex items-start gap-3 px-5 py-4">
        <CalendarClock className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-grey-black dark:text-white">
            Finish your verification by {due}
          </p>
          <p className="mt-1 text-sm text-grey2 dark:text-gray-400">
            Identity checks are open again. You can keep selling until {due}.
            After that your products are hidden from customers until you finish.
          </p>
        </div>
      </div>

      <div className="space-y-5 border-t border-amber-300/50 bg-white px-5 py-5 dark:border-amber-500/20 dark:bg-card">
        {state.verification_message && (
          <div className="rounded-lg border border-amber-300/70 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-950/30">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
              {state.verification_message}
            </p>
          </div>
        )}

        {state.workflow_available ? (
          <QoreIdSessionCard
            canStart={Boolean(state.can_start)}
            attemptsLeft={attemptsLeft}
          />
        ) : (
          <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
            The checks are not open on this page yet. Contact support if your
            date is close.
          </p>
        )}

        {/* Starting a run needs the agreement in force, so show it right
            here rather than send them hunting for it. */}
        {!agreement?.accepted && (
          <ServiceAgreementPanel agreement={agreement} />
        )}
      </div>
    </div>
  );
};
