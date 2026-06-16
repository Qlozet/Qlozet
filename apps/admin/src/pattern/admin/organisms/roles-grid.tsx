'use client';

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleCard, type RoleCardData } from '../molecules/role-card';

interface RolesGridProps {
  roles: RoleCardData[];
  isLoading?: boolean;
  isError?: boolean;
  activeRoleId?: string | null;
  onSelect?: (role: RoleCardData) => void;
  onEditAccess?: (role: RoleCardData) => void;
}

const GRID_CLASS =
  'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export const RolesGrid = ({
  roles,
  isLoading = false,
  isError = false,
  activeRoleId,
  onSelect,
  onEditAccess,
}: RolesGridProps) => {
  if (isLoading) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-44 w-full rounded-2xl' />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-2 text-center'>
        <Loader2 className='size-6 text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>
          Couldn&apos;t load roles. Please try again.
        </p>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-sm text-muted-foreground'>No roles yet.</p>
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          active={role.id === activeRoleId}
          onSelect={onSelect}
          onEditAccess={onEditAccess}
        />
      ))}
    </div>
  );
};
