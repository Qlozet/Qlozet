'use client';

import Link from 'next/link';
import { Check, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  type SetupStepKey,
  useDismissSetupStepsMutation,
  useGetSetupStepsQuery,
} from '@/redux/services/settings/settings.api-slice';
import { readApiError } from '@/redux/services/types';
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
import { cn } from '@/lib/utils';

/** What each step says and where it goes. Order comes from the backend. */
const STEP_COPY: Record<
  SetupStepKey,
  { title: string; hint: string; href: string; ownerOnly?: boolean }
> = {
  store_details: {
    title: 'Add your logo and store description',
    hint: 'Shoppers see these first on your store page.',
    href: '/settings?tab=profile',
  },
  payout: {
    title: 'Add the bank account you get paid into',
    hint: 'Your earnings are paid here 14 days after each payment.',
    href: '/settings?tab=payout',
    ownerOnly: true,
  },
  made_to_measure_listing: {
    title: 'Add a made-to-measure piece',
    hint: "A style you cut to the customer's measurements.",
    href: '/products/add-product?mode=made_to_measure',
  },
  ready_to_wear_listing: {
    title: 'Add a ready-to-wear piece',
    hint: 'A finished item with the sizes you stock.',
    href: '/products/add-product',
  },
  fabric_listing: {
    title: 'Add your first fabric',
    hint: 'Sold by the yard, by the piece, or both.',
    href: '/products/fabrics?add=1',
  },
  accessory_listing: {
    title: 'Add your first accessory',
    hint: 'With its colours and sizes, if it has them.',
    href: '/products/accessories?add=1',
  },
};

/**
 * "Get your store ready": the first steps for what this store sells. Each
 * step ticks itself off when the real thing exists (the backend checks), so
 * there is nothing to tick by hand. Gone once everything is done or the
 * vendor hides it.
 */
export const SetupStepsCard = () => {
  const activeBusiness = useAppSelector(selectActiveBusiness);
  const isOwner = activeBusiness
    ? activeBusiness.is_owner || activeBusiness.role?.toLowerCase() === 'owner'
    : true;
  const { data } = useGetSetupStepsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [dismiss, { isLoading: hiding }] = useDismissSetupStepsMutation();

  if (!data || !data.offerings_answered || data.dismissed || data.done) {
    return null;
  }

  const steps = data.steps.filter(
    (s) => isOwner || !STEP_COPY[s.key]?.ownerOnly
  );
  const doneCount = steps.filter((s) => s.done).length;

  const hide = async () => {
    try {
      await dismiss().unwrap();
    } catch (error) {
      toast.error(readApiError(error, 'Could not hide this. Try again.'));
    }
  };

  return (
    <section
      aria-labelledby="setup-steps-title"
      className="surface-card p-5 lg:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2
            id="setup-steps-title"
            className="text-base font-semibold text-foreground"
          >
            Get your store ready
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {doneCount} of {steps.length} done. Each step ticks itself off when
            it's finished.
          </p>
        </div>
        <button
          type="button"
          onClick={hide}
          disabled={hiding}
          aria-label="Hide these steps"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <X className="size-4" />
        </button>
      </div>

      <div
        className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${(doneCount / Math.max(steps.length, 1)) * 100}%` }}
        />
      </div>

      <ul className="divide-y divide-border/60">
        {steps.map(({ key, done }) => {
          const copy = STEP_COPY[key];
          if (!copy) return null;
          const body = (
            <>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border',
                  done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-border'
                )}
              >
                {done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block text-sm font-medium',
                    done
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  )}
                >
                  {copy.title}
                </span>
                {!done && (
                  <span className="block text-xs text-muted-foreground">
                    {copy.hint}
                  </span>
                )}
              </span>
              {!done && (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              )}
            </>
          );
          return (
            <li key={key}>
              {done ? (
                <div className="flex items-center gap-3 py-3">{body}</div>
              ) : (
                <Link
                  href={copy.href}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/60"
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
