// Settings API Slice
// RTK Query service for settings-related API operations

import type {
  CompanyDetailsData,
  BillingInvoiceData,
  WarehouseData,
  UserPermissionData,
  OrderSettingsData,
} from '@/lib/validations/settings';
import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface VendorDetailsResponse {
  businessName: string;
  businessAddress: string;
  businessPhoneNumber: string;
  businessEmail: string;
  addressLine2?: string;
  state: string;
  country: string;
  timeZone: string;
  city: string;
  bvn?: string;
  nin?: string;
}

// Business profile as returned by GET /business
export interface BusinessProfileResponse {
  _id: string;
  business_name: string;
  business_email: string;
  business_phone_number?: string;
  business_address?: string;
  address_line_2?: string;
  country?: string;
  state?: string;
  city?: string;
  zip_code?: string;
  time_zone?: string;
  website?: string;
  description?: string;
  year_founded?: string;
  display_picture_url?: string;
  business_logo_url?: string;
  business_logo_svg_url?: string;
  cover_image_url?: string;
  cac_document_url?: string[];
  bvn?: string;
  nin?: string;
  status: string;
  /** Storefront accent colour (hex). */
  theme_color?: string;
  accepts_external_fabric?: boolean;
  // ─── Order settings ───
  // Flat fields, exactly like accepts_external_fabric. The backend also returns
  // a nested `order_settings` object with similarly-named fields — read these
  // flat ones, per the API team, so there's only one source of truth.
  order_confirmation?: boolean;
  order_notifications?: boolean;
  order_tracking?: boolean;
  /** 0 = no limit. */
  daily_order_limit?: number;
  automatic_refunds?: boolean;
  /** 0 | 7 | 14 | 30 | 60 — 0 means returns are not accepted. */
  return_window_days?: number;
  custom_order_options?: boolean;
  default_currency?: string;
  email_verified: boolean;
  address_completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// User profile as returned by GET /users/me
export interface UserProfileResponse {
  _id: string;
  full_name: string;
  email: string;
  phone_number: string;
  username?: string;
  profile_picture?: string;
  gender?: string;
  dob?: string;
  status: string;
  type: string;
  email_verified: boolean;
}

// Matches backend CreateBusinessAddressDto
export interface UpdateBusinessProfilePayload {
  address?: string;
  state?: string;
  city?: string;
  country?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateBusinessProfileDetailsPayload {
  business_name?: string;
  business_email?: string;
  business_phone_number?: string;
  website?: string;
  description?: string;
  year_founded?: string;
  business_logo_url?: string;
  business_logo_svg_url?: string;
  cover_image_url?: string;
  cac_document_url?: string[];
  nin?: string;
  bvn?: string;
  /** Storefront accent colour (hex, e.g. '#8D7F72'). */
  theme_color?: string;
  // ─── Order settings (see BusinessProfileResponse) ───
  order_confirmation?: boolean;
  order_notifications?: boolean;
  order_tracking?: boolean;
  daily_order_limit?: number;
  automatic_refunds?: boolean;
  return_window_days?: number;
  custom_order_options?: boolean;
  default_currency?: string;
}

export interface UpdateUserProfilePayload {
  phone_number?: string;
  username?: string;
  profile_picture?: string;
  gender?: string;
  dob?: string;
}

interface WarehouseResponse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

// API Slice
export const settingsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Business/Organization Profile ───
    getBusinessProfile: builder.query<BusinessProfileResponse, void>({
      query: () => '/business',
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: ['VendorDetails'],
    }),

