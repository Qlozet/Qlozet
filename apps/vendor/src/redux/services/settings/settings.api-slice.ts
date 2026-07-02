// Settings API Slice
// RTK Query service for settings-related API operations

import type {
  CompanyDetailsData,
  BillingInvoiceData,
  WarehouseData,
  UserPermissionData,
  CategoryData,
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

// Update payloads
export interface UpdateBusinessProfilePayload {
  business_name?: string;
  business_email?: string;
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
  bvn?: string;
  nin?: string;
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

interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  parentCategory?: string;
  isActive: boolean;
  sortOrder?: number;
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

    // Warehouses
    getWarehouses: builder.query<ApiResponse<WarehouseResponse[]>, void>({
      query: () => '/vendor/warehouses',
      providesTags: ['Warehouse'],
    }),

    getWarehouse: builder.query<any, void>({
      query: () => '/vendor/warehouse',
      providesTags: ['Warehouse'],
    }),

    createWarehouse: builder.mutation<ApiResponse<WarehouseResponse>, WarehouseData>({
      query: (data) => ({ url: '/vendor/warehouses', method: 'POST', body: data }),
      invalidatesTags: ['Warehouse'],
    }),

    addWarehouse: builder.mutation<any, any>({
      query: (data) => ({ url: '/vendor/warehouse/add', method: 'POST', body: data }),
      invalidatesTags: ['Warehouse'],
    }),

    updateWarehouse: builder.mutation<ApiResponse<WarehouseResponse>, { id: string; data: WarehouseData }>({
      query: ({ id, data }) => ({ url: `/vendor/warehouses/${id}`, method: 'PUT', body: data }),
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

    createUser: builder.mutation<ApiResponse<UserResponse>, UserPermissionData>({
      query: (data) => ({ url: '/vendor/users', method: 'POST', body: data }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<ApiResponse<UserResponse>, { id: string; data: UserPermissionData }>({
      query: ({ id, data }) => ({ url: `/vendor/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/vendor/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    // Categories
    getCategories: builder.query<ApiResponse<CategoryResponse[]>, void>({
      query: () => '/vendor/categories',
      providesTags: ['Category'],
    }),

    createCategory: builder.mutation<ApiResponse<CategoryResponse>, CategoryData>({
      query: (data) => ({ url: '/vendor/categories', method: 'POST', body: data }),
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation<ApiResponse<CategoryResponse>, { id: string; data: CategoryData }>({
      query: ({ id, data }) => ({ url: `/vendor/categories/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/vendor/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),

    // Order Settings
    getOrderSettings: builder.query<ApiResponse<OrderSettingsData>, void>({
      query: () => '/vendor/settings/order-settings',
      providesTags: ['OrderSettings'],
    }),

    updateOrderSettings: builder.mutation<ApiResponse<OrderSettingsData>, OrderSettingsData>({
      query: (data) => ({ url: '/vendor/settings/order-settings', method: 'PUT', body: data }),
      invalidatesTags: ['OrderSettings'],
    }),

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
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetOrderSettingsQuery,
  useUpdateOrderSettingsMutation,
  useLazyVerifyVendorAccountQuery,
} = settingsApiSlice;
