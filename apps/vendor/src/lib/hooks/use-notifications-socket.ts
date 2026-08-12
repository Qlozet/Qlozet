'use client';

import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { getCookies } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { env } from '@/env';
import { useAppDispatch } from '@/redux/store';
import { baseAPI } from '@/redux/api/base-api';

// ─── Realtime notifications ───────────────────────────────────
// Connects to the backend Socket.IO gateway with the vendor's Bearer token and
// listens for `notification` pings. On each ping we invalidate the RTK Query
// `Notification` cache so the list + unread badge refetch — REST stays the
// source of truth; the socket is just the trigger.
export function useNotificationsSocket(showToast = true) {
  const dispatch = useAppDispatch();

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

    const onNotification = (n: { title?: string; body?: string }) => {
      dispatch(baseAPI.util.invalidateTags(['Notification']));
      if (showToast && n?.title) {
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
