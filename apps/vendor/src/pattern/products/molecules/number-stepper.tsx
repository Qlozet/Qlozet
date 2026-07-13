'use client';

import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

// Compact −/value/+ stepper used in the Set Variants detail grid.
export const NumberStepper = ({ value, onChange, min = 0 }: NumberStepperProps) => (
  <div className="flex h-9 items-center justify-between rounded-md border border-input bg-accent dark:bg-muted px-2">
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="text-muted-foreground hover:text-foreground"
      aria-label="Decrease"
    >
      <Minus className="size-4" />
    </button>
    <span className="text-sm text-foreground">{value}</span>
    <button
      type="button"
      onClick={() => onChange(value + 1)}
      className="text-muted-foreground hover:text-foreground"
      aria-label="Increase"
    >
      <Plus className="size-4" />
    </button>
  </div>
);
