import { getCookies, removeCookie } from '@/lib/helpers/cookies-manager';
import { Middleware } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { PAGES_IN_PROGRESS } from '@/lib/feature-flags';
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
    // Reconciled read surfaces (Qlozet backend)
    'Product',
    'Products',
    'Transaction',
    'Transactions',
    'Vendors',
    'Vendor',
    'Role',
    'Roles',
    'TeamMember',
    'TeamMembers',
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
        // Only bounce to sign-in while the app is locked behind the auth guard.
        // When the guard is off (PAGES_IN_PROGRESS = false) we let in-progress
        // pages render so the app can be worked on without a real session.
        if (PAGES_IN_PROGRESS) {
          removeCookie(SESSION_COOKIE_KEY);
          window.location.replace('/auth/sign-in');
        }
      }
    }
    return next(action);
  };

