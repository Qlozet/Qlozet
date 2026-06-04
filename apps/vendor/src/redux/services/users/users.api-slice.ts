// Users API Slice
// RTK Query service for the Qlozet "Users" tag: the authenticated user, roles &
// permissions, team members, followed/discoverable vendors, payout settings and
// customer shipping addresses.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

// ---- Types ----

// VendorUserDto (the authenticated user record)
export interface CurrentUser {
  _id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  email_verified?: boolean;
  role?: string;
  profile_picture?: string;
  status?: string;
  must_change_password?: boolean;
  wishlist?: string[];
  aesthetic_preferences?: string[];
  body_fit?: string[];
  wears_preference?: unknown;
  business?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// UpdateUserDto
export interface UpdateUserRequest {
  phone_number?: string;
  dob?: string;
  gender?: 'male' | 'female';
  profile_picture?: string;
  wears_preference?: string;
  aesthetic_preferences?: string[];
  body_fit?: string[];
}

// UpdatePlatformSettingsDto (payout settings)
export interface PayoutSettings {
  payout_cycle?: 'weekly' | 'bi-weekly' | 'monthly';
  minimum_payout?: number;
  payout_delay_days?: number;
  tailored_order_upfront?: number;
  platform_commission_percent?: number;
  payment_handling_fee_percent?: number;
  payment_handling_fee_flat?: number;
  [key: string]: unknown;
}

export interface Role {
  _id: string;
  name?: string;
  type?: 'vendor' | 'platform';
  description?: string;
  isDefault?: boolean;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// CreateRoleDto
export interface CreateRoleRequest {
  name: string;
  type: 'vendor' | 'platform';
  description?: string;
  isDefault?: boolean;
}

// UpdateRoleDto
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

// AssignPermissionsDto
export interface PermissionIdsRequest {
  permission_ids: string[];
}

// InviteTeamMemberDto
export interface InviteTeamMemberRequest {
  role: string;
  email: string;
  full_name: string;
  phone_number: string;
}

export interface TeamMember {
  _id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
  status?: string;
  [key: string]: unknown;
}

// AddressDto
export interface ShippingAddressRequest {
  full_name?: string;
  phone_number?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
}

export interface FeedParams {
  page?: string | number;
  size?: string | number;
  business_limit?: string | number;
}

// ---- API Slice ----
export const usersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /users/me — current authenticated user
    getMe: builder.query<ApiResponse<CurrentUser>, void>({
      query: () => ({ url: '/users/me', method: 'GET' }),
      providesTags: ['Me'],
    }),

