'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useSwitchBusinessMutation } from '@/redux/services/auth/auth.api-slice';
import { useAppDispatch } from '@/redux/store';
import {
  forgetBusiness,
  setActiveBusiness,
  type ActiveBusiness,
} from '@/redux/slices/auth-slice';
import { baseAPI } from '@/redux/api/base-api';
import { readApiError } from '@/redux/services/types';
import { storeSessionTokens } from '@/lib/session/tokens';
import { resetAccessLossGuard } from '@/lib/session/access-loss';

/**
 * Open another store the person belongs to: the one flow used by the sign-in
 * picker, the shell's store switcher and the picker shown after losing
 * access. Resolves to the store now open, or null when the switch failed
 * (the error has already been shown).
 */
export const useSwitchStore = () => {
  const dispatch = useAppDispatch();
  const [switchBusiness] = useSwitchBusinessMutation();
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const switchStore = useCallback(
    async (businessId: string): Promise<ActiveBusiness | null> => {
      setSwitchingId(businessId);
      try {
        const result = await switchBusiness({
          business_id: businessId,
        }).unwrap();

        // Replace tokens with the new ones
        storeSessionTokens(
          result.data.token.access_token,
          result.data.token.refresh_token
        );

        // Update active business in Redux (also closes the shell's picker)
        dispatch(setActiveBusiness(result.data.active_business));

        // Clear ALL cached API data so the dashboard (and every other view)
        // refetches under the new business + token, instead of showing the
        // previous business's cached data until a manual refresh.
        dispatch(baseAPI.util.resetApiState());

        // Somewhere that works again: a later loss of access is news.
        resetAccessLossGuard();
        return result.data.active_business;
      } catch (err: unknown) {
        // 401 / 403 from a switch means this store can't be opened any more:
        // it was deleted, or the person was removed or switched off there.
        // The list is the one saved at sign-in, so drop the store from it
        // rather than leave a dead entry that refuses every tap.
        const status = (err as { status?: unknown })?.status;
        if (status === 401 || status === 403) {
          dispatch(forgetBusiness(businessId));
          toast.error(
            `${readApiError(err, 'You can no longer open this store.')} It has been removed from your list.`
          );
          return null;
        }
        toast.error(readApiError(err, 'Failed to switch business'));
        return null;
      } finally {
        setSwitchingId(null);
      }
    },
    [dispatch, switchBusiness]
  );

  return { switchStore, switchingId };
};
