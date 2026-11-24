'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  /** Allow a fraction such as 2.5 (yards). Off for counts such as stock. */
  decimals?: boolean;
  'aria-label'?: string;
}

const toText = (n: number) => (Number.isFinite(n) && n !== 0 ? String(n) : '');

// Compact −/value/+ stepper used in the Set Variants detail grid. The number
// in the middle is a real input, so a vendor can type 40 instead of tapping.
export const NumberStepper = ({
  value,
  onChange,
  min = 0,
  decimals = false,
  'aria-label': ariaLabel,
}: NumberStepperProps) => {
  // Text being typed, kept apart from the number so "2." or an empty box
  // can sit there mid-edit without snapping back.
  const [text, setText] = useState(toText(value));

  useEffect(() => {
    setText((current) =>
      Number(current || 0) === value ? current : toText(value)
    );
  }, [value]);

  const pattern = decimals ? /^\d*\.?\d*$/ : /^\d*$/;

  const commit = (next: number) => {
    const clean = Math.max(
      min,
      decimals ? Math.round(next * 100) / 100 : Math.round(next)
    );
    setText(toText(clean));
    onChange(clean);
  };

  return (
    <div className="flex h-9 items-center justify-between gap-1 rounded-md border border-input bg-accent dark:bg-muted px-2">
      <button
        type="button"
        onClick={() => commit((value || 0) - 1)}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </button>
      <input
        type="text"
        inputMode={decimals ? 'decimal' : 'numeric'}
        value={text}
        placeholder="0"
        aria-label={ariaLabel}
        onChange={(e) => {
          const raw = e.target.value.replace(',', '.');
          if (!pattern.test(raw)) return;
          setText(raw);
          const n = Number(raw);
          if (raw !== '' && raw !== '.' && Number.isFinite(n))
            onChange(Math.max(min, n));
          else onChange(min);
        }}
        onBlur={() => commit(Number(text) || 0)}
        onFocus={(e) => e.target.select()}
        className="w-full min-w-0 bg-transparent text-center text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={() => commit((value || 0) + 1)}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
};
