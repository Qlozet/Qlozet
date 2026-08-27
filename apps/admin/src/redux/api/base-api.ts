import { getCookies, removeCookie } from '@/lib/helpers/cookies-manager';
import { Middleware } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { AUTH_ROUTES } from '@/lib/routes';
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
    'CustomerMeasurements',
    'CustomerReviews',
    'Ticket',
    'Tickets',
    'PlatformSettings',
    'DashboardMetrics',
    'VendorDashboard',
    'VendorNotes',
    'VendorOrders',
    'TokenPrice',
    'Auth',
    'Profile',
    // Reconciled read surfaces (Qlozet backend)
    'Product',
    'Products',
    'ProductStats',
    'ProductFilters',
    'Transaction',
    'Transactions',
    'Vendors',
    'Vendor',
    'Role',
    'Roles',
    'TeamMember',
    'TeamMembers',
    'Collection',
    'Collections',
    // Notification feed + AI assistant (ported from the vendor app)
    'Notification',
    'AssistantConversations',
    'AssistantConversation',
    'AssistantDigest',
    'CurrentUser',
  ],
  endpoints: () => ({}),
});

// Create a custom middleware to handle 401 errors
export const custom401Middleware: Middleware = () => (next) => (action) => {
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
      // The session is gone or expired — drop the cookie and send the user
      // back to sign-in. The proxy guard handles the same case on navigation;
      // this covers a session that expires while the app is already open.
      removeCookie(SESSION_COOKIE_KEY);
      window.location.replace(AUTH_ROUTES.signIn);
    }
  }
  return next(action);
};
