'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/lib/hooks/useClickOutside';

export interface StatusOption {
  label: string;
  value: string;
}

// `value: ''` clears the filter. Values match the backend's BusinessStatus.
const OPTIONS: StatusOption[] = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Awaiting verification', value: 'pending' },
  { label: 'Inactive', value: 'inactive' },
];

interface VendorStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Status filter for the Vendors table, matching the OrderStatusFilter pattern.
 *
 * `select-none` on the trigger and the list is deliberate: without it, clicking
 * the control drops a text caret into the label (the same artefact that showed
 * up on the rating stars) and dragging selects the option text.
 */
export const VendorStatusFilter = ({
  value,
  onChange,
}: VendorStatusFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Escape closes and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const selected = OPTIONS.find((option) => option.value === value);
  // The trigger reads as a label until something is chosen.
  const triggerLabel = selected?.value ? selected.label : "Vendor's status";

  return (
    <div className="relative select-none" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-10 w-[180px] items-center justify-between gap-2 rounded-lg border border-border bg-white dark:bg-muted px-4 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-muted/80 cursor-pointer',
          selected?.value
            ? 'text-grey-black dark:text-white'
            : 'text-gray-500 dark:text-gray-400'
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-500 dark:text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Filter by vendor status"
          className="absolute right-0 z-20 mt-1 w-[180px] overflow-hidden rounded-lg border border-border bg-white dark:bg-card py-1 shadow-lg"
        >
          {OPTIONS.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value || 'all'}
                role="option"
                aria-selected={isSelected}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-muted/80',
                    isSelected
                      ? 'font-medium text-grey-black dark:text-white'
                      : 'text-gray-700 dark:text-gray-200'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="size-4 shrink-0 text-success" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
