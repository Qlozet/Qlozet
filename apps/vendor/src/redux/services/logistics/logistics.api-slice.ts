// Logistics API Slice
// RTK Query service for the Qlozet "Logistics" tag: couriers, shipping rates and
// shipments.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

// AddressDetails
export interface AddressDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
}

// PackageItem
export interface PackageItem {
  name: string;
  description: string;
  unit_weight: number;
  unit_amount: number;
  quantity: number;
}

// FetchRatePayload
export interface FetchRateRequest {
  sender_address_code: Record<string, unknown>;
  reciever_address_code: Record<string, unknown>;
  pickup_date: string;
  package_items: PackageItem[];
  service_type?: string;
  package_dimension?: unknown;
}

// ShipmentPayload
export interface ShipmentRequest {
  sender: AddressDetails;
  receiver: AddressDetails;
  package_items: PackageItem[];
  courier?: string;
  service_type?: string;
  reference_id?: string;
}

// ShipmentResponse
export interface ShipmentResponse {
  shipment_id: string;
  tracking_number: string;
  courier: string;
  status: string;
  estimated_delivery?: string;
  created_at: string;
  label_url?: string;
}

export interface FetchRateResponse {
  request_token: string;
  couriers: unknown[];
  fastest_courier?: unknown;
  cheapest_courier?: unknown;
  checkout_data?: unknown;
  [key: string]: unknown;
}

// ---- API Slice ----
export const logisticsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /logistics/couriers — all couriers
    getCouriers: builder.query<ApiResponse<unknown[]>, void>({
      query: () => ({ url: '/logistics/couriers', method: 'GET' }),
      providesTags: ['Courier'],
    }),

    // POST /logistics/address — validate/register an address
    validateLogisticsAddress: builder.mutation<ApiResponse<unknown>, AddressDetails>({
      query: (body) => ({ url: '/logistics/address', method: 'POST', body }),
    }),

    // POST /logistics/rates/{serviceCodes} — fetch shipping rates
    fetchShippingRates: builder.mutation<
      ApiResponse<FetchRateResponse>,
      { serviceCodes: string; data: FetchRateRequest }
    >({
      query: ({ serviceCodes, data }) => ({
        url: `/logistics/rates/${serviceCodes}`,
        method: 'POST',
        body: data,
      }),
    }),

    // POST /logistics/shipment — create a shipment
    createShipment: builder.mutation<ApiResponse<ShipmentResponse>, ShipmentRequest>({
      query: (body) => ({ url: '/logistics/shipment', method: 'POST', body }),
      invalidatesTags: ['Shipment'],
    }),

    // POST /logistics/shipment/cancel/{orderId} — cancel a shipment
    cancelShipment: builder.mutation<ApiResponse<unknown>, string>({
      query: (orderId) => ({
        url: `/logistics/shipment/cancel/${orderId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Shipment'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetCouriersQuery,
  useValidateLogisticsAddressMutation,
  useFetchShippingRatesMutation,
  useCreateShipmentMutation,
  useCancelShipmentMutation,
} = logisticsApiSlice;
