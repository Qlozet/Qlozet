// Dashboard API Slice
// RTK Query service for admin dashboard-related API operations

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

// Admin overview metrics.
//
// Verified against the live response from GET /admin/dashboard, which sends
// snake_case throughout. Everything the endpoint returns is typed below; keep
// it that way — a card reading a key the API never sends renders a permanent
// dash, which is exactly how this file's camelCase guesses used to fail.
//
// Not here: `measurement_accuracy`. The design has a card for it but nothing in
// the backend defines the metric, so it is read defensively through the index
// signature in `pattern/dashboard/templates/stats-cards.tsx` and dashes until
// the field ships.
export interface MustPurchaseProduct {
  product_id: string;
  totalOrdered: number;
  /**
   * Resolved server-side from the product's kind subdocument
   * (clothing/accessory/fabric). Null when the product carries none, and
   * absent entirely on deployments predating the backend adding it.
   */
  name?: string | null;
}

/**
 * Percentage movement over the last `period_days` versus the window before it.
 *
 * A field is `null` when the previous window had nothing to compare against —
 * the card shows no badge rather than assert a trend it cannot compute. 0 is a
 * real "no movement" and does render.
 */
export interface AdminDashboardChanges {
  period_days: number;
  total_orders: number | null;
  orders_delivered: number | null;
  orders_in_transit: number | null;
  total_vendors: number | null;
  verified_vendors: number | null;
  total_customers: number | null;
  gross_sales: number | null;
}

export interface AdminDashboardMetrics {
  total_orders?: number;
  orders_delivered?: number;
  orders_in_transit?: number;
  total_vendors?: number;
  verified_vendors?: number;
  total_customers?: number;
  /** Sum of paid order totals, in naira, before refunds and commission. */
  gross_sales?: number;
  must_purchase_products?: MustPurchaseProduct[];
  /** Windowed, unlike every figure above it. Absent on older deployments. */
  changes?: AdminDashboardChanges;
  [key: string]: unknown;
}

// ──────────────── Dashboard charts ────────────────
//
// GET /admin/dashboard/charts speaks the same envelope the vendor dashboard
// already uses at GET /orders/chart: every chart is `{ chartType, title,
// series }`, and every series point is `{ label, value }`. Points are typed
// exactly — unlike the metrics above, this payload is fully specified by
// `AdminDashboardChartsDto` on the backend, so there is no index signature to
// hide a typo behind.

export interface ChartPoint {
  label: string;
  value: number;
  /** Set by the categorical charts so a slice keeps its colour as the ordering changes. */
  color?: string;
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
  data: ChartPoint[];
}

export interface Chart {
  chartType: 'bar' | 'pie' | 'stacked_bar';
  title: string;
  series: ChartSeries[];
}

/**
 * Expected earnings carries a headline that is NOT the sum of its bars:
 * commission on orders that haven't been delivered has no release date, so it
 * has no month to plot in. Read `total` for the figure above the chart.
 */
export interface ExpectedEarningsChart extends Chart {
  total: number;
  /** Included in `total`, absent from `series`. */
  unscheduled: number;
  currency: string;
}

export interface AdminDashboardCharts {
  /** The year the monthly series cover — the request's `year`, or the year of the most recent order. */
  year: number;
  currency: string;
  summary: {
    revenueThisYear: number;
    ordersThisYear: number;
    expectedEarnings: number;
  };
  charts: {
    /** Twelve points, Jan–Dec, zero-filled. */
    revenueByMonth: Chart;
    /** Twelve points, Jan–Dec, zero-filled. */
    orderCountByMonth: Chart;
    /** Seven points, Sun–Sat in Africa/Lagos. Revenue by day of the week, all-time. */
    earningsByDay: Chart;
    /** Seven points, Sun–Sat in Africa/Lagos. Order volume by day of the week, all-time. */
    orderCountByDay: Chart;
    /** All-time. Every status is present, including at zero. */
    ordersByStatus: Chart;
    /** All-time, from the product's taxonomy audience — not the buyer's profile gender. */
    ordersByAudience: Chart;
    /** All-time, top 6 states, from the order's shipping address. */
    ordersByLocation: Chart;
    ordersByProductKind: Chart;
    expectedEarnings: ExpectedEarningsChart;
  };
}

// ──────────────── Customer analytics ────────────────
//
// GET /admin/customer/:id/analytics — the same chart envelope, scoped to one
// buyer. Backs the customer detail page's analytics row, which previously ran
// on fabricated figures and, for two of its cards, on PLATFORM-wide data.

export interface CustomerAnalytics {
  customer: string;
  /** The year `spendByMonth` covers — this customer's most recent order year by default. */
  year: number;
  currency: string;
  /** All-time, so the headline figures match the customer's lifetime record. */
  summary: {
    totalOrders: number;
    /** Naira, over PAID orders only. */
    totalSpent: number;
    returnedOrders: number;
    /** Percentage of PAID orders, to one decimal place. */
    returnRate: number;
    lastOrderAt: string | null;
  };
  charts: {
    /** Twelve points, Jan–Dec of `year`. Paid orders only. */
    spendByMonth: Chart;
    ordersByProductKind: Chart;
    /** Empty series when the customer has no paid order — not a 0% claim. */
    returnsRate: Chart;
    /**
     * All 24 hours in Africa/Lagos. Nothing server-side writes the events this
     * reads, so it is a flat 24 zeroes until a client emits them.
     */
    activityByHour: Chart;
  };
}

