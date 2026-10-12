'use client';

import { Check, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_RANGE_OPTIONS,
  dashboardRangeOption,
} from '../lib/dashboard-range';
import { useDashboardRange } from '../lib/use-dashboard-range';

/**
 * The dashboard's time window, top right of the page: a square clock button
 * with the current choice written beside it, opening the four presets. One
 * control for the whole page - every chart and every change badge follows it.
 */
export const DashboardRangeControl = () => {
  const [range, setRange] = useDashboardRange();
  const current = dashboardRangeOption(range);

  return (
    <DropdownMenu>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {current.label}
          <span className="hidden sm:inline"> · {current.hint}</span>
        </span>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Time range: ${current.label}. Change`}
            className={cn(
              'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors',
              'hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted'
            )}
          >
            <Clock className="h-[18px] w-[18px]" />
          </button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Show the last
        </DropdownMenuLabel>
        {DASHBOARD_RANGE_OPTIONS.map((option) => {
          const selected = option.key === range;
          return (
            <DropdownMenuItem
              key={option.key}
              onSelect={() => setRange(option.key)}
              aria-checked={selected}
              role="menuitemradio"
              className={cn(
                'flex cursor-pointer items-center justify-between',
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
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
