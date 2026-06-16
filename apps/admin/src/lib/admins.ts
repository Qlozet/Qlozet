// Display helpers for the admin Administrators (team members) views.
// Mirrors lib/vendors.ts: each accessor falls back across the handful of field
// names the backend uses, and statuses collapse to the two states the UI shows.

import type { TeamMember } from '@/redux/services/users/users.api-slice';

export type AdminStatusVariant = 'active' | 'inactive';

export interface AdminStatusInfo {
  variant: AdminStatusVariant;
  label: string;
}

// The role options offered when inviting an admin. Used as a fallback when the
// backend `/users/roles` list is empty so the Add Admin form still matches the
// Figma design.
export const ADMIN_ROLE_OPTIONS = [
  'Super admin',
  'Customer service',
  'Operations',
  'Marketing',
  'Data analyst',
  'Sales',
] as const;

// ---- Role permissions matrix (Edit Access screen) ----

// The actions every module can be granted, in the column order the Figma shows.
export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export interface PermissionResource {
  key: string;
  label: string;
}

// The modules a role can be granted permissions on (mirrors the Figma rows).
export const PERMISSION_RESOURCES: PermissionResource[] = [
  { key: 'dashboard', label: 'Dashboard (read only)' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'customers', label: 'Customers' },
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'tickets', label: 'Tickets & Complaints' },
  { key: 'payments', label: 'Payments & Payouts' },
  { key: 'marketing', label: 'Marketing (Coupons, Banners)' },
  { key: 'blogs', label: 'Blogs / Static Pages' },
  { key: 'admin-management', label: 'Admin Management' },
  { key: 'performance', label: 'Performance Analytics' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'notifications', label: 'Notifications (Push & Emails)' },
  { key: 'live-chat', label: 'Live chat Logs' },
  { key: 'settings', label: 'Settings (Shipping, Tax, General)' },
];

// A permission id is encoded as `resource:action` (e.g. `vendors:create`).
export type PermissionMatrix = Record<string, Record<PermissionAction, boolean>>;

export const buildPermissionId = (
  resourceKey: string,
  action: PermissionAction
): string => `${resourceKey}:${action}`;

// Build the matrix from a role's `permissions` string list. When the role has
// none yet, seed View + Create as granted to match the Figma default.
export const buildPermissionMatrix = (
  permissions: string[] = []
): PermissionMatrix => {
  const granted = new Set(permissions);
  const seedDefault = permissions.length === 0;

  return PERMISSION_RESOURCES.reduce<PermissionMatrix>((matrix, resource) => {
    matrix[resource.key] = PERMISSION_ACTIONS.reduce(
      (row, action) => {
        const isDefault = seedDefault && (action === 'view' || action === 'create');
        row[action] =
          granted.has(buildPermissionId(resource.key, action)) || isDefault;
        return row;
      },
      {} as Record<PermissionAction, boolean>
    );
    return matrix;
  }, {});
};

// Flatten the matrix back into the `permission_ids` list the API expects.
export const matrixToPermissionIds = (matrix: PermissionMatrix): string[] => {
  const ids: string[] = [];
  for (const resource of PERMISSION_RESOURCES) {
    for (const action of PERMISSION_ACTIONS) {
      if (matrix[resource.key]?.[action]) {
        ids.push(buildPermissionId(resource.key, action));
      }
    }
  }
  return ids;
};

// Collapse the backend status strings into the two states the UI shows.
export const getAdminStatus = (member: TeamMember): AdminStatusInfo => {
  const raw = (member.status ?? '').toString().toLowerCase();

  if (['active', 'approved', 'verified', 'accepted'].includes(raw)) {
    return { variant: 'active', label: 'Active' };
  }
  return { variant: 'inactive', label: 'Inactive' };
};

export const getAdminName = (member: TeamMember): string =>
  member.full_name ||
  (member.name as string | undefined) ||
  'Unnamed admin';

export const getAdminEmail = (member: TeamMember): string =>
  member.email || '—';

export const getAdminPhone = (member: TeamMember): string =>
  member.phone_number ||
  (member.phone as string | undefined) ||
  '—';

export const getAdminRole = (member: TeamMember): string =>
  member.role || '—';

export const getAdminInitial = (member: TeamMember): string =>
  getAdminName(member).charAt(0).toUpperCase() || 'A';

// DD/MM/YYYY to match the Figma "Date registered" column.
export const formatRegisteredDate = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};
