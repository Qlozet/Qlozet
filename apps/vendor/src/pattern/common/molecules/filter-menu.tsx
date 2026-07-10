'use client';

// Reusable "Filter menu" popover: a trigger that reads "Filter By : <selected>"
// and a popover of single-select options. Generic over the value union so each
// caller keeps its own typed options (see transaction-filter-menu.tsx).

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterOption<T extends string = string> {
  label: string;
  value: T;
}

interface FilterMenuProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Prefix shown before the selected label (default "Filter By :"). */
  label?: string;
  /** Heading rendered inside the popover (default "Filter menu"). */
  menuTitle?: string;
  align?: 'start' | 'center' | 'end';
  triggerClassName?: string;
  contentClassName?: string;
}

export function FilterMenu<T extends string>({
  options,
  value,
  onChange,
  label = 'Filter By :',
  menuTitle = 'Filter menu',
  align = 'start',
  triggerClassName,
  contentClassName,
}: FilterMenuProps<T>) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  const handleSelect = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className={cn('h-10 w-10 sm:w-auto px-0 sm:px-4 gap-2 text-sm text-gray-600 dark:text-gray-300 shrink-0', triggerClassName)}
        >
          <SlidersHorizontal className='size-4 sm:hidden' />
          <span className='hidden sm:inline'>
            {label}
            {selectedLabel ? ` ${selectedLabel}` : ''}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className={cn('w-56 p-0', contentClassName)}>
        <p className='px-4 py-3 text-xs text-muted-foreground'>{menuTitle}</p>
        <ul className='border-t'>
          {options.map((option) => (
            <li key={option.value} className='border-b last:border-b-0'>
              <button
                type='button'
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full cursor-pointer px-4 py-3 text-left text-sm text-grey-black dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                  value === option.value && 'font-semibold text-primary'
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
