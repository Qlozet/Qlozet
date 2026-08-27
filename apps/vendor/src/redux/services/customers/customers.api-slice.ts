// Customers API Service - RTK Query
// Handles all customer-related API operations

import { baseAPI } from '@/redux/api/base-api';

// Types
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  orders?: string[];
  totalSpent?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  data: Customer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface CustomerLocationData {
  location: string;
  customerCount: number;
  percentage: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  topLocations: CustomerLocationData[];
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  _id: string;
  status?: 'active' | 'inactive';
}

// ---- Real Qlozet "Vendor Customers" endpoint (GET /business/customers) ----

// Active measurement set attached to a customer.
export interface CustomerMeasurement {
  unit: 'cm' | 'inch';
  measurements: Record<string, number>;
  name: string;
  active: boolean;
  createdAt: string;
}

// Slim order returned in a customer's recent-orders array.
export interface CustomerOrderPreview {
  _id: string;
  reference: string;
  total: number;
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  createdAt: string;
}

// A single customer row from GET /business/customers.
export interface VendorCustomer {
  _id: string;
  username: string | null;
  full_name: string;
  email?: string;
  phone_number?: string;
  profile_picture: string;
  status: 'active' | 'inactive' | 'suspended';
  total_orders: number;
  orders: CustomerOrderPreview[];
  default_measurement: CustomerMeasurement | null;
}

export interface VendorCustomersResponse {
  data: VendorCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DemographicsDistributionItem {
  label: string;
  value: number;
}

export interface AgeGenderDatum {
  age: string;
  male: number;
  female: number;
}

export interface CustomerDemographicsResponse {
  totalCustomers: number;
  topLocations: CustomerLocationData[];
  genderDistribution: DemographicsDistributionItem[];
  wearsDistribution: DemographicsDistributionItem[];
  ageGenderDistribution: AgeGenderDatum[];
}

// API Slice
export const customersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /business/customers — the vendor's customers (people who ordered
    // from them), paginated, each with recent orders + active measurements.
    getVendorCustomers: builder.query<
      VendorCustomersResponse,
      { page?: number; limit?: number; orders_limit?: number } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params ?? {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
        const qs = searchParams.toString();
        return {
          url: qs ? `/business/customers?${qs}` : '/business/customers',
          method: 'GET',
        };
      },
      providesTags: ['Customer'],
    }),

    // GET /business/customers/demographics — location, gender, wears distribution
    getCustomerDemographics: builder.query<CustomerDemographicsResponse, void>({
      query: () => ({
        url: '/business/customers/demographics',
        method: 'GET',
      }),
      providesTags: ['CustomerStats'],
    }),

    // Removed: getCustomers / getCustomer / createCustomer / updateCustomer /
    // deleteCustomer / getCustomerStats / getTotalCustomers /
    // getCustomersByLocation / importCustomers / exportCustomers.
    //
    // Every one of them pointed at /vendor/customers/*. There is no `vendor`
    // controller in the backend — the routes 404 — and none of the hooks had a
    // call site. A vendor's customers come from /business/customers, above.
  }),
});

// Export hooks
export const { useGetVendorCustomersQuery, useGetCustomerDemographicsQuery } =
  customersApiSlice;
