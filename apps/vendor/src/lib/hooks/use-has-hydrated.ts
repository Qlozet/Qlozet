'use client';

import { useEffect, useState } from 'react';

/**
 * False during SSR and the first client render, true from the first effect on.
 *
 * Gate any UI that branches on redux-persist state behind this. The server
 * renders against the initial store — nothing has been rehydrated from
 * localStorage yet — so reading a persisted value while rendering produces
 * markup the client then disagrees with, and React throws a hydration
 * mismatch.
 */
export const useHasHydrated = (): boolean => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};
