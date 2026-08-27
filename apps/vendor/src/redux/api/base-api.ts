import { getCookies, removeCookie } from '@/lib/helpers/cookies-manager';
import { Middleware } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SESSION_COOKIE_KEY } from '../../lib/constants';
import { env } from '@/env';
import { toast } from 'sonner';

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
    'Product',
    'Category',
    'Products',
    'WalletStats',
    'OrderStats',
    'Transaction',
    'Transactions',
    'Beneficiary',
    'WalletBalance',
    'PayoutAccount',
    'Bank',
    'SupportTicket',
    'VendorDetails',
    'Warehouse',
    'Warehouses',
    'User',
    'OrderSettings',
    'ProductDetails',
    'ProductReviews',
    'ProductLikes',
    'Order',
    'Orders',
    'Notification',
    'NotificationSettings',
    'DashboardMetrics',
    'DashboardCharts',
    'DashboardAnalytics',
    'Customer',
    'CustomerStats',
    'Auth',
    'Profile',
    'Me',
    // Reconciled domains (Qlozet backend)
    'BusinessProfile',
    'BusinessAddress',
    'Earnings',
    'Collection',
    'Collections',
    'Discount',
    'Discounts',
    'TokenBalance',
    'Role',
    'Roles',
    'TeamMember',
    'TeamMembers',
    'MeasurementSet',
    'MeasurementSets',
    'Courier',
    'Shipment',
    'Ticket',
    'Tickets',
    'Vendors',
    'FollowingBusinesses',
    'ShippingAddress',
    'PlatformSettings',
    'StyleLibrary',
    'Taxonomy',
    'SizeGuide',
    'SizeGuides',
    'Return',
    'Returns',
    'Dispute',
    'Disputes',
    'OrderMessages',
    'AssistantConversation',
    'AssistantConversations',
    'AssistantDigest',
  ],
  endpoints: () => ({}),
});

// Endpoints where a 401 is a DOMAIN / credential error (e.g. "wrong password",
// "you are not a member of this business"), NOT an expired session. These must
// be left for the calling component to catch and show — auto-logging out here
// hides the real error and boots the user to sign-in (the switch-business bug).
const AUTH_401_ENDPOINTS = new Set([
  'switchBusiness',
  'signIn',
  'login',
  'register',
  'forgotPassword',
  'forgotPasswordGeneral',
  'resetPassword',
  'resetPasswordGeneral',
  'changePassword',
  'verifyEmail',
  'resendVerificationEmail',
]);

// Create a custom middleware to handle 401 errors
export const custom401Middleware: Middleware =
  () => (next: any) => (action: any) => {
    if (
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      'payload' in action &&
      typeof action.type === 'string' &&
      action.type.endsWith('/rejected') &&
      typeof action.payload === 'object' &&
      action.payload !== null &&
      'status' in action.payload &&
      action.payload.status === 401
    ) {
      const endpointName = action?.meta?.arg?.endpointName;
      // Session-expiry 401 on a data endpoint → sign the user out. But a 401 from
      // an auth endpoint (bad credentials, not-a-member) is a normal result the
      // caller handles, so don't clobber the session or redirect for those.
      if (endpointName && AUTH_401_ENDPOINTS.has(endpointName)) {
        return next(action);
      }
      console.log('Received 401 Unauthorized response');
      removeCookie(SESSION_COOKIE_KEY);
      window.location.replace('/auth/sign-in');
    }
    return next(action);
  };

// Global 403 handler — shows a toast when a team member lacks permission
export const custom403Middleware: Middleware =
  () => (next: any) => (action: any) => {
    if (
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      'payload' in action &&
      typeof action.type === 'string' &&
      action.type.endsWith('/rejected') &&
      typeof action.payload === 'object' &&
      action.payload !== null &&
      'status' in action.payload &&
      action.payload.status === 403
    ) {
      const message =
        (action.payload as any)?.data?.message ||
        "You don't have permission to perform this action.";
      toast.error(message);
    }
    return next(action);
  };
