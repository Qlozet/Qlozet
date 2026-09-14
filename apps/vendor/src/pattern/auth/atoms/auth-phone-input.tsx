'use client';

import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Phone input with a dial-code dropdown, mirroring the shop's PhoneField.
// The FORM FIELD keeps holding one combined string ("+2348031234567"), so
// the zod schema and the submit payload are unchanged — this component just
// splits/joins it for editing. Typing a leading 0 (the local Nigerian habit)
// is stripped automatically, so "+2340803…" can never be submitted.

const DIAL_CODES = [
  { c: 'NG', flag: '🇳🇬', dial: '+234' },
  { c: 'GH', flag: '🇬🇭', dial: '+233' },
  { c: 'KE', flag: '🇰🇪', dial: '+254' },
  { c: 'ZA', flag: '🇿🇦', dial: '+27' },
  { c: 'EG', flag: '🇪🇬', dial: '+20' },
  { c: 'UG', flag: '🇺🇬', dial: '+256' },
  { c: 'TZ', flag: '🇹🇿', dial: '+255' },
  { c: 'US', flag: '🇺🇸', dial: '+1' },
  { c: 'GB', flag: '🇬🇧', dial: '+44' },
  { c: 'FR', flag: '🇫🇷', dial: '+33' },
  { c: 'AE', flag: '🇦🇪', dial: '+971' },
  { c: 'IN', flag: '🇮🇳', dial: '+91' },
];

const DEFAULT_DIAL = '+234';

/** Split a stored "+<dial><local>" value back into its two edit parts. */
const splitValue = (value: string): { dial: string; local: string } => {
  const v = (value ?? '').trim();
  // Longest dial first so +234 wins over +2.
  const match = [...DIAL_CODES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((d) => v.startsWith(d.dial));
  if (match) return { dial: match.dial, local: v.slice(match.dial.length) };
  return { dial: DEFAULT_DIAL, local: v.replace(/^\+/, '') };
};

const cleanLocal = (raw: string): string =>
  raw
    .replace(/\D/g, '') // digits only
    .replace(/^0+/, '') // drop the local leading zero(es)
    .slice(0, 12);

interface AuthPhoneInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export const AuthPhoneInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder = '803 123 4567',
  disabled = false,
  className = '',
  description,
}: AuthPhoneInputProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const { dial, local } = splitValue(String(field.value ?? ''));
        const commit = (nextDial: string, nextLocal: string) =>
          field.onChange(nextLocal ? `${nextDial}${nextLocal}` : '');
        return (
          <FormItem className={cn('space-y-2', className)}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <select
                  value={dial}
                  disabled={disabled}
                  onChange={(e) => commit(e.target.value, local)}
                  aria-label="Country dial code"
                  className="h-12 shrink-0 cursor-pointer rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-card [&>option]:dark:bg-card"
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d.c} value={d.dial}>
                      {d.flag} {d.dial}
                    </option>
                  ))}
                </select>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={local}
                  disabled={disabled}
                  placeholder={placeholder}
                  onChange={(e) => commit(dial, cleanLocal(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  className="flex-1"
                />
              </div>
            </FormControl>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
