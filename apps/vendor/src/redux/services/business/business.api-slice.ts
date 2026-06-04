// Business API Slice
// RTK Query service for the Qlozet "Business" tag: the vendor's own business
// profile, address, earnings and warehouse management.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, buildQueryString } from '../types';

// ---- Types (derived from the backend schemas) ----

export interface BusinessProfile {
  _id: string;
  business_name?: string;
  business_email?: string;
  business_phone_number?: string;
  website_url?: string;
  personal_name?: string;
  personal_email?: string;
  personal_phone_number?: string;
  business_logo_url?: string;
  cover_image_url?: string;
  display_picture_url?: string;
  status?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// CreateBusinessAddressDto
export interface CreateBusinessAddressRequest {
  address: string;
  state: string;
  city: string;
  country: string;
  zip_code: string;
  latitude: number;
  longitude: number;
}

// ValidatedAddressResponseDto
export interface ValidatedAddress {
  name: string;
  email: string;
  phone: string;
  formatted_address: string;
  country: string;
  country_code: string;
  city: string;
  city_code: string;
  state: string;
  state_code: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  address_code: number;
}

export interface EarningsPoint {
  label?: string;
  date?: string;
  amount?: number;
  [key: string]: unknown;
}

// CreateWarehouseDto
export interface CreateWarehouseRequest {
  name: string;
  address: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface Warehouse {
  _id: string;
  name: string;
  address: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// ---- API Slice ----
export const businessApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /business — current vendor's business profile
    getBusinessProfile: builder.query<ApiResponse<BusinessProfile>, void>({
      query: () => ({ url: '/business', method: 'GET' }),
      providesTags: ['BusinessProfile'],
    }),

    // PATCH /business/address — add or update (and validate) the business address
    updateBusinessAddress: builder.mutation<
      ApiResponse<ValidatedAddress>,
      CreateBusinessAddressRequest
    >({
      query: (body) => ({ url: '/business/address', method: 'PATCH', body }),
      invalidatesTags: ['BusinessAddress', 'BusinessProfile'],
    }),

    // GET /business/earnings-chart
    getEarningsChart: builder.query<
      ApiResponse<EarningsPoint[]>,
      { filter?: string } | void
    >({
      query: (params) => ({
        url: `/business/earnings-chart${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Earnings'],
    }),

    // GET /business/earnings/upcoming
    getUpcomingEarnings: builder.query<ApiResponse<EarningsPoint[]>, void>({
      query: () => ({ url: '/business/earnings/upcoming', method: 'GET' }),
      providesTags: ['Earnings'],
    }),

    // GET /business/warehouse — all warehouses
    getBusinessWarehouses: builder.query<ApiResponse<Warehouse[]>, void>({
      query: () => ({ url: '/business/warehouse', method: 'GET' }),
      providesTags: ['Warehouses'],
    }),

    // GET /business/{id}/warehouse — single warehouse
    getBusinessWarehouse: builder.query<ApiResponse<Warehouse>, string>({
      query: (id) => ({ url: `/business/${id}/warehouse`, method: 'GET' }),
      providesTags: ['Warehouse'],
    }),

    // POST /business/warehouse — create
    createBusinessWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      CreateWarehouseRequest
    >({
      query: (body) => ({ url: '/business/warehouse', method: 'POST', body }),
      invalidatesTags: ['Warehouses'],
    }),

    // PUT /business/{id}/warehouse — update
    updateBusinessWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      { id: string; data: CreateWarehouseRequest }
    >({
      query: ({ id, data }) => ({
        url: `/business/${id}/warehouse`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Warehouse', 'Warehouses'],
    }),

    // DELETE /business/{id}/warehouse — delete
    deleteBusinessWarehouse: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/business/${id}/warehouse`, method: 'DELETE' }),
      invalidatesTags: ['Warehouse', 'Warehouses'],
    }),

    // POST /business/warehouse/{id}/activate — set the single active warehouse
    activateBusinessWarehouse: builder.mutation<ApiResponse<Warehouse>, string>({
      query: (id) => ({
        url: `/business/warehouse/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['Warehouse', 'Warehouses'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetBusinessProfileQuery,
  useUpdateBusinessAddressMutation,
  useGetEarningsChartQuery,
  useGetUpcomingEarningsQuery,
  useGetBusinessWarehousesQuery,
  useGetBusinessWarehouseQuery,
  useCreateBusinessWarehouseMutation,
  useUpdateBusinessWarehouseMutation,
  useDeleteBusinessWarehouseMutation,
  useActivateBusinessWarehouseMutation,
} = businessApiSlice;
