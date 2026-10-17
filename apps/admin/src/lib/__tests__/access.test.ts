import { describe, expect, it } from 'vitest';
import { can, canView, formatAccessRole, resourceForPath } from '../access';
import type { MyAccess } from '@/redux/services/users/users.api-slice';

const access = (patch: Partial<MyAccess> = {}): MyAccess => ({
  type: 'platform',
  status: 'active',
  role: { _id: 'r1', name: 'customer_support', description: null },
  is_super_admin: false,
  full_access: false,
  permissions: ['customers.view', 'tickets.view', 'tickets.edit'],
  must_change_password: false,
  ...patch,
});

describe('resourceForPath', () => {
  it('maps every console page to its grid row', () => {
    expect(resourceForPath('/dashboard')).toBe('dashboard');
    expect(resourceForPath('/vendors/abc')).toBe('vendors');
    expect(resourceForPath('/customers/abc?tab=orders')).toBe('customers');
    expect(resourceForPath('/products/clothing')).toBe('products');
    expect(resourceForPath('/disputes')).toBe('orders');
    expect(resourceForPath('/admin/manage-roles/new')).toBe('admin-management');
    expect(resourceForPath('/support/t1')).toBe('tickets');
    expect(resourceForPath('/help-center')).toBe('blogs');
    expect(resourceForPath('/wallet')).toBe('payments');
    expect(resourceForPath('/settings')).toBe('settings');
  });

  it('leaves the inbox and unknown pages ungated', () => {
    expect(resourceForPath('/notifications')).toBeNull();
    expect(resourceForPath('/')).toBeNull();
    // "/administrators" is not "/admin".
    expect(resourceForPath('/administrators')).toBeNull();
  });
});

describe('can / canView', () => {
  it('answers from the permission names', () => {
    const a = access();
    expect(can(a, 'customers', 'view')).toBe(true);
    expect(can(a, 'customers', 'delete')).toBe(false);
    expect(canView(a, 'vendors')).toBe(false);
    expect(canView(a, 'tickets')).toBe(true);
  });

  it('a full-access role may do everything', () => {
    const a = access({ full_access: true, permissions: [] });
    expect(can(a, 'admin-management', 'delete')).toBe(true);
  });

  it('unknown access hides nothing; the server has the final say', () => {
    expect(canView(undefined, 'vendors')).toBe(true);
    expect(can(null, 'settings', 'edit')).toBe(true);
  });

  it('a page with no row is open to everyone', () => {
    expect(canView(access({ permissions: [] }), null)).toBe(true);
  });
});

describe('formatAccessRole', () => {
  it('reads as a label', () => {
    expect(formatAccessRole(access())).toBe('Customer support');
    expect(formatAccessRole(access({ role: null }))).toBeNull();
  });
});
