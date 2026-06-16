'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

// Small +/- number stepper used by the Add Fabric form (Yards/Length, Width,
// Min Cut). Clamps to [min, max].
export const StepperField = ({
  label,
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  className,
}: StepperFieldProps) => {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step))}
          className="flex size-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          disabled={value <= min}
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-[24px] text-center text-sm text-gray-900">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(clamp(value + step))}
          className="flex size-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          disabled={value >= max}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
};
