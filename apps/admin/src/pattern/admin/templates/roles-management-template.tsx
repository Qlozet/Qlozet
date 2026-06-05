'use client';

import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/routes';
import { GoBackButton } from '../atoms/go-back-button';
import { RolesGrid } from '../organisms/roles-grid';
import type { RoleCardData } from '../molecules/role-card';

interface RolesManagementTemplateProps {
  roles: RoleCardData[];
  isLoading?: boolean;
  isError?: boolean;
  activeRoleId?: string | null;
  onSelect?: (role: RoleCardData) => void;
  onEditAccess?: (role: RoleCardData) => void;
  onCreateRole?: () => void;
}

export const RolesManagementTemplate = ({
  roles,
  isLoading,
  isError,
  activeRoleId,
  onSelect,
  onEditAccess,
  onCreateRole,
}: RolesManagementTemplateProps) => {
  return (
    <div className='w-full min-h-screen h-fit space-y-6 pb-10'>
      {/* Header row */}
      <div className='flex items-center justify-between gap-4'>
        <GoBackButton href={APP_ROUTES.admin} />

        <Button variant='outline' onClick={onCreateRole}>
          <UserPlus className='size-4' />
          Create New Role
        </Button>
      </div>

      {/* Roles grid */}
      <RolesGrid
        roles={roles}
        isLoading={isLoading}
        isError={isError}
        activeRoleId={activeRoleId}
        onSelect={onSelect}
        onEditAccess={onEditAccess}
      />
    </div>
  );
};
