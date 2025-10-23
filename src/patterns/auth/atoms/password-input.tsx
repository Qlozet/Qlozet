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
  description
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
                className='pr-12 h-10 lg:h-[50px]'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={togglePasswordVisibility}
                disabled={disabled}
              >
                {showPassword ? (
                  <EyeOff className='size-4 text-muted-foreground' />
                ) : (
                  <Eye className='size-4 text-muted-foreground' />
                )}
                <span className='sr-only'>
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </FormControl>
          {description && (
            <p className='text-xs text-muted-foreground'>{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
