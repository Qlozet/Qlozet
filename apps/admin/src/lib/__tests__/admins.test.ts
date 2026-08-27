import { describe, expect, it } from 'vitest';
import {
  buildPermissionMatrix,
  formatRegisteredDate,
  formatRoleName,
  getAdminRole,
  getAdminStatus,
  isAdminActive,
  matrixToPermissionIds,
  permissionsOutsideMatrix,
  readPermissionIds,
} from '../admins';
import type {
  ConsolePermissionGroup,
  PlatformAdmin,
} from '@/redux/services/users/users.api-slice';

const group = (
  resource: string,
  ids: Partial<Record<'view' | 'create' | 'edit' | 'delete', string | null>>
): ConsolePermissionGroup => ({
  resource,
  label: resource,
  module: 'system_management',
  actions: {
    view: ids.view ?? null,
    create: ids.create ?? null,
    edit: ids.edit ?? null,
    delete: ids.delete ?? null,
  },
});

const CATALOGUE: ConsolePermissionGroup[] = [
  group('vendors', {
    view: 'p-vendors-view',
    create: 'p-vendors-create',
    edit: 'p-vendors-edit',
    delete: 'p-vendors-delete',
  }),
  // A row the catalogue only half-covers — the cell with no id can't be granted.
  group('settings', { view: 'p-settings-view' }),
];

const admin = (patch: Partial<PlatformAdmin> = {}): PlatformAdmin => ({
  _id: 'a1',
  full_name: 'Shola James',
  email: 'shola@mail.com',
  phone_number: '+2348123456789',
  status: 'active',
  role: { _id: 'r1', name: 'super_admin', description: null },
  role_name: 'super_admin',
  createdAt: '2023-09-25T10:00:00.000Z',
  ...patch,
});

describe('formatRoleName', () => {
  // The Role schema lowercases names, so every label is built from 'super_admin'.
  it('turns the stored name into the label the design shows', () => {
    expect(formatRoleName('super_admin')).toBe('Super admin');
    expect(formatRoleName('data-analyst')).toBe('Data analyst');
    expect(formatRoleName('SALES')).toBe('Sales');
  });

  it('falls back to a dash rather than an empty label', () => {
    expect(formatRoleName('')).toBe('—');
    expect(formatRoleName(null)).toBe('—');
    expect(formatRoleName(undefined)).toBe('—');
  });
});

describe('readPermissionIds', () => {
  it('reads both populated documents and bare ids', () => {
    expect(
      readPermissionIds([{ _id: 'p1', name: 'vendors.view' }, 'p2'])
    ).toEqual(['p1', 'p2']);
  });

  it('is empty for a role with no permissions', () => {
    expect(readPermissionIds(undefined)).toEqual([]);
    expect(readPermissionIds(null)).toEqual([]);
    expect(readPermissionIds([])).toEqual([]);
  });
});

describe('the permission grid', () => {
  it('ticks exactly the cells whose permission the role holds', () => {
    const matrix = buildPermissionMatrix(CATALOGUE, [
      'p-vendors-view',
      'p-vendors-edit',
    ]);

    expect(matrix.vendors).toEqual({
      view: true,
      create: false,
      edit: true,
      delete: false,
    });
    expect(matrix.settings.view).toBe(false);
  });

  it('round-trips back to the ids the API expects', () => {
    const granted = ['p-vendors-view', 'p-settings-view'];
    const matrix = buildPermissionMatrix(CATALOGUE, granted);

    expect(matrixToPermissionIds(CATALOGUE, matrix).sort()).toEqual(
      [...granted].sort()
    );
  });

  it('never invents an id for a cell the catalogue does not cover', () => {
    const matrix = buildPermissionMatrix(CATALOGUE, []);
    // Ticked by hand, but 'settings.delete' has no permission behind it.
    matrix.settings.delete = true;

    expect(matrixToPermissionIds(CATALOGUE, matrix)).toEqual([]);
  });

  it('keeps grants the grid cannot show, so saving does not revoke them', () => {
    // The legacy catalogue ('view_users', 'approve_vendors') has no cell to
    // tick; without this, one save would strip every one of them.
    expect(
      permissionsOutsideMatrix(CATALOGUE, [
        'p-vendors-view',
        'legacy-view-users',
      ])
    ).toEqual(['legacy-view-users']);
  });
});

describe('row helpers', () => {
  it('reads Active only from the status sign-in actually requires', () => {
    expect(getAdminStatus(admin()).label).toBe('Active');
    expect(getAdminStatus(admin({ status: 'inactive' })).variant).toBe(
      'inactive'
    );
    // Suspended keeps its own label — it says an admin acted, not that the
    // account went quiet — but it locks the person out just the same.
    expect(getAdminStatus(admin({ status: 'suspended' }))).toEqual({
      variant: 'inactive',
      label: 'Suspended',
    });
    expect(isAdminActive(admin({ status: 'suspended' }))).toBe(false);
  });

  it('falls back to the flattened role name if the ref did not populate', () => {
    expect(getAdminRole(admin())).toBe('Super admin');
    expect(getAdminRole(admin({ role: null }))).toBe('Super admin');
    expect(getAdminRole(admin({ role: null, role_name: null }))).toBe('—');
  });

  it('formats the registered date as DD/MM/YYYY', () => {
    expect(formatRegisteredDate('2023-09-25T10:00:00.000Z')).toBe('25/09/2023');
    expect(formatRegisteredDate(null)).toBe('—');
    expect(formatRegisteredDate('not a date')).toBe('—');
  });
});