// ──────────────── Admin profile drawer ────────────────
//
// GET /admin/me/overview. `stats` is the marketplace this admin oversees;
// `metrics` is their own workload — kept apart so `stats.vendors` and
// `metrics.vendorsManaged` can't be mistaken for each other.

/**
 * One row of the drawer's task list. A "task" is an assigned support ticket:
 * the backend has no task or audit-log collection, and tickets are the only
 * work the platform actually assigns to an admin.
 */
export interface AdminProfileTask {
  id: string;
  /** The ticket's issue_type — its headline, not the description. */
  title: string;
  vendor: string | null;
  status: 'completed' | 'pending';
  /** ISO instant; rendered as "5d ago". */
  at: string;
}

export interface AdminProfileOverview {
  currency: string;
  /** How far back `tasks` and `stats.tasksCompleted` look. */
  taskWindowDays: number;
  stats: {
    customers: number;
    vendors: number;
    /** This admin's tickets finished within the window. */
    tasksCompleted: number;
    /** Assigned to this admin and still open/in progress — live workload. */
    activeTickets?: number;
    /** Platform-wide, all-time, across every admin. */
    ticketsClosed: number;
  };
  metrics: {
    vendorsManaged: number;
    /** This admin's finished tickets, all-time. */
    ticketsResolved: number;
    /** Naira. Same figure as GET /admin/dashboard.gross_sales. */
    totalSalesOversight: number;
  };
  tasks: AdminProfileTask[];
}

export interface VendorDashboardMetrics {
  [key: string]: unknown;
}

export interface VendorOrder {
  id?: string;
  status?: string;
  [key: string]: unknown;
}

// API Slice
export const dashboardApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get admin dashboard metrics
    getAdminDashboard: builder.query<ApiResponse<AdminDashboardMetrics>, void>({
      query: () => ({
        url: '/admin/dashboard',
        method: 'GET',
      }),
      providesTags: ['DashboardMetrics'],
    }),

    // The signed-in admin's profile drawer — marketplace counters, their own
    // ticket workload, and their recent assigned tickets.
    getAdminProfileOverview: builder.query<
      ApiResponse<AdminProfileOverview>,
      void
    >({
      query: () => ({ url: '/admin/me/overview', method: 'GET' }),
      providesTags: ['DashboardMetrics'],
    }),

    // Get admin dashboard chart series. Separate from /admin/dashboard: the
    // counters there are three countDocuments calls, these are seven
    // aggregations over the whole orders collection.
    getAdminDashboardCharts: builder.query<
      ApiResponse<AdminDashboardCharts>,
      { year?: number } | void
    >({
      query: (args) => {
        const year = args && 'year' in args ? args.year : undefined;
        return {
          url: year
            ? `/admin/dashboard/charts?year=${year}`
            : '/admin/dashboard/charts',
          method: 'GET',
        };
      },
      providesTags: ['DashboardMetrics'],
    }),

    // Get analytics for a single customer — the customer detail page's
    // analytics row. Scoped server-side; nothing here is platform-wide.
    getCustomerAnalytics: builder.query<
      ApiResponse<CustomerAnalytics>,
      { customerId: string; year?: number }
    >({
      query: ({ customerId, year }) => ({
        url: year
          ? `/admin/customer/${customerId}/analytics?year=${year}`
          : `/admin/customer/${customerId}/analytics`,
        method: 'GET',
      }),
      providesTags: ['DashboardMetrics'],
    }),

    // Get vendor/business dashboard metrics for a single business
    getVendorDashboard: builder.query<
      ApiResponse<VendorDashboardMetrics>,
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: `/admin/vendor/dashboard?businessId=${businessId}`,
        method: 'GET',
      }),
      providesTags: ['VendorDashboard'],
    }),

    // Get vendor/business orders, optionally filtered by status
    getVendorOrders: builder.query<
      ApiResponse<VendorOrder[]>,
      { status?: string } | void
    >({
      query: (args) => {
        const status = args && 'status' in args ? args.status : undefined;
        return {
          url: status
            ? `/admin/vendor/orders?status=${status}`
            : '/admin/vendor/orders',
          method: 'GET',
        };
      },
      providesTags: ['VendorOrders'],
    }),
  }),
});

// Export hooks
export const {
  useGetAdminDashboardQuery,
  useGetAdminProfileOverviewQuery,
  useGetAdminDashboardChartsQuery,
  useGetCustomerAnalyticsQuery,
  useGetVendorDashboardQuery,
  useGetVendorOrdersQuery,
} = dashboardApiSlice;
