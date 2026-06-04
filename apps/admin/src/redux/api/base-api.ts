import { getCookies, removeCookie } from '@/lib/helpers/cookies-manager';
import { Middleware } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { env } from '@/env';

const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

export const baseAPI = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const userToken = getCookies({ key: SESSION_COOKIE_KEY });
      if (userToken) {
        headers.set('authorization', `Bearer ${userToken}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Business',
    'Businesses',
    'Customer',
    'Customers',
    'Ticket',
    'Tickets',
    'PlatformSettings',
    'DashboardMetrics',
    'VendorDashboard',
    'VendorOrders',
    'TokenPrice',
    'Auth',
    'Profile',
  ],
  endpoints: () => ({}),
});

// Create a custom middleware to handle 401 errors
export const custom401Middleware: Middleware =
  () => (next) => (action) => {
    if (
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      'payload' in action &&
      typeof (action as { type: unknown }).type === 'string' &&
      (action as { type: string }).type.endsWith('/rejected')
    ) {
      const payload = (action as { payload: unknown }).payload;
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'status' in payload &&
        (payload as { status: unknown }).status === 401
      ) {
        console.log('Received 401 Unauthorized response');
        removeCookie(SESSION_COOKIE_KEY);
        window.location.replace('/auth/sign-in');
      }
    }
    return next(action);
  };