    // PATCH /users/me/profile — update the current user's profile
    updateMyProfile: builder.mutation<ApiResponse<CurrentUser>, UpdateUserRequest>({
      query: (body) => ({ url: '/users/me/profile', method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),

    // GET /users/me/following-businesses
    getFollowingBusinesses: builder.query<ApiResponse<unknown[]>, void>({
      query: () => ({ url: '/users/me/following-businesses', method: 'GET' }),
      providesTags: ['FollowingBusinesses'],
    }),

    // DELETE /users/delete — delete the current account
    deleteMyAccount: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/users/delete', method: 'DELETE' }),
      invalidatesTags: ['Me'],
    }),

    // GET /users/feed — personalised feed
    getUserFeed: builder.query<ApiResponse<unknown>, FeedParams | void>({
      query: (params) => ({
        url: `/users/feed${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
    }),

    // ---- Payout settings ----

    // GET /users/platform-settings — current payout settings
    getPayoutSettings: builder.query<ApiResponse<PayoutSettings>, void>({
      query: () => ({ url: '/users/platform-settings', method: 'GET' }),
      providesTags: ['PlatformSettings'],
    }),

    // PUT /users/platform-settings — update payout settings
    updatePayoutSettings: builder.mutation<
      ApiResponse<PayoutSettings>,
      Partial<PayoutSettings>
    >({
      query: (body) => ({
        url: '/users/platform-settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['PlatformSettings'],
    }),

    // ---- Roles & permissions ----

    // GET /users/roles — all roles (platform + vendor)
    getRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => ({ url: '/users/roles', method: 'GET' }),
      providesTags: ['Roles'],
    }),

    // GET /users/roles/vendor — vendor roles only
    getVendorRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => ({ url: '/users/roles/vendor', method: 'GET' }),
      providesTags: ['Roles'],
    }),

    // GET /users/roles/{id}
    getRole: builder.query<ApiResponse<Role>, string>({
      query: (id) => ({ url: `/users/roles/${id}`, method: 'GET' }),
      providesTags: ['Role'],
    }),

    // POST /users/roles — create a role
    createRole: builder.mutation<ApiResponse<Role>, CreateRoleRequest>({
      query: (body) => ({ url: '/users/roles', method: 'POST', body }),
      invalidatesTags: ['Roles'],
    }),

    // PATCH /users/roles/{id} — update a role
    updateRole: builder.mutation<
      ApiResponse<Role>,
      { id: string; data: UpdateRoleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/users/roles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Role', 'Roles'],
    }),

    // DELETE /users/roles/{id}
    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/users/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Roles'],
    }),

    // POST /users/roles/{id}/assign-permissions
    assignRolePermissions: builder.mutation<
      ApiResponse<Role>,
      { id: string; data: PermissionIdsRequest }
    >({
      query: ({ id, data }) => ({
        url: `/users/roles/${id}/assign-permissions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Role', 'Roles'],
    }),

    // POST /users/roles/{id}/remove-permissions
    removeRolePermissions: builder.mutation<
      ApiResponse<Role>,
      { id: string; data: PermissionIdsRequest }
    >({
      query: ({ id, data }) => ({
        url: `/users/roles/${id}/remove-permissions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Role', 'Roles'],
    }),

    // ---- Team ----

    // GET /users/team/members
    getTeamMembers: builder.query<ApiResponse<TeamMember[]>, void>({
      query: () => ({ url: '/users/team/members', method: 'GET' }),
      providesTags: ['TeamMembers'],
    }),

    // POST /users/team/invite-member
    inviteTeamMember: builder.mutation<
      ApiResponse<TeamMember>,
      InviteTeamMemberRequest
    >({
      query: (body) => ({
        url: '/users/team/invite-member',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TeamMembers'],
    }),

    // ---- Vendors discovery ----

    // GET /users/vendors
    getVendors: builder.query<ApiResponse<PaginatedData<unknown>>, void>({
      query: () => ({ url: '/users/vendors', method: 'GET' }),
      providesTags: ['Vendors'],
    }),

    // GET /users/vendors/new-week
    getNewVendorsThisWeek: builder.query<ApiResponse<unknown[]>, void>({
      query: () => ({ url: '/users/vendors/new-week', method: 'GET' }),
      providesTags: ['Vendors'],
    }),

    // GET /users/vendors/top-week
    getTopVendorsThisWeek: builder.query<ApiResponse<unknown[]>, void>({
      query: () => ({ url: '/users/vendors/top-week', method: 'GET' }),
      providesTags: ['Vendors'],
    }),

    // GET /users/vendors/{business_id}
    getVendorByBusinessId: builder.query<ApiResponse<unknown>, string>({
      query: (businessId) => ({
        url: `/users/vendors/${businessId}`,
        method: 'GET',
      }),
      providesTags: ['Vendors'],
    }),

    // POST /users/{business_id}/follow
    followBusiness: builder.mutation<ApiResponse<unknown>, string>({
      query: (businessId) => ({
        url: `/users/${businessId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: ['FollowingBusinesses', 'Vendors'],
    }),

    // DELETE /users/{business_id}/unfollow
    unfollowBusiness: builder.mutation<ApiResponse<unknown>, string>({
      query: (businessId) => ({
        url: `/users/${businessId}/unfollow`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FollowingBusinesses', 'Vendors'],
    }),

    // ---- Customer shipping address ----

    // GET /users/customer/shipping-address
    getShippingAddress: builder.query<ApiResponse<unknown>, void>({
      query: () => ({
        url: '/users/customer/shipping-address',
        method: 'GET',
      }),
      providesTags: ['ShippingAddress'],
    }),

    // POST /users/customer/shipping-address/upsert
    upsertShippingAddress: builder.mutation<
      ApiResponse<unknown>,
      ShippingAddressRequest
    >({
      query: (body) => ({
        url: '/users/customer/shipping-address/upsert',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ShippingAddress'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetMeQuery,
  useUpdateMyProfileMutation,
  useGetFollowingBusinessesQuery,
  useDeleteMyAccountMutation,
  useGetUserFeedQuery,
  useGetPayoutSettingsQuery,
  useUpdatePayoutSettingsMutation,
  useGetRolesQuery,
  useGetVendorRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRolePermissionsMutation,
  useRemoveRolePermissionsMutation,
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useGetVendorsQuery,
  useGetNewVendorsThisWeekQuery,
  useGetTopVendorsThisWeekQuery,
  useGetVendorByBusinessIdQuery,
  useFollowBusinessMutation,
  useUnfollowBusinessMutation,
  useGetShippingAddressQuery,
  useUpsertShippingAddressMutation,
} = usersApiSlice;
