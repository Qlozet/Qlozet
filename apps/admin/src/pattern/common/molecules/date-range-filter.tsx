'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DateRange {
  /** ISO date (YYYY-MM-DD) or '' when unset. */
  start: string;
  end: string;
}

export const EMPTY_DATE_RANGE: DateRange = { start: '', end: '' };

/**
 * Convert the picker's plain 'YYYY-MM-DD' values into the full ISO instants the
 * API expects.
 *
 * The backend compares these against `createdAt` as timestamps, so sending a
 * bare date as `end_date` pins it to midnight and drops every ticket created
 * later that day — filtering to a single day returned nothing at all. Verified
 * against GET /admin/tickets: `start=2026-08-07&end=2026-08-07` matched 0 rows,
 * the same day expanded to end-of-day matched 1.
 */
export const toStartIso = (date: string): string | undefined =>
  date ? `${date}T00:00:00.000Z` : undefined;

export const toEndIso = (date: string): string | undefined =>
  date ? `${date}T23:59:59.999Z` : undefined;

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
}

// "Filter By Date" control: a small popover with From/To inputs that reports an
// ISO date range. Kept dependency-free (native date inputs) since the admin app
// doesn't bundle a calendar library.
export const DateRangeFilter = ({
  value,
  onChange,
  className,
}: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-seed the draft whenever the popover opens so a cancelled edit is lost.
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const active = Boolean(value.start || value.end);
  const label = active
    ? `${value.start || 'Any'} → ${value.end || 'Any'}`
    : 'Filter By Date';

  // Guard against an inverted range — the API would return nothing.
  const invalid = Boolean(draft.start && draft.end && draft.start > draft.end);

  const apply = () => {
    if (invalid) return;
    onChange(draft);
    setOpen(false);
  };

  const clear = () => {
    onChange(EMPTY_DATE_RANGE);
    setDraft(EMPTY_DATE_RANGE);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative shrink-0', className)}>
      {/* Icon-only below `sm` so the toolbar stays on one row on mobile. */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          'h-10 w-10 shrink-0 gap-2 px-0 text-sm text-gray-600 sm:w-auto sm:px-4',
          active && 'border-primary text-grey-black'
        )}
      >
        <span className="relative flex items-center sm:hidden">
          <SlidersHorizontal className="size-4" />
          {active && (
            <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-primary" />
          )}
        </span>

        <span className="hidden items-center gap-2 sm:flex">
          <Calendar className="size-4" />
          {label}
          {active && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date filter"
              onClick={(event) => {
                event.stopPropagation();
                clear();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  clear();
                }
              }}
              className="ml-1 flex size-4 items-center justify-center rounded-full text-grey3 hover:bg-gray-200"
            >
              <X className="size-3" />
            </span>
          )}
        </span>
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Filter by date"
          className="absolute left-0 z-50 mt-2 w-70 max-w-[calc(100vw-3rem)] rounded-xl border border-border bg-white p-4 shadow-xl sm:left-auto sm:right-0"
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="date-range-start"
                className="text-xs font-medium text-grey3"
              >
                From
              </label>
              <Input
                id="date-range-start"
                type="date"
                value={draft.start}
                max={draft.end || undefined}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, start: event.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="date-range-end"
                className="text-xs font-medium text-grey3"
              >
                To
              </label>
              <Input
                id="date-range-end"
                type="date"
                value={draft.end}
                min={draft.start || undefined}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, end: event.target.value }))
                }
              />
            </div>

            {invalid && (
              <p className="text-xs text-error">
                The end date can&apos;t be before the start date.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={clear}>
                Clear
              </Button>
              <Button type="button" onClick={apply} disabled={invalid}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
