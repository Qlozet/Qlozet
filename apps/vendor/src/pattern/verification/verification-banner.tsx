'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, Info, ShieldCheck } from 'lucide-react';
import { useGetVerificationQuery } from '@/redux/services/verification/verification.api-slice';
import { summariseVerification } from './verification-status';

const TONE = {
  warning: {
    wrap: 'border-amber-300/70 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  danger: {
    wrap: 'border-destructive/40 bg-destructive/5',
    icon: 'text-destructive',
    Icon: AlertTriangle,
  },
  info: {
    wrap: 'border-blue-300/70 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-400',
    Icon: Clock,
  },
  success: {
    wrap: 'border-emerald-300/70 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-950/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    Icon: ShieldCheck,
  },
} as const;

/**
 * Why a vendor's products are not visible.
 *
 * Products from an unverified vendor are saved, can be marked active, and are
 * filtered out of every customer-facing query — so without this the store
 * looks broken rather than unfinished, and the vendor's first move is a
 * support ticket. Renders nothing once they are approved and trading.
 */
export const VerificationBanner = () => {
  const { data } = useGetVerificationQuery();
  const summary = summariseVerification(data?.data);

  if (!summary) return null;

  const tone = TONE[summary.tone] ?? TONE.info;
  const { Icon } = tone;

  return (
    <div
      role="status"
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${tone.wrap}`}
    >
      <Icon className={`size-5 shrink-0 ${tone.icon}`} aria-hidden />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {summary.headline}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{summary.body}</p>
      </div>

      {summary.action && (
        <Link
          href={summary.action.href}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {summary.action.label}
        </Link>
      )}
    </div>
  );
};
