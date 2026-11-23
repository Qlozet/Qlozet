'use client';

import { Check, Gem, Ruler, Scissors, Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * What a store sells. Same values as the backend's offerings.ts; it never
 * limits what the store can list. Ticking made to measure turns on bespoke
 * requests, leaving it out turns them off (the backend does that).
 */
export const OFFERING_OPTIONS = [
  {
    value: 'made_to_measure',
    label: 'Made to measure',
    hint: "Clothes cut to a customer's measurements, including bespoke designs.",
    Icon: Scissors,
  },
  {
    value: 'ready_to_wear',
    label: 'Ready to wear',
    hint: 'Finished clothes in set sizes.',
    Icon: Shirt,
  },
  {
    value: 'fabric',
    label: 'Fabric',
    hint: 'Fabric by the yard or by the piece.',
    Icon: Ruler,
  },
  {
    value: 'accessories',
    label: 'Accessories',
    hint: 'Bags, caps, jewellery and other add-ons.',
    Icon: Gem,
  },
] as const;

export type Offering = (typeof OFFERING_OPTIONS)[number]['value'];

export const offeringLabel = (value: string) =>
  OFFERING_OPTIONS.find((o) => o.value === value)?.label ?? value;

interface OfferingsPickerProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  /** Two columns from small screens up (the prompt); one row of four is too tight. */
  className?: string;
}

export const OfferingsPicker = ({
  value,
  onChange,
  disabled,
  className,
}: OfferingsPickerProps) => {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div
      role="group"
      aria-label="What you sell"
      className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3', className)}
    >
      {OFFERING_OPTIONS.map(({ value: v, label, hint, Icon }) => {
        const on = value.includes(v);
        return (
          <button
            key={v}
            type="button"
            id={`offering-${v}`}
            role="checkbox"
            aria-checked={on}
            disabled={disabled}
            onClick={() => toggle(v)}
            className={cn(
              'relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-60',
              on
                ? 'border-[#3d2817] bg-[#3d2817]/[0.04] dark:border-white dark:bg-white/[0.06]'
                : 'border-border hover:border-foreground/30'
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                on
                  ? 'bg-[#3d2817] text-white dark:bg-white dark:text-black'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1 pr-6">
              <span className="block text-sm font-semibold text-foreground">
                {label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {hint}
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                'absolute right-3 top-3 flex size-5 items-center justify-center rounded-md border',
                on
                  ? 'border-[#3d2817] bg-[#3d2817] text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-border'
              )}
            >
              {on && <Check className="size-3.5" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
};
