'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { ORDER_STATUS_OPTIONS } from '@/lib/orders';

const OPTIONS = [{ label: 'Filter By :', value: '' }, ...ORDER_STATUS_OPTIONS];

interface OrderStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

// Delivery-status filter for the Orders table, mirroring the vendor status
// filter used on the Vendors page.
export const OrderStatusFilter = ({
  value,
  onChange,
}: OrderStatusFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const selected = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-[160px] items-center justify-between gap-2 rounded-lg border border-border bg-white px-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-500 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-1 w-[180px] overflow-hidden rounded-lg border border-border bg-white py-1 shadow-lg">
          {OPTIONS.map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <span>{option.value ? option.label : 'All statuses'}</span>
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
