'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleCard, type RoleCardData } from '../molecules/role-card';

interface RolesGridProps {
  roles: RoleCardData[];
  isLoading?: boolean;
  isError?: boolean;
  onSelect?: (role: RoleCardData) => void;
  onEditAccess?: (role: RoleCardData) => void;
  /** Offered when there are no roles yet — seeds the standard platform set. */
  onCreateDefaults?: () => void;
  isCreatingDefaults?: boolean;
}

const GRID_CLASS =
  'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export const RolesGrid = ({
  roles,
  isLoading = false,
  isError = false,
  onSelect,
  onEditAccess,
  onCreateDefaults,
  isCreatingDefaults = false,
}: RolesGridProps) => {
  if (isLoading) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="size-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load roles. Please try again.
        </p>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          No platform roles yet. Every administrator needs one, so start with
          the standard set and adjust their access from there.
        </p>
        {onCreateDefaults && (
          <Button
            variant="outline"
            onClick={onCreateDefaults}
            disabled={isCreatingDefaults}
          >
            {isCreatingDefaults ? 'Creating...' : 'Create the default roles'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onSelect={onSelect}
          onEditAccess={onEditAccess}
        />
      ))}
    </div>
  );
};
