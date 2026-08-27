'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getCookies } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { env } from '@/env';
import type { OrderMessage } from '@/redux/services/messaging/messaging.api-slice';

// The Socket.IO server is the API origin without the `/api` suffix.
function socketOrigin(): string {
  return env.NEXT_PUBLIC_BASE_URL.replace(/\/api\/?$/, '');
}

/**
 * Subscribe to live `order-message` events for a single order thread. Fires
 * onMessage for messages on `reference`. Auth uses the vendor session cookie.
 */
export function useOrderMessageSocket(
  reference: string | null,
  enabled: boolean,
  onMessage: (m: OrderMessage) => void
) {
  const cbRef = useRef(onMessage);
  useEffect(() => {
    cbRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !reference || typeof window === 'undefined') return;
    const token = getCookies({ key: SESSION_COOKIE_KEY });
    if (!token) return;

    const socket: Socket = io(socketOrigin(), {
      auth: { token },
      transports: ['websocket'],
    });
    const handler = (m: OrderMessage) => {
      if (m?.order_reference === reference) cbRef.current(m);
    };
    socket.on('order-message', handler);

    return () => {
      socket.off('order-message', handler);
      socket.disconnect();
    };
  }, [enabled, reference]);
}
