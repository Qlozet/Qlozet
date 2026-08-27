'use client';

import { cn } from '@/lib/utils';

export interface RoleCardData {
  id: string;
  name: string;
  description: string;
}

interface RoleCardProps {
  role: RoleCardData;
  /**
   * Clicking anywhere on the card. The whole card opens the role — "Edit
   * Access" is the affordance, not the only target, and a card that looks
   * clickable and isn't reads as broken.
   */
  onSelect?: (role: RoleCardData) => void;
  onEditAccess?: (role: RoleCardData) => void;
}

export const RoleCard = ({ role, onSelect, onEditAccess }: RoleCardProps) => {
  return (
    <button
      type="button"
      aria-label={`${role.name} — edit access`}
      onClick={() => onSelect?.(role)}
      className={cn(
        'group flex h-full w-full flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-colors cursor-pointer',
        'border-border bg-white text-grey-black dark:bg-card dark:text-white',
        'hover:border-transparent hover:bg-primary hover:text-primary-foreground'
      )}
    >
      <h3 className="text-lg font-bold">{role.name}</h3>

      <p
        className={cn(
          'text-sm text-grey3 dark:text-gray-400',
          'group-hover:text-primary-foreground/80'
        )}
      >
        {role.description}
      </p>

      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onEditAccess?.(role);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onEditAccess?.(role);
          }
        }}
        className={cn(
          'mt-auto inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
          'border-primary bg-white dark:bg-muted text-primary',
          'group-hover:border-transparent group-hover:bg-white group-hover:text-primary'
        )}
      >
        Edit Access
      </span>
    </button>
  );
};
