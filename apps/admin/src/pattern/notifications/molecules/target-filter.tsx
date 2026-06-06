'use client';

import { useState } from 'react';
import { Check, ChevronDown, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import {
  TARGET_OPTIONS,
  type NotificationTarget,
} from '../data/notification-catalog';

// '' means "all targets".
export type TargetFilterValue = NotificationTarget | '';

interface TargetFilterProps {
  value: TargetFilterValue;
  onChange: (value: TargetFilterValue) => void;
}

const OPTIONS: { label: string; value: TargetFilterValue }[] = [
  { label: 'All Targets', value: '' },
  ...TARGET_OPTIONS,
];

// "Filter By Target" dropdown — mirrors the VendorStatusFilter styling.
export const TargetFilter = ({ value, onChange }: TargetFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const selected = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-grey3 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <ListFilter className="size-4 shrink-0 text-grey3" />
        <span className="truncate">
          {value ? selected.label : 'Filter By Target'}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-500 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-[180px] overflow-hidden rounded-lg border border-border bg-white py-1 shadow-lg">
          {OPTIONS.map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span>{option.label}</span>
              {option.value === value && (
                <Check className="size-4 text-success" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
