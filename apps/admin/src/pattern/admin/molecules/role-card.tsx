'use client';

import { cn } from '@/lib/utils';

export interface RoleCardData {
  id: string;
  name: string;
  description: string;
}

interface RoleCardProps {
  role: RoleCardData;
  active?: boolean;
  onSelect?: (role: RoleCardData) => void;
  onEditAccess?: (role: RoleCardData) => void;
}

export const RoleCard = ({
  role,
  active = false,
  onSelect,
  onEditAccess,
}: RoleCardProps) => {
  return (
    <button
      type='button'
      onClick={() => onSelect?.(role)}
      className={cn(
        'flex h-full w-full flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-colors cursor-pointer',
        active
          ? 'border-transparent bg-primary text-primary-foreground'
          : 'border-border bg-white text-grey-black hover:border-primary/40'
      )}
    >
      <h3 className='text-lg font-bold'>{role.name}</h3>

      <p
        className={cn(
          'text-sm',
          active ? 'text-primary-foreground/80' : 'text-grey3'
        )}
      >
        {role.description}
      </p>

      <span
        role='button'
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
          active
            ? 'border-transparent bg-white text-primary hover:bg-white/90'
            : 'border-primary bg-white text-primary hover:bg-primary/5'
        )}
      >
        Edit Access
      </span>
    </button>
  );
};
