// Customers API Slice
// RTK Query service for admin customer management

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';
import type { Transaction } from '../transactions/transactions.api-slice';

/** Whole-collection figures for the customers page's four stat cards. */
export interface CustomerSummary {
  total_customers: number;
  /** Customers who have actually ordered, as opposed to registered accounts. */
  unique_customers: number;
  /** Busiest shipping state, by distinct customers. Null when nothing shipped. */
  top_location: { label: string; customers: number } | null;
  /** Most-ordered product by units. Null when nothing has been bought. */
  favourite_product: { name: string | null; units: number } | null;
  changes: {
    period_days: number;
    total_customers: number | null;
    unique_customers: number | null;
  };
}

/** The saved profile address; `location` is this flattened by the backend. */
export interface CustomerAddress {
  state?: string | null;
  city?: string | null;
  [key: string]: unknown;
}

export interface Customer {
  _id: string;
  /** What the User schema defines and the endpoint sends. */
  full_name?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  state?: string | null;
  city?: string | null;
  status?: string | null;
  // Avatar (the backend uses a few different field names).
  avatar?: string | null;
  image?: string | null;
  profile_picture?: string | null;
  /** A string on the list rows; the detail endpoint sends `{ state, city }`. */
  address?: string | CustomerAddress | null;
  location?: string | null;
  // Aggregate metrics surfaced in the Customers table / detail view (optional —
  // present only when the backend joins them in).
  /** Joined onto each row by GET /admin/customer. */
  total_orders?: number | null;
  last_order_at?: string | null;
  totalOrders?: number;
  ordersCount?: number;
  lastOrderDate?: string;
  lastOrderAt?: string;
  lastLoggedIn?: string;
  lastLoginAt?: string;
  reviewsCount?: number;
  followedVendorsCount?: number;
  reservedFabricCount?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

/**
 * GET /admin/customer/:id.
 *
 * snake_case throughout, like every other endpoint in this backend — the admin
 * app spent a week broken on camelCase guesses, so the spelling here is the
 * contract, not a preference.
 *
 * Every count and money figure is a number the moment the data supports one,
 * including 0. `null` means there is no source for the value at all, which is
 * the only case that may render as a dash.
 */
export interface CustomerDetail extends Customer {
  _id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  status?: string | null;
  profile_picture?: string | null;
  address?: CustomerAddress | null;
  /** "Ikeja, Lagos" — built from the address; null when neither part is set. */
  location?: string | null;
  created_at?: string | null;
  last_login_at?: string | null;
  total_orders?: number | null;
  last_order_at?: string | null;
  reviews_count?: number | null;
  followed_vendors?: number | null;
  reserved_fabrics?: number | null;
  wallet_balance?: number | null;
  pending_balance?: number | null;
  token_balance?: number | null;
  total_returns?: number | null;
  lifetime_spending?: number | null;
}

/**
 * GET /admin/customer/:id/measurements — the Body Measurement panel.
 *
 * The backend stores measurements as a flat { key: number } map holding only
 * the keys the customer actually recorded, so the panel renders what it is
 * given rather than a fixed field list. Nothing here is filled in.
 */
export interface CustomerMeasurementSet {
  name: string;
  unit: 'cm' | 'inch';
  /** The set the customer currently shops with. Sets arrive active-first. */
  active: boolean;
  created_at?: string | null;
  measurements: Record<string, number>;
}

export interface CustomerBodyType {
  /** athletic | rectangle | trapezoid | round | triangle | hourglass | pear | apple | inverted_triangle | unclassified */
  type: string;
  confidence: 'high' | 'medium' | 'low' | string;
  flattering_fits: string[];
  avoid_fits: string[];
  style_advice: string[];
  /** Null when the classification was derived for this response, not cached. */
  computed_at?: string | null;
  from_set?: string | null;
}

export interface CustomerMeasurements {
  full_name?: string | null;
  gender?: string | null;
  sets: CustomerMeasurementSet[];
  /** Active set, falling back to the first saved one; null when there are none. */
  active_set: CustomerMeasurementSet | null;
  body_type: CustomerBodyType | null;
}

/**
 * GET /admin/customer/:id/reviews — the reviews this customer WROTE, which is
 * what `reviews_count` on their detail header counts.
 *
 * Ratings live embedded in products, one entry per product per user, so a row
 * is a rating plus the product it was left on.
 */
export interface CustomerReview {
  product_id: string;
  product_name?: string | null;
  product_kind?: string | null;
  product_image?: string | null;
  vendor_name?: string | null;
  rating: number;
  /** A rating may carry no comment — stars alone are a review. */
  comment?: string | null;
  /** Derived from the rating's ObjectId; ratings carry no timestamp. */
  created_at?: string | null;
}

/** Over their WHOLE history, not the page — the bars describe the customer. */
export interface CustomerReviewsSummary {
  total_reviews: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

export interface CustomerReviewsPage {
  summary: CustomerReviewsSummary;
  reviews: CustomerReview[];
  pagination: { page: number; size: number; total: number; pages: number };
}

export interface GetCustomerReviewsParams {
  customerId: string;
  page?: number;
  size?: number;
  sortBy?: 'recent' | 'highest' | 'lowest';
}

export interface GetCustomersParams {
  page?: number;
  size?: number;
  search?: string;
  state?: string;
  city?: string;
  gender?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetCustomerTransactionsParams {
  customerId: string;
  page?: number;
  size?: number;
}

// API Slice
export const customersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch customers with filters
    getCustomers: builder.query<
      ApiResponse<PaginatedData<Customer>>,
      GetCustomersParams | void
    >({
      query: (params) => ({
        url: `/admin/customer${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Customers'],
    }),

    // One customer, with the profile, activity and wallet figures the detail
    // page shows. Before this endpoint existed the page pulled the list at
    // size:200 and scanned it for a matching _id, which lost every customer
    // past the 200th and none of the wallet figures.
    getCustomer: builder.query<ApiResponse<CustomerDetail>, string>({
      query: (customerId) => ({
        url: `/admin/customer/${customerId}`,
        method: 'GET',
      }),
      providesTags: ['Customer'],
    }),

    // This customer's transactions, paginated. Rows keep the shape the
    // transaction service already returns.
    getCustomerTransactions: builder.query<
      ApiResponse<PaginatedData<Transaction>>,
      GetCustomerTransactionsParams
    >({
      query: ({ customerId, page, size }) => ({
        url: `/admin/customer/${customerId}/transactions${buildQueryString({
          page,
          size,
        })}`,
        method: 'GET',
      }),
      providesTags: ['Transactions'],
    }),

    // This customer's saved measurement sets and body-type classification.
    // Every route under /measurements is customer-scoped and reads the caller's
    // id from its token, so an admin hitting them got their own empty sets;
    // this admin twin takes the customer from the path.
    getCustomerMeasurements: builder.query<
      ApiResponse<CustomerMeasurements>,
      string
    >({
      query: (customerId) => ({
        url: `/admin/customer/${customerId}/measurements`,
        method: 'GET',
      }),
      providesTags: ['CustomerMeasurements'],
    }),

    // The reviews this customer wrote. Paged, but the summary it carries is
    // over their whole history — the distribution bars describe the customer
    // and must not move as the reader pages.
    getCustomerReviews: builder.query<
      ApiResponse<CustomerReviewsPage>,
      GetCustomerReviewsParams
    >({
      query: ({ customerId, page, size, sortBy }) => ({
        url: `/admin/customer/${customerId}/reviews${buildQueryString({
          page,
          size,
          sortBy,
        })}`,
        method: 'GET',
      }),
      providesTags: ['CustomerReviews'],
    }),

    // Set a customer's account state. Sign-in requires 'active', so both
    // 'inactive' and 'suspended' lock them out — the difference is intent.
    setCustomerStatus: builder.mutation<
      ApiResponse<Customer>,
      { customerId: string; status: 'active' | 'inactive' | 'suspended' }
    >({
      query: ({ customerId, status }) => ({
        url: `/admin/customer/${customerId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Customers', 'Customer'],
    }),

    // Permanent. The endpoint refuses with a 409 when the customer has orders,
    // and the message says to suspend instead.
    deleteCustomer: builder.mutation<
      ApiResponse<{ deleted: boolean; id: string }>,
      string
    >({
      query: (customerId) => ({
        url: `/admin/customer/${customerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customers'],
    }),
  }),
});

// Export hooks
export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useGetCustomerTransactionsQuery,
  useGetCustomerMeasurementsQuery,
  useGetCustomerReviewsQuery,
  useSetCustomerStatusMutation,
  useDeleteCustomerMutation,
} = customersApiSlice;
