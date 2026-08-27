// Settings API Slice
// RTK Query service for settings-related API operations

import type {
  CompanyDetailsData,
  BillingInvoiceData,
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
    //
    // getVendorDetails is gone: /vendor/settings/vendor-details does not exist
    // and nothing read it. updateVendorDetails stays only because the Shop
    // details tab still calls it — see the note at the foot of this file.
    // FIXME(api): PUT /vendor/settings does not exist either — the Shop details
    // tab has been posting into a 404. The real writes are PATCH
    // /business/profile and PATCH /business/address, which the Profile tab
    // already uses (updateBusinessProfileDetails / updateBusinessProfile
    // above). Left wired rather than silently deleted, because the tab is a
    // live screen and rerouting it changes which fields it may send.
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
    // (getBusinessWarehouses / getBusinessWarehouse / create / update / delete /
    // activate), against /business/warehouse. The six that used to sit here —
    // getWarehouses, getWarehouse, createWarehouse, addWarehouse,
    // updateWarehouse, deleteWarehouse — were duplicates pointed at
    // /vendor/warehouses, a path with no controller behind it, and none of them
    // had a consumer. Their WarehouseResponse described a record the backend
    // has never sent: city, state, zipCode, country and isDefault are not on
    // the Warehouse schema, which carries address, contact_* and status.

    // NOTE: team members live in users.api-slice. The getUsers / createUser /
    // updateUser / deleteUser pair-set that used to sit here spoke to
    // /vendor/users, which does not exist, and nothing imported them.

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
    //
    // FIXME(api): /vendor/verify/{userid} does not exist. The backend verifies
    // by TOKEN, not by user id — POST /auth/verify-email with { token } — so
    // /verify/[userid] cannot be made to work by correcting the path alone; the
    // link the email sends has to carry a token and the page has to read it.
    // Until then this always lands in the catch and shows "An error occurred".
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
  useUpdateVendorDetailsMutation,
  useLazyVerifyVendorAccountQuery,
  useUpdateBusinessSettingsMutation,
} = settingsApiSlice;
