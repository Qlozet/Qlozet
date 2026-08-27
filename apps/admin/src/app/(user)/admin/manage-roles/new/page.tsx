'use client';

import { RoleAccessEditor } from '@/pattern/admin/organisms/role-access-editor';

// Creating a role is the same screen as editing one — Role Details on the left,
// the permission grid on the right — so it renders the same editor with nothing
// loaded. The static segment wins over [roleId], so /manage-roles/new lands
// here rather than trying to fetch a role called "new".
const CreateRolePage = () => <RoleAccessEditor />;

export default CreateRolePage;
