// Users API Slice
// RTK Query service for admin management of roles & permissions, team members and
// vendor discovery (Qlozet "Users" tag).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

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

/**
 * A platform administrator — a row of the Administrators table.
 *
 * Not a TeamMember: that is a VENDOR's staff record, scoped to a business.
 * These are Qlozet's own people (User with `type: 'platform'`), which is what
 * GET /users/admins returns.
 */
export interface PlatformAdmin {
  _id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  /** 'active' | 'inactive' | 'suspended' — sign-in requires 'active'. */
  status: string;
  role: { _id: string; name: string | null; description: string | null } | null;
  /** The role name, flattened, so a row still renders if the ref dangles. */
  role_name: string | null;
  profile_picture?: string | null;
  last_login_at?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type AdminStatus = 'active' | 'inactive' | 'suspended';

export interface GetAdminsParams {
  page?: number;
  size?: number;
  search?: string;
  /** Role id or name. */
  role?: string;
  status?: AdminStatus;
}

export interface CreateAdminRequest {
  full_name: string;
  email: string;
  phone_number?: string;
  /** Role id — the picker sends the id, not the display label. */
  role: string;
}

export interface UpdateAdminRequest {
  full_name?: string;
  /** Sign-in identity — must stay unique across every account. */
  email?: string;
  phone_number?: string;
  role?: string;
  status?: AdminStatus;
}

/** One row of the Edit Access grid, with the permission id behind each cell. */
export interface ConsolePermissionGroup {
  resource: string;
  label: string;
  module: string;
  actions: Record<'view' | 'create' | 'edit' | 'delete', string | null>;
}

export interface Vendor {
  _id: string;
  business_name?: string;
  business_email?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * The signed-in platform user (GET /users/me).
 *
 * The response shape isn't documented in Swagger, so the known keys are all
 * optional and the index signature keeps anything extra. Read display values
 * through the helpers in src/lib/current-user.ts rather than reaching for a
 * specific key here.
 */
export interface CurrentUser {
  _id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  role?: string | { name?: string };
  profile_image?: string;
  profileImage?: string;
  avatar?: string;
  image?: string;
  [key: string]: unknown;
}

// API Slice
export const usersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Roles & permissions ----

    // The signed-in user — drives the top bar's name + avatar.
    getCurrentUser: builder.query<ApiResponse<CurrentUser>, void>({
      query: () => ({ url: '/users/me', method: 'GET' }),
      providesTags: ['CurrentUser'],
    }),

    // `type` matters: unfiltered this returns vendor roles too, and offering a
    // vendor role in the console's role picker creates an admin who cannot pass
    // the platform guard.
    getRoles: builder.query<
      ApiResponse<Role[]>,
      { type?: 'platform' | 'vendor' } | void
    >({
      query: (params) => ({
        url: `/users/roles${buildQueryString({ type: params?.type })}`,
        method: 'GET',
      }),
      providesTags: ['Roles'],
    }),

    // The module x action grid the Edit Access screen renders, with the real
    // permission id behind every cell.
    getConsolePermissions: builder.query<
      ApiResponse<ConsolePermissionGroup[]>,
      void
    >({
      query: () => ({ url: '/users/permissions', method: 'GET' }),
      providesTags: ['Permissions'],
    }),

    getVendorRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => ({ url: '/users/roles/vendor', method: 'GET' }),
      providesTags: ['Roles'],
    }),

    getRole: builder.query<ApiResponse<Role>, string>({
      query: (id) => ({ url: `/users/roles/${id}`, method: 'GET' }),
      providesTags: ['Role'],
    }),

    createRole: builder.mutation<ApiResponse<Role>, CreateRoleRequest>({
      query: (body) => ({ url: '/users/roles', method: 'POST', body }),
      invalidatesTags: ['Roles'],
    }),

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

    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/users/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Roles'],
    }),

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

    // Replaces the role's grant with exactly this set. The grid is a complete
    // picture of what the role may do, so saving it has to clear what was
    // unticked — assign/remove alone cannot.
    setRolePermissions: builder.mutation<
      ApiResponse<Role>,
      { id: string; data: PermissionIdsRequest }
    >({
      query: ({ id, data }) => ({
        url: `/users/roles/${id}/permissions`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Role', 'Roles'],
    }),

    // Idempotent: creates whichever of the console's standard platform roles
    // are missing and leaves the rest alone.
    createDefaultRoles: builder.mutation<
      ApiResponse<{ created: string[] }>,
      void
    >({
      query: () => ({ url: '/users/roles/defaults', method: 'POST' }),
      invalidatesTags: ['Roles'],
    }),

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

    getTeamMembers: builder.query<ApiResponse<TeamMember[]>, void>({
      query: () => ({ url: '/users/team/members', method: 'GET' }),
      providesTags: ['TeamMembers'],
    }),

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

    // ---- Platform administrators ----

    getAdmins: builder.query<
      ApiResponse<PaginatedData<PlatformAdmin>>,
      GetAdminsParams | void
    >({
      query: (params) => ({
        url: `/users/admins${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Admins'],
    }),

    createAdmin: builder.mutation<
      ApiResponse<PlatformAdmin>,
      CreateAdminRequest
    >({
      query: (body) => ({ url: '/users/admins', method: 'POST', body }),
      invalidatesTags: ['Admins'],
    }),

    updateAdmin: builder.mutation<
      ApiResponse<PlatformAdmin>,
      { id: string; data: UpdateAdminRequest }
    >({
      query: ({ id, data }) => ({
        url: `/users/admins/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Admins', 'Admin'],
    }),

    setAdminStatus: builder.mutation<
      ApiResponse<PlatformAdmin>,
      { id: string; status: AdminStatus }
    >({
      query: ({ id, status }) => ({
        url: `/users/admins/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Admins', 'Admin'],
    }),

    deleteAdmin: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/users/admins/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admins'],
    }),

    // ---- Vendors discovery ----

    getVendors: builder.query<ApiResponse<PaginatedData<Vendor>>, void>({
      query: () => ({ url: '/users/vendors', method: 'GET' }),
      providesTags: ['Vendors'],
    }),

    getNewVendorsThisWeek: builder.query<ApiResponse<Vendor[]>, void>({
      query: () => ({ url: '/users/vendors/new-week', method: 'GET' }),
      providesTags: ['Vendors'],
    }),

    getTopVendorsThisWeek: builder.query<ApiResponse<Vendor[]>, void>({
      query: () => ({ url: '/users/vendors/top-week', method: 'GET' }),
      providesTags: ['Vendors'],
    }),

    getVendorByBusinessId: builder.query<ApiResponse<Vendor>, string>({
      query: (businessId) => ({
        url: `/users/vendors/${businessId}`,
        method: 'GET',
      }),
      providesTags: ['Vendor'],
    }),
  }),
});

// Export hooks
export const {
  useGetCurrentUserQuery,
  useGetRolesQuery,
  useGetConsolePermissionsQuery,
  useGetVendorRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRolePermissionsMutation,
  useRemoveRolePermissionsMutation,
  useSetRolePermissionsMutation,
  useCreateDefaultRolesMutation,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useSetAdminStatusMutation,
  useDeleteAdminMutation,
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useGetVendorsQuery,
  useGetNewVendorsThisWeekQuery,
  useGetTopVendorsThisWeekQuery,
  useGetVendorByBusinessIdQuery,
} = usersApiSlice;
