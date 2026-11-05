'use client';

// Manual Verification Panel - Molecule
// What a vendor verified by hand gave us, laid out for the reviewer to check:
// the CAC number with a way to the public register, and the payout account
// name beside the business and owner names it has to match. With `onToggle`
// it is the reviewer's checklist (in the decision modal); without, it shows
// what has been ticked so far (on the vendor page).

import { Check, ExternalLink, Minus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  CAC_SEARCH_URL,
  MANUAL_CHECKS,
  MANUAL_CHECK_LABELS,
  type ManualCheck,
  type ManualChecks,
  type ManualSubmission,
} from '@/lib/manual-verification';

interface ManualVerificationPanelProps {
  submission: ManualSubmission;
  businessName?: string;
  ownerName?: string;
  /** Defaults to what is saved on the submission. */
  checks?: ManualChecks;
  onToggle?: (check: ManualCheck, value: boolean) => void;
  note?: string;
  onNoteChange?: (value: string) => void;
  disabled?: boolean;
}

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="min-w-0">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="truncate text-sm font-medium text-foreground">
      {value || '—'}
    </dd>
  </div>
);

export const ManualVerificationPanel = ({
  submission,
  businessName,
  ownerName,
  checks = submission.checks,
  onToggle,
  note,
  onNoteChange,
  disabled,
}: ManualVerificationPanelProps) => {
  const editable = Boolean(onToggle);
  const account = [
    submission.payoutAccountName,
    [
      submission.payoutBankName,
      submission.payoutAccountLast4
        ? `••${submission.payoutAccountLast4}`
        : null,
    ]
      .filter(Boolean)
      .join(' '),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section
      aria-label="Checked by hand"
      className="space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Checked by hand
        </h3>
        <p className="text-xs text-muted-foreground">
          Submitted without the QoreID checks. Confirm each point yourself
          before approving.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">CAC number</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-sm font-semibold text-foreground">
            {submission.rcNumber ?? '—'}
          </span>
          <a
            href={CAC_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Search this number on the CAC register
            <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
      </div>

      {/* Side by side so the reviewer compares, rather than remembers. */}
      <dl className="grid grid-cols-1 gap-3 rounded-lg bg-muted/50 p-3 sm:grid-cols-3">
        <Field label="Payout account" value={account} />
        <Field label="Business name" value={businessName} />
        <Field label="Owner" value={ownerName} />
      </dl>

      <ul className="space-y-2.5">
        {MANUAL_CHECKS.map((check) => (
          <li key={check}>
            {editable ? (
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground">
                <Checkbox
                  checked={checks[check]}
                  disabled={disabled}
                  onCheckedChange={(value) => onToggle?.(check, value)}
                  className="mt-0.5 shrink-0"
                />
                <span>{MANUAL_CHECK_LABELS[check]}</span>
              </label>
            ) : (
              <div className="flex items-start gap-2.5 text-sm">
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[5px] border',
                    checks[check]
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {checks[check] ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : (
                    <Minus className="size-3.5" />
                  )}
                </span>
                <span
                  className={
                    checks[check] ? 'text-foreground' : 'text-muted-foreground'
                  }
                >
                  {MANUAL_CHECK_LABELS[check]}
                  <span className="sr-only">
                    {checks[check] ? ' (checked)' : ' (not checked yet)'}
                  </span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {onNoteChange ? (
        <div className="space-y-1.5">
          <label
            htmlFor="manual-verification-note"
            className="text-sm font-medium text-foreground"
          >
            What you found (optional, internal)
          </label>
          <Textarea
            id="manual-verification-note"
            value={note ?? ''}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="e.g. RC1234567 is registered to Ada Stitches Ltd; called the owner on 0803… and she confirmed."
            rows={3}
            disabled={disabled}
          />
        </div>
      ) : submission.note ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Reviewer note: </span>
          {submission.note}
        </p>
      ) : null}
    </section>
  );
};
