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
  ],
  endpoints: () => ({}),
});

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
