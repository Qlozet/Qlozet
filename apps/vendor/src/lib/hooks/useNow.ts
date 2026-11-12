'use client';

import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every `everyMs` (a minute by default), so a
 * countdown on screen keeps moving without a reload.
 */
export function useNow(everyMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}
