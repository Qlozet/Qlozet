'use client';

import { useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnchoredPopover } from './anchored-popover';

export interface PageAction {
  /** Also the accessible name of the item. */
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  variant?: 'default' | 'outline';
  disabled?: boolean;
}

interface PageActionsProps {
  actions: PageAction[];
  /** Accessible name for the collapsed trigger. */
  label?: string;
  className?: string;
}

/**
 * A page header's actions: side by side on desktop, one trigger below `lg`.
 *
 * Two full-width buttons next to a page title do not fit a phone — on the
 * Administrators page "Manage Roles" and "Add Admin" pushed the heading off the
 * left edge and the second button off the right, so neither was fully
 * reachable. Below `lg` they collapse into a single trigger whose popover
 * stacks them.
 *
 * Inside the popover they are menu items, not buttons: a panel of filled
 * buttons repeats the emphasis the trigger already carries, and it is a menu —
 * the same shape as every other row menu in the console. Labels only there,
 * too — an icon column in a two-item menu is decoration, and the icons exist to
 * distinguish buttons that sit side by side, which these no longer do.
 *
 * The popover is portalled (see AnchoredPopover), so it is never clipped by a
 * card or cut off at the fold.
 */
export const PageActions = ({
  actions,
  label = 'Page actions',
  className,
}: PageActionsProps) => {
  const [open, setOpen] = useState(false);

  const run = (action: PageAction) => {
    setOpen(false);
    action.onSelect();
  };

  return (
    <div className={cn('flex items-center', className)}>
      {/* lg and up: the actions themselves. */}
      <div className="hidden items-center gap-3 lg:flex">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? 'default'}
            onClick={action.onSelect}
            disabled={action.disabled}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Below lg: one trigger, actions stacked in the popover. */}
      <AnchoredPopover
        open={open}
        onOpenChange={setOpen}
        width={220}
        label={label}
        trigger={
          <Button
            variant="outline"
            size="icon"
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        }
        className="lg:hidden"
        panelClassName="p-1.5"
      >
        <div className="flex flex-col">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => run(action)}
              disabled={action.disabled}
              className={cn(
                'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium',
                'text-foreground transition-colors hover:bg-accent',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </AnchoredPopover>
    </div>
  );
};
