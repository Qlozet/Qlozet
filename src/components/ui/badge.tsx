import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        success:
          'border-transparent bg-[#33CC331A] text-[#33CC33] hover:bg-[#33CC33]/20',
        warning:
          'border-transparent bg-[#CC9C331A] text-[#FFB020] hover:bg-[#CC9C33]/20',
        error:
          'border-transparent bg-[#FFF5F5] text-[#E42C66] hover:bg-[#FFF5F5]/80',
        blue:
          'border-transparent bg-[#338CCC1A] text-[#3387CC] hover:bg-[#338CCC]/20',
        outline: 'text-foreground',
      },
      shape: {
        pill: 'rounded-full',
        square: 'rounded-[8px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      shape: 'square',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, shape, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, shape }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
