import { describe, expect, it } from 'vitest';
import { canUseArea, formatVendorRole } from '../vendor-access';
import type { MyAccess } from '@/redux/services/users/users.api-slice';

const access = (vendor: MyAccess['vendor']): MyAccess => ({
  type: 'vendor',
  status: 'active',
  role: null,
  is_super_admin: false,
  full_access: false,
  permissions: [],
  must_change_password: false,
  vendor,
});

describe('canUseArea', () => {
  it('reads the member’s areas', () => {
    const tailor = access({
      business_id: 'b1',
      role: 'tailor',
      is_owner: false,
      areas: ['orders.production', 'size_guides.manage', 'tickets'],
    });
    expect(canUseArea(tailor, 'orders.production')).toBe(true);
    expect(canUseArea(tailor, 'money.view')).toBe(false);
    expect(canUseArea(tailor, 'orders.reject')).toBe(false);
  });

  it('the owner may do everything, whatever the list says', () => {
    const owner = access({
      business_id: 'b1',
      role: 'owner',
      is_owner: true,
      areas: [],
    });
    expect(canUseArea(owner, 'payout_account.manage')).toBe(true);
  });

  it('unknown access hides nothing; the server has the final say', () => {
    expect(canUseArea(undefined, 'wallet.withdraw')).toBe(true);
    expect(canUseArea(access(null), 'wallet.withdraw')).toBe(true);
  });
});

describe('formatVendorRole', () => {
  it('reads as a label', () => {
    expect(
      formatVendorRole(
        access({
          business_id: 'b1',
          role: 'customer_support',
          is_owner: false,
          areas: [],
        })
      )
    ).toBe('Customer support');
    expect(formatVendorRole(access(null))).toBeNull();
  });
});
