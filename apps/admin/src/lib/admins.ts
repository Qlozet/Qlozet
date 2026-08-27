// Display helpers for the console's Admin Management screens.
//
// An administrator is a User with `type: 'platform'` — GET /users/admins — not
// a vendor TeamMember. Statuses collapse to the two states the table shows, and
// role names arrive lowercased with underscores (the Role schema lowercases
// them), so every label goes through `formatRoleName`.

import type {
  ConsolePermissionGroup,
  PlatformAdmin,
} from '@/redux/services/users/users.api-slice';

export type AdminStatusVariant = 'active' | 'inactive';

export interface AdminStatusInfo {
  variant: AdminStatusVariant;
  label: string;
}

/** `super_admin` → `Super admin`, `data-analyst` → `Data analyst`. */
export const formatRoleName = (name?: string | null): string => {
  const cleaned = (name ?? '').replace(/[_-]+/g, ' ').trim();
  if (!cleaned) return '—';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

// ---- Role permissions matrix (Edit Access screen) ----

// The actions every module can be granted, in the column order the design shows.
export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

// Which cells are ticked, keyed by the catalogue's resource key.
export type PermissionMatrix = Record<
  string,
  Record<PermissionAction, boolean>
>;

/**
 * The permission ids a role currently holds.
 *
 * GET /users/roles/:id populates `permissions` with the documents themselves,
 * while a role that has just been saved holds bare ids — read both.
 */
export const readPermissionIds = (permissions: unknown): string[] => {
  if (!Array.isArray(permissions)) return [];
  return permissions
    .map((permission) => {
      if (typeof permission === 'string') return permission;
      if (permission && typeof permission === 'object') {
        const id = (permission as { _id?: unknown })._id;
        if (typeof id === 'string') return id;
      }
      return null;
    })
    .filter((id): id is string => Boolean(id));
};

/** Tick the cells whose permission id the role holds. */
export const buildPermissionMatrix = (
  catalogue: ConsolePermissionGroup[],
  granted: string[]
): PermissionMatrix => {
  const held = new Set(granted);

  return catalogue.reduce<PermissionMatrix>((matrix, group) => {
    matrix[group.resource] = PERMISSION_ACTIONS.reduce(
      (row, action) => {
        const id = group.actions?.[action];
        row[action] = Boolean(id && held.has(id));
        return row;
      },
      {} as Record<PermissionAction, boolean>
    );
    return matrix;
  }, {});
};

/**
 * Flatten the matrix back to the `permission_ids` the API expects.
 *
 * Only ids that exist in the catalogue are sent — a cell with no permission
 * behind it is a gap in the catalogue, not a grant.
 */
export const matrixToPermissionIds = (
  catalogue: ConsolePermissionGroup[],
  matrix: PermissionMatrix
): string[] => {
  const ids: string[] = [];
  for (const group of catalogue) {
    for (const action of PERMISSION_ACTIONS) {
      const id = group.actions?.[action];
      if (id && matrix[group.resource]?.[action]) ids.push(id);
    }
  }
  return ids;
};

/**
 * Permission ids the role holds that the console's grid does not cover.
 *
 * The catalogue seeded before the console existed (`view_users`,
 * `approve_vendors`, …) has no cell to tick, so saving the grid would silently
 * strip those grants. They ride along untouched instead.
 */
export const permissionsOutsideMatrix = (
  catalogue: ConsolePermissionGroup[],
  granted: string[]
): string[] => {
  const known = new Set(
    catalogue.flatMap((group) =>
      PERMISSION_ACTIONS.map((action) => group.actions?.[action]).filter(
        (id): id is string => Boolean(id)
      )
    )
  );
  return granted.filter((id) => !known.has(id));
};

// ---- Row helpers ----

// Sign-in requires 'active', so anything else reads as Inactive: what the
// column tells an admin is whether that person can get in.
export const getAdminStatus = (admin: PlatformAdmin): AdminStatusInfo => {
  const raw = (admin.status ?? '').toString().toLowerCase();

  if (raw === 'active') return { variant: 'active', label: 'Active' };
  if (raw === 'suspended') return { variant: 'inactive', label: 'Suspended' };
  return { variant: 'inactive', label: 'Inactive' };
};

export const isAdminActive = (admin: PlatformAdmin): boolean =>
  (admin.status ?? '').toString().toLowerCase() === 'active';

export const getAdminName = (admin: PlatformAdmin): string =>
  admin.full_name?.trim() || 'Unnamed admin';

export const getAdminEmail = (admin: PlatformAdmin): string =>
  admin.email || '—';

export const getAdminPhone = (admin: PlatformAdmin): string =>
  admin.phone_number || '—';

export const getAdminRole = (admin: PlatformAdmin): string =>
  formatRoleName(admin.role?.name ?? admin.role_name);

export const getAdminInitial = (admin: PlatformAdmin): string =>
  getAdminName(admin).charAt(0).toUpperCase() || 'A';

// DD/MM/YYYY to match the design's "Date registered" column.
export const formatRegisteredDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};
