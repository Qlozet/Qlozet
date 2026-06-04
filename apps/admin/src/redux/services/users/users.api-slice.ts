// Users API Slice
// RTK Query service for admin management of roles & permissions, team members and
// vendor discovery (Qlozet "Users" tag).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData } from '../types';

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

export interface Vendor {
  _id: string;
  business_name?: string;
  business_email?: string;
  status?: string;
  [key: string]: unknown;
}

// API Slice
export const usersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Roles & permissions ----

    getRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => ({ url: '/users/roles', method: 'GET' }),
      providesTags: ['Roles'],
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
} = usersApiSlice;
