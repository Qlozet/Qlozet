'use client';

import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/routes';
import type { PermissionAction, PermissionMatrix } from '@/lib/admins';
import { GoBackButton } from '../atoms/go-back-button';
import { RoleDetailsForm } from '../molecules/role-details-form';
import { PermissionsTable } from '../organisms/permissions-table';

interface EditRoleAccessTemplateProps {
  title: string;
  name: string;
  description: string;
  matrix: PermissionMatrix;
  isSaving?: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onToggle: (resourceKey: string, action: PermissionAction) => void;
  onSave: () => void;
}

export const EditRoleAccessTemplate = ({
  title,
  name,
  description,
  matrix,
  isSaving,
  onNameChange,
  onDescriptionChange,
  onToggle,
  onSave,
}: EditRoleAccessTemplateProps) => {
  return (
    <div className='w-full min-h-screen h-fit space-y-5 pb-10'>
      {/* Header */}
      <div className='space-y-3'>
        <GoBackButton href={APP_ROUTES.adminManageRoles} />
        <h1 className='text-xl font-bold text-grey-black'>{title}</h1>
      </div>

      {/* Two-column body */}
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-3'>
        <div className='lg:col-span-1'>
          <RoleDetailsForm
            name={name}
            description={description}
            onNameChange={onNameChange}
            onDescriptionChange={onDescriptionChange}
          />
        </div>

        <div className='lg:col-span-2'>
          <PermissionsTable matrix={matrix} onToggle={onToggle} />
        </div>
      </div>

      {/* Save */}
      <div className='flex justify-end'>
        <Button onClick={onSave} disabled={isSaving} className='px-10'>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
