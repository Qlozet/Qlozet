'use client';

import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

// Lightweight controlled checkbox styled to match the Figma (brown when checked).
// Kept dependency-free rather than pulling in @radix-ui/react-checkbox for one screen.
const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onCheckedChange, disabled, className, ...props }, ref) => (
    <button
      ref={ref}
      type='button'
      role='checkbox'
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'flex size-5 items-center justify-center rounded-[5px] border transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-white hover:border-primary/50',
        className
      )}
      {...props}
    >
      {checked && <Check className='size-3.5' strokeWidth={3} />}
    </button>
  )
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
