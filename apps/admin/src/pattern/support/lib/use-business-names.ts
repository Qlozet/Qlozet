'use client';

import { useCallback, useMemo } from 'react';
import { useGetBusinessesQuery } from '@/redux/services/businesses/businesses.api-slice';
import { EM_DASH } from './ticket-fields';

/**
 * Resolves the `business` ObjectId on a ticket to a vendor name.
 *
 * Tickets reference their business by id and the backend never populates it,
 * so the "User/Vendor Name" column has to join against the businesses list
 * client-side. That list is a single small page (14 records today, one page at
 * size 100) and RTK Query caches it, so this costs one extra request shared by
 * every consumer on the screen.
 */
export const useBusinessNames = () => {
  const { data, isLoading, isError } = useGetBusinessesQuery({
    page: 1,
    size: 100,
  });

  const namesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const business of data?.data?.data ?? []) {
      const name = business.business_name ?? business.name;
      if (business._id && name) map.set(business._id, name);
    }
    return map;
  }, [data]);

  /**
   * A name, or an honest dash. Deliberately does not fall back to the raw
   * ObjectId — an unresolved id is noise in a name column.
   *
   * Memoised on the map so callers can safely use it as a hook dependency;
   * a fresh closure each render would rebuild the table's column defs.
   */
  const businessName = useCallback(
    (id?: string | null): string =>
      (id ? namesById.get(id) : undefined) ?? EM_DASH,
    [namesById]
  );

  return { namesById, businessName, isLoading, isError };
};
