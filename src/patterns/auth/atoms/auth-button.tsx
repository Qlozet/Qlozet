'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends Omit<ButtonProps, 'size'> {
  children: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'default' | 'lg';
  fullWidth?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  size = 'default',
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      size={size}
      className={cn(fullWidth && 'w-full', className)}
      {...props}
    >
      {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
      {children}
    </Button>
  );
};
