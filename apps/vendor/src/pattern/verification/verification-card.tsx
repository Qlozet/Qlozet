import { BadgeCheck, ShieldCheck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// The card shell and summary row every Get Verified step uses.

export const Card = ({
  icon: Icon,
  title,
  tag,
  done,
  failed,
  doneLabel = 'Verified',
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  tag: string;
  done: boolean;
  failed?: boolean;
  /** Badge text when done — "Submitted" reads better than "Verified" for a
   *  step the Qlozet team has yet to check. */
  doneLabel?: string;
  children: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-xl border border-border bg-white custom-card-shadow dark:bg-card">
    <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brown3/10 text-brown3">
          <Icon className="size-[18px]" />
        </span>
        <div>
          <p className="text-sm font-bold text-grey-black dark:text-white">
            {title}
          </p>
          <p className="text-[11px] text-grey2 dark:text-gray-400">{tag}</p>
        </div>
      </div>
      {done ? (
        <Badge className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300">
          <BadgeCheck className="size-3" /> {doneLabel}
        </Badge>
      ) : failed ? (
        <Badge className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-50 dark:bg-red-950 dark:text-red-300">
          <XCircle className="size-3" /> Failed — try again
        </Badge>
      ) : null}
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

export const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) =>
  value ? (
    <div className="flex items-center justify-between text-sm">
      <span className="text-grey2 dark:text-gray-400">{label}</span>
      <span className="font-medium text-grey-black dark:text-white">
        {value}
      </span>
    </div>
  ) : null;
