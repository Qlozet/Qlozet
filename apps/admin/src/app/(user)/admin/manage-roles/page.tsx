'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RolesManagementTemplate } from '@/pattern/admin/templates/roles-management-template';
import type { RoleCardData } from '@/pattern/admin/molecules/role-card';
import { APP_ROUTES } from '@/lib/routes';
import { formatRoleName } from '@/lib/admins';
import { readApiError } from '@/redux/services/types';
import {
  useGetRolesQuery,
  useCreateDefaultRolesMutation,
} from '@/redux/services/users/users.api-slice';

const ManageRolesPage = () => {
  const router = useRouter();
  // Platform roles only: the console grants access to the console, and a vendor
  // role listed here could never be held by an administrator.
  const { data, isLoading, isError } = useGetRolesQuery({ type: 'platform' });
  const [createDefaults, { isLoading: isCreatingDefaults }] =
    useCreateDefaultRolesMutation();

  const roles = useMemo<RoleCardData[]>(
    () =>
      (data?.data ?? []).map((role) => ({
        id: role._id,
        // Stored lowercased with underscores ('super_admin').
        name: formatRoleName(role.name) || 'Untitled role',
        description:
          role.description ||
          'Ideal for individuals who need access to platform features.',
      })),
    [data]
  );

  const goToEditAccess = (roleId: string) =>
    router.push(`${APP_ROUTES.adminManageRoles}/${roleId}`);

  // Creating a role is the same screen as editing one — role details on the
  // left, the permission grid on the right — so it is a route, not a dialog.
  const goToCreateRole = () =>
    router.push(`${APP_ROUTES.adminManageRoles}/new`);

  const handleCreateDefaults = async () => {
    try {
      const result = await createDefaults().unwrap();
      const created = result?.data?.created ?? [];
      toast.success(
        created.length
          ? `Created ${created.length} role${created.length === 1 ? '' : 's'}.`
          : 'Every default role already exists.'
      );
    } catch (error) {
      toast.error(readApiError(error));
    }
  };

  return (
    <RolesManagementTemplate
      roles={roles}
      isLoading={isLoading}
      isError={isError}
      // The whole card opens the role, not just the button on it.
      onSelect={(role) => goToEditAccess(role.id)}
      onEditAccess={(role) => goToEditAccess(role.id)}
      onCreateRole={goToCreateRole}
      onCreateDefaults={handleCreateDefaults}
      isCreatingDefaults={isCreatingDefaults}
    />
  );
};

export default ManageRolesPage;
