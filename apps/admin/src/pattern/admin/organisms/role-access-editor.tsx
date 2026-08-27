'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import {
  buildPermissionMatrix,
  formatRoleName,
  matrixToPermissionIds,
  permissionsOutsideMatrix,
  readPermissionIds,
  PERMISSION_ACTIONS,
  type PermissionAction,
  type PermissionMatrix,
} from '@/lib/admins';
import { readApiError } from '@/redux/services/types';
import {
  useGetRoleQuery,
  useGetConsolePermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useSetRolePermissionsMutation,
  type ConsolePermissionGroup,
} from '@/redux/services/users/users.api-slice';
import { EditRoleAccessTemplate } from '../templates/edit-role-access-template';

interface RoleAccessEditorProps {
  /** Absent for "Create New Role"; the role's id when editing an existing one. */
  roleId?: string;
}

// A new role starts with View + Create ticked across every module, which is
// where the design's create screen opens — a role granting nothing at all is
// never what someone means to make.
const startingMatrix = (
  catalogue: ConsolePermissionGroup[]
): PermissionMatrix =>
  catalogue.reduce<PermissionMatrix>((matrix, group) => {
    matrix[group.resource] = PERMISSION_ACTIONS.reduce(
      (row, action) => {
        row[action] =
          (action === 'view' || action === 'create') &&
          Boolean(group.actions?.[action]);
        return row;
      },
      {} as Record<PermissionAction, boolean>
    );
    return matrix;
  }, {});

/**
 * The Role Details + Permission grid screen, for both creating and editing.
 *
 * Creating and editing a role are the same screen in the design — the same two
 * panels and the same Save — so they are the same component here. The only
 * differences are where the initial values come from and whether Save creates
 * the role first.
 */
export const RoleAccessEditor = ({ roleId }: RoleAccessEditorProps) => {
  const router = useRouter();
  const isEdit = Boolean(roleId);

  const {
    data,
    isSuccess,
    isLoading: isLoadingRole,
  } = useGetRoleQuery(roleId as string, { skip: !roleId });
  const role = data?.data;

  // The grid's rows and, behind each cell, the permission id to send back.
  const { data: permissionsData, isLoading: isLoadingPermissions } =
    useGetConsolePermissionsQuery();
  const catalogue = useMemo(
    () => permissionsData?.data ?? [],
    [permissionsData]
  );

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [setRolePermissions] = useSetRolePermissionsMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [isSaving, setIsSaving] = useState(false);

  // What the role holds today — populated documents from GET /users/roles/:id.
  const granted = useMemo(
    () => readPermissionIds(role?.permissions),
    [role?.permissions]
  );

  // Seeding the form is an adjustment to what loaded, not a side effect: done
  // in an effect it would paint an empty form first and re-run on every
  // refetch, wiping whatever the admin had typed. `seedKey` changes only when
  // a different role loads, or when the catalogue first arrives.
  const loaded = isEdit ? isSuccess && Boolean(role) : catalogue.length > 0;
  const seedKey = `${isEdit ? role?._id : 'new'}:${catalogue.length}`;
  const [seededFor, setSeededFor] = useState<string | null>(null);

  if (loaded && seededFor !== seedKey) {
    setSeededFor(seedKey);
    if (isEdit && role) {
      setName(formatRoleName(role.name));
      setDescription(role.description ?? '');
      setMatrix(buildPermissionMatrix(catalogue, granted));
    } else {
      setMatrix(startingMatrix(catalogue));
    }
  }

  const title = isEdit
    ? name || formatRoleName(role?.name) || 'Role'
    : name || 'Create New Role';

  const handleToggle = (resourceKey: string, action: PermissionAction) => {
    setMatrix((prev) => ({
      ...prev,
      [resourceKey]: {
        ...prev[resourceKey],
        [action]: !prev[resourceKey]?.[action],
      },
    }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Give the role a name.');
      return;
    }

    setIsSaving(true);
    try {
      let id = roleId;

      if (id) {
        await updateRole({ id, data: { name, description } }).unwrap();
      } else {
        const created = await createRole({
          name: name.trim(),
          // Console roles are platform roles; a vendor role here would create
          // something no administrator can ever hold.
          type: 'platform',
          description: description.trim() || undefined,
        }).unwrap();
        id = created?.data?._id;
        if (!id) throw new Error('The role was created without an id.');
      }

      // The grid covers the console's own permissions. Anything else the role
      // holds — the legacy catalogue seeded before this screen existed — has no
      // cell to tick, so it rides along instead of being silently revoked.
      await setRolePermissions({
        id,
        data: {
          permission_ids: [
            ...matrixToPermissionIds(catalogue, matrix),
            ...permissionsOutsideMatrix(catalogue, granted),
          ],
        },
      }).unwrap();

      toast.success(isEdit ? 'Role updated successfully' : 'Role created');

      // Back to the roles list, where the role now appears. `replace`, not
      // `push`: Back must not return to a create form that has already saved,
      // where the next Save would try to create the same role a second time.
      if (!isEdit) router.replace(APP_ROUTES.adminManageRoles);
    } catch (error) {
      // e.g. 'A platform role called "operations" already exists.'
      toast.error(readApiError(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EditRoleAccessTemplate
      title={title}
      name={name}
      description={description}
      catalogue={catalogue}
      matrix={matrix}
      isLoading={isLoadingPermissions || (isEdit && isLoadingRole)}
      isSaving={isSaving}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onToggle={handleToggle}
      onSave={handleSave}
    />
  );
};
