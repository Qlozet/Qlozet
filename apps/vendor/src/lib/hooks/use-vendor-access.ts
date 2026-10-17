'use client';

import { useCallback } from 'react';
import { useGetMyAccessQuery } from '@/redux/services/users/users.api-slice';
import { canUseArea, type VendorArea } from '@/lib/vendor-access';

/**
 * The signed-in member's areas for the store they have open. One query,
 * cached by RTK and shared by the sidebar, the wallet, the order drawer and
 * the catalogue pages.
 */
export const useVendorAccess = () => {
  const { data, isLoading, isError, refetch } = useGetMyAccessQuery();
  const access = data?.data;
  const can = useCallback(
    (area: VendorArea) => canUseArea(access, area),
    [access]
  );
  return { access, isLoading, isError, refetch, can };
};
