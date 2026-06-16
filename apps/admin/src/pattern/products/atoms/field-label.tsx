'use client';

import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FieldLabelProps {
  children: ReactNode;
  /** When set, shows an info icon with this tooltip text. */
  tooltip?: string;
  htmlFor?: string;
  className?: string;
}

// Shared form label with an optional info tooltip, used across the Add Product
// form sections (Description, Organization, Pricing, Customization).
export const FieldLabel = ({
  children,
  tooltip,
  htmlFor,
  className,
}: FieldLabelProps) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      'mb-2 flex items-center gap-1 text-sm font-medium text-grey-black dark:text-white',
      className
    )}
  >
    {children}
    {tooltip && (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help text-muted-foreground">
            <Info className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )}
  </label>
);
