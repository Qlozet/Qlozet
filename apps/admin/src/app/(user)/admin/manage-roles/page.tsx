'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { RolesManagementTemplate } from '@/pattern/admin/templates/roles-management-template';
import type { RoleCardData } from '@/pattern/admin/molecules/role-card';
import { APP_ROUTES } from '@/lib/routes';
import { useGetRolesQuery } from '@/redux/services/users/users.api-slice';

const ManageRolesPage = () => {
  const router = useRouter();
  const { data, isLoading, isError } = useGetRolesQuery();
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);

  const roles = useMemo<RoleCardData[]>(
    () =>
      (data?.data ?? []).map((role) => ({
        id: role._id,
        name: role.name ?? 'Untitled role',
        description:
          role.description ||
          'Ideal for individuals who need access to platform features.',
      })),
    [data]
  );

  // Editing access and creating a role have no backing screen yet, so both use
  // the shared "Work in Progress" modal (the app's convention for un-built flows).
  const showWorkInProgress = () => NiceModal.show(WorkInProgressModal);

  return (
    <RolesManagementTemplate
      roles={roles}
      isLoading={isLoading}
      isError={isError}
      activeRoleId={activeRoleId}
      onSelect={(role) => setActiveRoleId(role.id)}
      onEditAccess={(role) =>
        router.push(`${APP_ROUTES.adminManageRoles}/${role.id}`)
      }
      onCreateRole={showWorkInProgress}
    />
  );
};

export default ManageRolesPage;
