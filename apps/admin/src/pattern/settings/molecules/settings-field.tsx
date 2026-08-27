'use client';

// Settings Field - Molecule
// One row of the settings catalogue, rendered from its spec: a number with the
// right adornment, a select, or a switch.

import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SettingsFieldSpec, SettingsUnit } from '../lib/settings-tabs';
import type { DraftValue } from '../lib/settings-form';

// Naira and dollars read before the number; everything else reads after it.
const PREFIX_UNITS: Partial<Record<SettingsUnit, string>> = {
  naira: '₦',
  usd: '$',
};

const SUFFIX_UNITS: Partial<Record<SettingsUnit, string>> = {
  percent: '%',
  days: 'days',
  hours: 'hours',
  units: 'units',
  yards: 'yards',
  tokens: 'tokens',
};

interface SettingsFieldProps {
  spec: SettingsFieldSpec;
  value: DraftValue;
  error?: string;
  disabled?: boolean;
  /** False when a sibling field has switched this one out of use. */
  isActive?: boolean;
  onChange: (value: DraftValue) => void;
}

export const SettingsField = ({
  spec,
  value,
  error,
  disabled,
  isActive = true,
  onChange,
}: SettingsFieldProps) => {
  const id = useId();
  const describedBy = `${id}-help`;

  // A switch is a decision, not a value to fill in — it reads as a row with the
  // control at the end rather than a labelled input.
  if (spec.kind === 'switch') {
    return (
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3.5 sm:col-span-2">
        <div className="space-y-1">
          <label
            htmlFor={id}
            className="text-sm font-medium text-grey-black dark:text-white"
          >
            {spec.label}
          </label>
          <p id={describedBy} className="text-xs text-grey3 dark:text-gray-400">
            {spec.help}
          </p>
        </div>
        <Switch
          id={id}
          checked={Boolean(value)}
          disabled={disabled}
          aria-describedby={describedBy}
          onCheckedChange={(checked) => onChange(checked)}
        />
      </div>
    );
  }

  const prefix = spec.unit ? PREFIX_UNITS[spec.unit] : undefined;
  const suffix = spec.unit ? SUFFIX_UNITS[spec.unit] : undefined;

  return (
    <div className={cn('space-y-1.5', !isActive && 'opacity-60')}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-grey-black dark:text-white"
      >
        {spec.label}
      </label>

      {spec.kind === 'select' ? (
        <Select
          value={String(value)}
          disabled={disabled}
          onValueChange={(next) => onChange(next)}
        >
          <SelectTrigger id={id} aria-describedby={describedBy}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {spec.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="relative">
          {prefix && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-grey3 dark:text-gray-400"
            >
              {prefix}
            </span>
          )}
          <Input
            id={id}
            // `inputMode` keeps a numeric keypad on mobile without `type=number`'s
            // scroll-wheel edits and locale-dependent decimal handling.
            type="text"
            inputMode="decimal"
            value={String(value)}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            className={cn(
              prefix && 'pl-7',
              suffix && 'pr-16',
              error && 'border-error focus-visible:ring-error'
            )}
          />
          {suffix && (
            <span
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-grey3 dark:text-gray-400"
            >
              {suffix}
            </span>
          )}
        </div>
      )}

      <p id={describedBy} className="text-xs text-grey3 dark:text-gray-400">
        {spec.help}
      </p>
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
};
