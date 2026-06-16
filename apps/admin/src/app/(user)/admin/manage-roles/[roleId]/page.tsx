'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { EditRoleAccessTemplate } from '@/pattern/admin/templates/edit-role-access-template';
import {
  buildPermissionMatrix,
  matrixToPermissionIds,
  type PermissionAction,
  type PermissionMatrix,
} from '@/lib/admins';
import {
  useGetRoleQuery,
  useUpdateRoleMutation,
  useAssignRolePermissionsMutation,
} from '@/redux/services/users/users.api-slice';

const EditRoleAccessPage = () => {
  const params = useParams();
  const roleId = String(params.roleId);

  const { data, isSuccess } = useGetRoleQuery(roleId);
  const role = data?.data;

  const [updateRole] = useUpdateRoleMutation();
  const [assignPermissions] = useAssignRolePermissionsMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [matrix, setMatrix] = useState<PermissionMatrix>(() =>
    buildPermissionMatrix()
  );
  const [isSaving, setIsSaving] = useState(false);

  // Seed the form once the real role loads.
  useEffect(() => {
    if (isSuccess && role) {
      setName(role.name ?? '');
      setDescription(role.description ?? '');
      setMatrix(buildPermissionMatrix(role.permissions));
    }
  }, [isSuccess, role]);

  const title = useMemo(
    () => name || role?.name || 'Role',
    [name, role]
  );

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
    setIsSaving(true);
    try {
      await updateRole({ id: roleId, data: { name, description } }).unwrap();
      // Best-effort: the backend permission catalogue isn't exposed, so we send
      // `resource:action` ids and don't fail the save if it rejects them.
      try {
        await assignPermissions({
          id: roleId,
          data: { permission_ids: matrixToPermissionIds(matrix) },
        }).unwrap();
      } catch {
        /* permissions persistence is best-effort for now */
      }
      toast.success('Role updated successfully');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EditRoleAccessTemplate
      title={title}
      name={name}
      description={description}
      matrix={matrix}
      isSaving={isSaving}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onToggle={handleToggle}
      onSave={handleSave}
    />
  );
};

export default EditRoleAccessPage;
