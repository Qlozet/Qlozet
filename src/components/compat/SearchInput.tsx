import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Compatibility interface that maps old SearchInput props to new shadcn Input
interface CompatSearchInputProps {
  label?: string;
  error?: boolean;
  setValue: (value: string) => void;
  value: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchInput = React.forwardRef<
  HTMLInputElement,
  CompatSearchInputProps
>(
  (
    {
      label,
      error = false,
      setValue,
      value,
      rightIcon,
      leftIcon,
      placeholder,
      disabled = false,
      className,
    },
    ref
  ) => {
    return (
      <div className='block w-full'>
        <div className='my-3 relative'>
          {/* Use leftIcon if provided, otherwise default search icon */}
          {leftIcon || (
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none' />
          )}

          {label && (
            <Label
              className={cn(
                'text-sm font-light my-2 text-dark block mb-2',
                error && 'text-destructive'
              )}
            >
              {label}
            </Label>
          )}

          <Input
            ref={ref}
            type='text'
            className={cn(
              'pl-9 pr-4',
              error && 'border-destructive focus-visible:ring-destructive',
              disabled && 'cursor-not-allowed',
              className
            )}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value)
            }
          />

          {rightIcon && (
            <div className='absolute right-2.5 top-2.5'>{rightIcon}</div>
          )}

          {error && (
            <p className='text-destructive text-xs font-normal mt-1'>
              {label || 'Search'} cannot be empty!
            </p>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'CompatSearchInput';

export default SearchInput;
