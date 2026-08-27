'use client';

import { useParams } from 'next/navigation';
import { RoleAccessEditor } from '@/pattern/admin/organisms/role-access-editor';

const EditRoleAccessPage = () => {
  const params = useParams();
  return <RoleAccessEditor roleId={String(params.roleId)} />;
};

export default EditRoleAccessPage;
