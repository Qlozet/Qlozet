'use client';

import React, { useState } from 'react';
import {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  OTHER_COUNTRIES,
  POPULAR_COUNTRIES,
  countryOf,
  joinPhone,
  readTyped,
  splitPhone,
} from '@/lib/phone-number';

// Phone input: a country picker (every country, the common ones first) and
// the local number. The FORM FIELD holds one combined string
// ("+2348031234567"); this splits and joins it for editing. A leading 0 is
// dropped, and a pasted or autofilled full number ("+234 803 123 4567")
// picks its own country instead of doubling the code.

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

function PhoneBox({
  field,
  placeholder,
  disabled,
}: {
  field: ControllerRenderProps<any, any>;
  placeholder: string;
  disabled: boolean;
}) {
  const value = String(field.value ?? '');
  // The chosen country lives here too: with nothing typed yet the field is
  // empty, and several countries share a code (+1, +44).
  const [chosen, setChosen] = useState(() => splitPhone(value).iso);
  const { iso, local } = splitPhone(value, chosen);
  const country = countryOf(iso);

  const commit = (nextIso: string, nextLocal: string) => {
    setChosen(nextIso as typeof chosen);
    field.onChange(joinPhone(nextIso, nextLocal));
  };

  return (
    <div className="flex gap-2">
      {/* The native select does the picking (type-ahead, the phone's own
          list); the chip on top just shows the flag and code compactly. */}
      <div className="relative h-12 shrink-0">
        <div
          aria-hidden
          className="flex h-full items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm text-foreground dark:bg-card"
        >
          <span>{country.flag}</span>
          <span className="tabular-nums">{country.dial}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </div>
        <select
          value={iso}
          disabled={disabled}
          onChange={(e) => commit(e.target.value, local)}
          aria-label="Country"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [&>optgroup>option]:dark:bg-card"
        >
          <optgroup label="Common">
            {POPULAR_COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.flag} {c.name} ({c.dial})
              </option>
            ))}
          </optgroup>
          <optgroup label="All countries">
            {OTHER_COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.flag} {c.name} ({c.dial})
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      <Input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={local}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          const next = readTyped(e.target.value, iso);
          commit(next.iso, next.local);
        }}
        onBlur={field.onBlur}
        name={field.name}
        className="flex-1"
      />
    </div>
  );
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
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <PhoneBox
              field={field}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
