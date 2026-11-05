import { getCookies, removeCookie } from '@/lib/helpers/cookies-manager';
import { Dispatch, Middleware } from '@reduxjs/toolkit';
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { SESSION_COOKIE_KEY, REFRESH_COOKIE_KEY } from '../../lib/constants';
import { AUTH_ROUTES } from '@/lib/routes';
import { env } from '@/env';
import { toast } from 'sonner';
import { readApiError } from '@/redux/services/types';
import {
  clearAuth,
  forgetBusiness,
  openStorePicker,
  setCredentials,
} from '@/redux/slices/auth-slice';
import type { Business, ActiveBusiness } from '@/redux/slices/auth-slice';
import {
  beginAccessLossHandling,
  classifyAccessLoss,
} from '@/lib/session/access-loss';

const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const userToken = getCookies({ key: SESSION_COOKIE_KEY });
    if (userToken) {
      headers.set('authorization', `Bearer ${userToken}`);
    }
    return headers;
  },
});

/**
 * Full sign-out: forget the persisted stores, drop every cached response,
 * remove both session cookies and hard-navigate to sign-in, so nothing from
 * this session (state, sockets, in-flight requests) survives into the next.
 */
export const signOut = (dispatch: Dispatch) => {
  dispatch(clearAuth());
  dispatch(baseAPI.util.resetApiState());
  removeCookie(SESSION_COOKIE_KEY);
  removeCookie(REFRESH_COOKIE_KEY);
  if (typeof window !== 'undefined') {
    window.location.assign(AUTH_ROUTES.signIn);
  }
};

type AuthSnapshot = {
  auth?: {
    businesses?: Business[];
    activeBusiness?: ActiveBusiness | null;
  };
};

/**
 * The person lost access to the store they have open mid-session (temporary
 * password still in place, access turned off, or removed from the team).
 * Say so once, then steer them somewhere that works: the password page, the
 * store picker when they belong to another store, or sign-in.
 */
const handleAccessLoss = (
  kind: 'set-password' | 'revoked',
  message: string,
  dispatch: Dispatch,
  getState: () => unknown
) => {
  if (!beginAccessLossHandling()) return;
  toast.error(message, { id: 'access-loss' });

  if (kind === 'set-password') {
    // The (user) layout's guard routes to the create-new-password page as
    // soon as this flag is set, and that page shows the set-your-own form.
    dispatch(setCredentials({ mustChangePassword: true }));
    return;
  }

  const { auth } = (getState() as AuthSnapshot) ?? {};
  const activeId = auth?.activeBusiness?._id;
  const others = (auth?.businesses ?? []).filter((b) => b._id !== activeId);
  if (others.length > 0) {
    if (activeId) dispatch(forgetBusiness(activeId));
    dispatch(openStorePicker(message));
    return;
  }
  signOut(dispatch);
};

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

const baseQueryWithAccessCheck: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  // Auth endpoints (switching to a store you were removed from, changing the
  // temporary password) report these refusals to their own caller, and are
  // about a store other than the open one.
  if (result.error?.status === 403 && !AUTH_401_ENDPOINTS.has(api.endpoint)) {
    const message = readApiError(result.error, '');
    const kind = classifyAccessLoss(403, message);
    if (kind) handleAccessLoss(kind, message, api.dispatch, api.getState);
  }
  return result;
};

export const baseAPI = createApi({
  baseQuery: baseQueryWithAccessCheck,
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
    'HelpArticles',
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

// Endpoints whose 403 the page explains itself, so no generic toast.
// getVerification: the dashboard banner is owner-only and simply hides.
const QUIET_403_ENDPOINTS = new Set(['getTeamMembers', 'getVerification']);

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
      const endpointName = action?.meta?.arg?.endpointName;
      // The team tab shows its own "only the owner" state for this one.
      if (endpointName && QUIET_403_ENDPOINTS.has(endpointName)) {
        return next(action);
      }
      const message = readApiError(
        action.payload,
        "You don't have permission to perform this action."
      );
      // Lost access to the store: the base query has already said so once
      // and moved the person on; a toast per failed request would pile up.
      if (classifyAccessLoss(403, message)) return next(action);
      toast.error(message);
    }
    return next(action);
  };
