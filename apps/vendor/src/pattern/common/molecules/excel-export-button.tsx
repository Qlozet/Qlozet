'use client';

// Shared Excel "Export" button — primary button with the branded Excel icon.
// Used by the detail-page table toolbars and anywhere an Excel export is offered.

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExcelIcon } from '@/pattern/common/atoms/excel-icon';

interface ExcelExportButtonProps {
  onClick?: () => void;
  /** Button label (defaults to "Export"). */
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const ExcelExportButton = ({
  onClick,
  label = 'Export',
  disabled,
  className,
}: ExcelExportButtonProps) => (
  <Button
    type='button'
    onClick={onClick}
    disabled={disabled}
    className={cn('h-10 gap-2 text-sm font-semibold', className)}
  >
    <ExcelIcon />
    <span>{label}</span>
  </Button>
);
