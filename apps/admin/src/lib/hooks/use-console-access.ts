'use client';

import { useCallback } from 'react';
import { useGetMyAccessQuery } from '@/redux/services/users/users.api-slice';
import {
  can,
  canView,
  type ConsoleAction,
  type ConsoleResource,
} from '@/lib/access';

/**
 * The signed-in account's console access, with the two questions the UI
 * asks. One query, cached by RTK, shared by the sidebar, the route gate and
 * any screen that wants to hide a button.
 */
export const useConsoleAccess = () => {
  const { data, isLoading, isError, refetch } = useGetMyAccessQuery();
  const access = data?.data;

  const canDo = useCallback(
    (resource: ConsoleResource, action: ConsoleAction) =>
      can(access, resource, action),
    [access]
  );
  const canSee = useCallback(
    (resource: ConsoleResource | null) => canView(access, resource),
    [access]
  );

  return { access, isLoading, isError, refetch, can: canDo, canView: canSee };
};
