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
 *
 * onResync runs whenever messages may have been missed (every reconnect, the
 * tab coming back into view, the network returning) so the thread can refetch.
 */
export function useOrderMessageSocket(
  reference: string | null,
  enabled: boolean,
  onMessage: (m: OrderMessage) => void,
  onResync?: () => void
) {
  const cbRef = useRef(onMessage);
  const resyncRef = useRef(onResync);
  useEffect(() => {
    cbRef.current = onMessage;
    resyncRef.current = onResync;
  }, [onMessage, onResync]);

  useEffect(() => {
    if (!enabled || !reference || typeof window === 'undefined') return;
    const readToken = () => getCookies({ key: SESSION_COOKIE_KEY });
    if (!readToken()) return;

    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 2000;

    const socket: Socket = io(socketOrigin(), {
      // A function, so every reconnect sends the current session token.
      auth: (cb) => cb({ token: readToken() }),
      transports: ['websocket'],
    });
    const resync = () => resyncRef.current?.();

    const handler = (m: OrderMessage) => {
      if (m?.order_reference === reference) cbRef.current(m);
    };
    // Every (re)connect: catch up on anything sent while we weren't listening.
    const onConnect = () => {
      retryDelay = 2000;
      resync();
    };
    // The server only hangs up on its own when the session token is no longer
    // valid. Refetch (an expired session signs out as usual), then try again
    // with whatever token is current, backing off up to 30s.
    const onDisconnect = (reason: string) => {
      if (stopped || reason !== 'io server disconnect') return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => {
        resync();
        if (stopped || !readToken()) return;
        retryDelay = Math.min(retryDelay * 2, 30000);
        socket.connect();
      }, retryDelay);
    };
    // Tab back in view or network back: catch up straight away rather than
    // waiting for the connection to notice it went stale.
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      resync();
      if (!socket.connected) socket.connect();
    };

    socket.on('order-message', handler);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
      socket.off('order-message', handler);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, [enabled, reference]);
}
