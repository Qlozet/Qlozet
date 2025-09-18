'use client';

import React, { useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps<
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
  showStrengthIndicator?: boolean;
}

export const PasswordInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder = '************',
  disabled = false,
  className = '',
  description,
  showStrengthIndicator = false,
}: PasswordInputProps<TFieldValues, TName>) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className='relative'>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                className='pr-12'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={togglePasswordVisibility}
                disabled={disabled}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <Eye className='h-4 w-4 text-muted-foreground' />
                )}
                <span className='sr-only'>
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </FormControl>
          {description && (
            <p className='text-sm text-muted-foreground'>{description}</p>
          )}
          {showStrengthIndicator && (
            <div className='mt-2'>
              <div className='text-xs text-muted-foreground mb-1'>
                Password strength:
              </div>
              <div className='w-full bg-secondary rounded-full h-1'>
                <div className='bg-destructive h-1 rounded-full w-1/4 transition-all' />
              </div>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