    updateBusinessProfile: builder.mutation<any, UpdateBusinessProfilePayload>({
      query: (data) => ({
        url: '/business/address',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['VendorDetails'],
    }),

    updateBusinessProfileDetails: builder.mutation<
      any,
      UpdateBusinessProfileDetailsPayload
    >({
      query: (data) => ({
        url: '/business/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['VendorDetails'],
    }),

    // Update business settings (e.g. external fabric policy)
    // Business-level toggles: the external-fabric policy and the flat order
    // settings, all on PATCH /business/profile.
    updateBusinessSettings: builder.mutation<
      any,
      Pick<
        UpdateBusinessProfileDetailsPayload,
        | 'order_confirmation'
        | 'order_notifications'
        | 'order_tracking'
        | 'daily_order_limit'
        | 'automatic_refunds'
        | 'return_window_days'
        | 'custom_order_options'
        | 'default_currency'
      > & { accepts_external_fabric?: boolean }
    >({
      query: (data) => ({
        url: '/business/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['VendorDetails'],
    }),

    // ─── User Profile ───
    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => '/users/me',
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation<any, UpdateUserProfilePayload>({
      query: (data) => ({
        url: '/users/me/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // ─── Legacy: Company Details ───
    getVendorDetails: builder.query<ApiResponse<VendorDetailsResponse>, void>({
      query: () => ({
        url: '/vendor/settings/vendor-details',
        method: 'GET',
      }),
      providesTags: ['VendorDetails'],
    }),

    updateVendorDetails: builder.mutation<
      ApiResponse<VendorDetailsResponse>,
      CompanyDetailsData
    >({
      query: (data) => ({
        url: '/vendor/settings',
        method: 'PUT',
        body: {
          businessName: data.companyName,
          businessAddress: data.addressLine1,
          businessPhoneNumber: data.phone,
          businessEmail: data.email,
          addressLine2: data.addressLine2,
          state: data.state,
          country: data.country,
          timeZone: data.timeZone,
          city: data.city,
          bvn: data.bvn,
          nin: data.nin,
        },
      }),
      invalidatesTags: ['VendorDetails'],
    }),

    // NOTE: the real warehouse endpoints live in business.api-slice
    // (getBusinessWarehouses / create / update / delete / activate). They were
    // duplicated here, which collided on the endpoint names.

    // Legacy (fictional paths — kept only because older components import them)
    getWarehouses: builder.query<ApiResponse<WarehouseResponse[]>, void>({
      query: () => '/vendor/warehouses',
      providesTags: ['Warehouse'],
    }),

    getWarehouse: builder.query<any, void>({
      query: () => '/vendor/warehouse',
      providesTags: ['Warehouse'],
    }),

    createWarehouse: builder.mutation<
      ApiResponse<WarehouseResponse>,
      WarehouseData
    >({
      query: (data) => ({
        url: '/vendor/warehouses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Warehouse'],
    }),

    addWarehouse: builder.mutation<any, any>({
      query: (data) => ({
        url: '/vendor/warehouse/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Warehouse'],
    }),

    updateWarehouse: builder.mutation<
      ApiResponse<WarehouseResponse>,
      { id: string; data: WarehouseData }
    >({
      query: ({ id, data }) => ({
        url: `/vendor/warehouses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Warehouse'],
    }),

    deleteWarehouse: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/vendor/warehouses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Warehouse'],
    }),

    // Users and Permissions
    getUsers: builder.query<ApiResponse<UserResponse[]>, void>({
      query: () => '/vendor/users',
      providesTags: ['User'],
    }),

    createUser: builder.mutation<ApiResponse<UserResponse>, UserPermissionData>(
      {
        query: (data) => ({ url: '/vendor/users', method: 'POST', body: data }),
        invalidatesTags: ['User'],
      }
    ),

    updateUser: builder.mutation<
      ApiResponse<UserResponse>,
      { id: string; data: UserPermissionData }
    >({
      query: ({ id, data }) => ({
        url: `/vendor/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/vendor/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    // NOTE: categories live in products.api-slice (`getCategories`). The
    // `/vendor/categories` endpoints that used to sit here didn't exist on the
    // backend, had no consumers, and their `getCategories` collided with the
    // products one — RTK Query warned about the duplicate endpoint name and
    // whichever module evaluated last silently won.

    // NOTE: order settings are flat fields on the business profile — read them
    // from `getBusinessProfile` and write them with `updateBusinessSettings`.
    // The old `/vendor/settings/order-settings` pair never existed on the
    // backend and always 404'd.

    // Verify vendor account
    verifyVendorAccount: builder.query<ApiResponse<any>, string>({
      query: (userid) => `/vendor/verify/${userid}`,
    }),
  }),
});

// Export hooks
export const {
  useGetBusinessProfileQuery,
  useUpdateBusinessProfileMutation,
  useUpdateBusinessProfileDetailsMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetVendorDetailsQuery,
  useUpdateVendorDetailsMutation,
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useAddWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLazyVerifyVendorAccountQuery,
  useUpdateBusinessSettingsMutation,
} = settingsApiSlice;
