'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  DASHBOARD_RANGE_STORAGE_KEY,
  DEFAULT_DASHBOARD_RANGE,
  isDashboardRangeKey,
  type DashboardRangeKey,
} from './dashboard-range';

// A tiny external store rather than context: the setting is per browser, not
// per render tree, and useSyncExternalStore gives the server snapshot ('7d')
// on the first paint and the saved value right after - no setState-in-effect,
// no hydration mismatch.
const listeners = new Set<() => void>();

// What was chosen in this page's lifetime - the answer when storage is
// blocked (private mode), so the choice still holds until the tab closes.
let inMemory: DashboardRangeKey | null = null;

const read = (): DashboardRangeKey => {
  try {
    const saved = window.localStorage.getItem(DASHBOARD_RANGE_STORAGE_KEY);
    if (isDashboardRangeKey(saved)) return saved;
  } catch {
    // fall through to the in-memory choice
  }
  return inMemory ?? DEFAULT_DASHBOARD_RANGE;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Another tab changing it should move this one too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === DASHBOARD_RANGE_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

export function setDashboardRange(key: DashboardRangeKey): void {
  inMemory = key;
  try {
    window.localStorage.setItem(DASHBOARD_RANGE_STORAGE_KEY, key);
  } catch {
    // Private mode or blocked storage: the in-memory copy carries it.
  }
  listeners.forEach((l) => l());
}

/** The current dashboard range and its setter. */
export function useDashboardRange(): [
  DashboardRangeKey,
  (key: DashboardRangeKey) => void,
] {
  const range = useSyncExternalStore(
    subscribe,
    read,
    () => DEFAULT_DASHBOARD_RANGE
  );
  const set = useCallback(
    (key: DashboardRangeKey) => setDashboardRange(key),
    []
  );
  return [range, set];
}
