'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { getCookies } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { env } from '@/env';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { baseAPI } from '@/redux/api/base-api';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';

// ─── Realtime notifications ───────────────────────────────────
// Connects to the backend Socket.IO gateway with the vendor's Bearer token and
// listens for `notification` pings. On each ping we invalidate the RTK Query
// `Notification` cache so the list + unread badge refetch — REST stays the
// source of truth; the socket is just the trigger.
export function useNotificationsSocket(showToast = true) {
  const dispatch = useAppDispatch();
  // A person on several stores' teams gets one socket room; a push for a
  // store other than the one on screen still refreshes the (server-scoped)
  // list and badge, but is not announced here as if it were this store's.
  const activeBusinessId = useAppSelector(selectActiveBusiness)?._id ?? null;
  const activeRef = useRef<string | null>(activeBusinessId);
  useEffect(() => {
    activeRef.current = activeBusinessId;
  }, [activeBusinessId]);

  useEffect(() => {
    const token = getCookies({ key: SESSION_COOKIE_KEY });
    if (!token) return;

    // Socket.IO attaches at the API origin root (/socket.io), not under /api.
    let origin = env.NEXT_PUBLIC_BASE_URL as string;
    try {
      origin = new URL(env.NEXT_PUBLIC_BASE_URL as string).origin;
    } catch {
      /* keep as-is */
    }

    const socket: Socket = io(origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    const onNotification = (n: {
      title?: string;
      body?: string;
      recipient_business?: string | null;
      audience?: 'customer' | 'vendor' | null;
    }) => {
      dispatch(baseAPI.util.invalidateTags(['Notification']));
      // A chat reply raises a notification, so this is also the live trigger
      // for the unread-message badges on the orders list. Cheap: one small
      // request, and only when something actually arrived.
      dispatch(
        baseAPI.util.invalidateTags([
          { type: 'OrderMessages' as const, id: 'UNREAD' },
        ])
      );
      const forOtherStore =
        !!n?.recipient_business &&
        !!activeRef.current &&
        n.recipient_business !== activeRef.current;
      // Sent to this person as a shopper: it belongs in the shop, not here.
      const forShopping = n?.audience === 'customer';
      if (showToast && n?.title && !forOtherStore && !forShopping) {
        toast(n.title, { description: n.body });
      }
    };

    socket.on('notification', onNotification);

    return () => {
      socket.off('notification', onNotification);
      socket.disconnect();
    };
  }, [dispatch, showToast]);
}
