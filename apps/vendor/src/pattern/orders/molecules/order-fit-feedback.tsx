'use client';

// How a delivered made-to-fit piece fit, from the customer: the outcome and,
// when it wasn't perfect, where it was off in plain words ("Tight at the
// chest", "Sleeves too long"). Read-only; shown on completed orders.

import { Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FIT_OUTCOME_LABELS,
  fitIssueSentence,
  type FitFeedback,
} from '@/lib/garment-check';

export const OrderFitFeedback = ({
  feedback,
}: {
  feedback: FitFeedback | null | undefined;
}) => {
  if (!feedback?.fit) return null;
  const issues = feedback.issues ?? [];
  return (
    <section className="space-y-2 rounded-xl border bg-[hsla(0,0%,96%,1)] p-4 dark:bg-[#4A4949]">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold text-grey-black dark:text-white">
          <Shirt className="size-4 text-primary" />
          How it fit
        </h3>
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-[11px] font-medium',
            feedback.fit === 'perfect'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : feedback.fit === 'poor'
                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
          )}
        >
          {FIT_OUTCOME_LABELS[feedback.fit] ?? feedback.fit}
        </span>
      </div>
      {issues.length > 0 && (
        <p className="text-sm text-grey-black dark:text-white">
          {issues.map(fitIssueSentence).join(' · ')}
        </p>
      )}
      {feedback.comment && (
        <p className="text-sm text-grey3 dark:text-gray-300">
          “{feedback.comment}”
        </p>
      )}
    </section>
  );
};
