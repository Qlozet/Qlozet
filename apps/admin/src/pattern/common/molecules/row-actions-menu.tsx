'use client';

import type { ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface RowAction {
  /** Stable key; also the accessible name of the item. */
  label: string;
  /** Optional leading glyph. Menus that pass none render label-only. */
  icon?: ReactNode;
  onSelect: () => void;
  /** Renders in the destructive colour, below a separator. */
  destructive?: boolean;
  disabled?: boolean;
}

interface RowActionsMenuProps {
  /** Heading above the items, e.g. "Customer actions". */
  title: string;
  actions: RowAction[];
  /** Accessible name for the trigger; defaults to the title. */
  triggerLabel?: string;
  className?: string;
}

/**
 * The stacked-dots row menu used at the end of a table row.
 *
 * A row's actions belong behind one trigger rather than as inline buttons: the
 * column stays a fixed width however many actions a row has, and adding an
 * action later does not push the table wider.
 *
 * Destructive items are grouped last behind a separator, so a mis-click on the
 * common action cannot land on the dangerous one.
 */
export const RowActionsMenu = ({
  title,
  actions,
  triggerLabel,
  className,
}: RowActionsMenuProps) => {
  const safe = actions.filter((action) => !action.destructive);
  const destructive = actions.filter((action) => action.destructive);

  const renderItem = (action: RowAction) => (
    <DropdownMenuItem
      key={action.label}
      disabled={action.disabled}
      onClick={action.onSelect}
      className={cn(action.destructive && 'text-destructive')}
    >
      {action.icon}
      {action.label}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn('h-8 w-8 p-0', className)}
          // Rows are often clickable themselves; opening the menu must not also
          // navigate.
          onClick={(event) => event.stopPropagation()}
        >
          <span className="sr-only">{triggerLabel ?? title}</span>
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {safe.map(renderItem)}
        {destructive.length > 0 && <DropdownMenuSeparator />}
        {destructive.map(renderItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
