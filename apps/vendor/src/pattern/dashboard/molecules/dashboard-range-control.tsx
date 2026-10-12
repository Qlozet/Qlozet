'use client';

import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_RANGE_OPTIONS,
  dashboardRangeOption,
} from '../lib/dashboard-range';
import { useDashboardRange } from '../lib/use-dashboard-range';

/**
 * The dashboard's time window, top right of the page: a square clock button
 * with the current choice written beside it, opening the four presets. One
 * control for the whole page - every chart and stat card follows it.
 */
export const DashboardRangeControl = () => {
  const [range, setRange] = useDashboardRange();
  const [open, setOpen] = useState(false);
  const current = dashboardRangeOption(range);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {current.label}
          <span className="hidden sm:inline"> · {current.hint}</span>
        </span>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Time range: ${current.label}. Change`}
            aria-haspopup="menu"
            aria-expanded={open}
            className={cn(
              'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors',
              'hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              open && 'bg-muted'
            )}
          >
            <Clock className="h-[18px] w-[18px]" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" sideOffset={8} className="w-56 p-1.5">
        <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Show the last
        </p>
        <ul role="menu" className="space-y-0.5">
          {DASHBOARD_RANGE_OPTIONS.map((option) => {
            const selected = option.key === range;
            return (
              <li key={option.key} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setRange(option.key);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted',
                    selected && 'bg-muted font-medium'
                  )}
                >
                  <span>
                    {option.label}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  </span>
                  {selected && <Check className="h-4 w-4 text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
