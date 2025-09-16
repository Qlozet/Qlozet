// Orders API Service - RTK Query
// Handles all order-related API operations

import { baseAPI } from '@/redux/api/base-api';

// Types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  variant?: {
    size?: string;
    color?: string;
    material?: string;
  };
  customizations?: {
    name: string;
    value: string;
    additionalPrice: number;
  }[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface OrdersResponse {
  data: Order[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrdersByLocation {
  location: string;
  male: number;
  female: number;
  total: number;
  percentage: number;
}

export interface OrdersByGender {
  male: number;
  female: number;
}

export interface DailyOrderData {
  date: string;
  count: number;
  revenue: number;
}

export interface CreateOrderRequest {
  customerId: string;
  items: Omit<OrderItem, 'productName' | 'total'>[];
  shippingAddress: Order['shippingAddress'];
  billingAddress?: Order['billingAddress'];
  paymentMethod: string;
  notes?: string;
  discount?: number;
}

export interface UpdateOrderRequest {
  _id: string;
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  shippingAddress?: Order['shippingAddress'];
  billingAddress?: Order['billingAddress'];
  notes?: string;
}

// API Slice
export const ordersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get all orders with pagination and filters
    getOrders: builder.query<OrdersResponse, {
      page?: number;
      limit?: number;
      search?: string;
      status?: Order['status'] | 'all';
      paymentStatus?: Order['paymentStatus'] | 'all';
      dateRange?: {
        startDate: string;
        endDate: string;
      };
      sortBy?: 'orderNumber' | 'customerName' | 'total' | 'createdAt' | 'status';
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            if (typeof value === 'object') {
              searchParams.append(key, JSON.stringify(value));
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });
        return `/vendor/orders?${searchParams.toString()}`;
      },
      providesTags: ['Order'],
    }),

    // Get single order
    getOrder: builder.query<{ data: Order }, string>({
      query: (orderId) => ({
        url: `/vendor/orders/${orderId}`,
        method: "GET"
      }),
      providesTags: ['Order'],
    }),

    // Create order
    createOrder: builder.mutation<{ data: Order }, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/vendor/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'OrderStats'],
    }),

    // Update order
    updateOrder: builder.mutation<{ data: Order }, UpdateOrderRequest>({
      query: ({ _id, ...orderData }) => ({
        url: `/vendor/orders/${_id}`,
        method: 'PATCH',
        body: orderData,
      }),
      invalidatesTags: [
        'Order',
        'OrderStats'
      ],
    }),

    // Cancel order
    cancelOrder: builder.mutation<{ data: Order }, { orderId: string; reason?: string }>({
      query: ({ orderId, reason }) => ({
        url: `/vendor/orders/${orderId}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: [
        'Order',
        'OrderStats'
      ],
    }),

    // Process return
    processReturn: builder.mutation<{ data: Order }, {
      orderId: string;
      items: { productId: string; quantity: number; reason: string }[];
      refundAmount: number;
    }>({
      query: ({ orderId, items, refundAmount }) => ({
        url: `/vendor/orders/${orderId}/return`,
        method: 'PATCH',
        body: { items, refundAmount },
      }),
      invalidatesTags: [
        'Order',
        'OrderStats'
      ],
    }),

    // Get order statistics
    getOrderStats: builder.query<{ data: OrderStats }, void>({
      query: () => ({
        url: '/vendor/orders/stats',
        method: 'GET',
      }),
      providesTags: ['OrderStats'],
    }),

    // Get orders by location (for dashboard)
    getOrdersByLocation: builder.query<{
      data: {
        locations: OrdersByLocation[];
        totalOrders: number;
      }
    }, void>({
      query: () => ({
        url: '/vendor/dashboard/orders/top-locations',
        method: 'GET',
      }),
      providesTags: ['OrderStats'],
    }),

    // Get orders by gender (for dashboard)
    getOrdersByGender: builder.query<{ data: OrdersByGender }, void>({
      query: () => ({
        url: '/vendor/dashboard/orders/tag',
        method: 'GET',
      }),
      providesTags: ['OrderStats'],
    }),

    // Get daily orders data
    getDailyOrders: builder.query<{ data: DailyOrderData[] }, {
      filter?: 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';
      startDate?: string;
      endDate?: string;
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        return `/vendor/orders/daily-order?${searchParams.toString()}`;
      },
      providesTags: ['OrderStats'],
    }),

    // Generate order report
    generateOrderReport: builder.mutation<Blob, {
      format: 'pdf' | 'csv' | 'xlsx';
      dateRange?: {
        startDate: string;
        endDate: string;
      };
      status?: Order['status'][];
      includeItems?: boolean;
    }>({
      query: ({ format, dateRange, status, includeItems = true }) => {
        const searchParams = new URLSearchParams();
        searchParams.append('format', format);
        searchParams.append('includeItems', includeItems.toString());

        if (dateRange) {
          searchParams.append('dateRange', JSON.stringify(dateRange));
        }
        if (status?.length) {
          searchParams.append('status', JSON.stringify(status));
        }

        return {
          url: `/vendor/orders/report?${searchParams.toString()}`,
          method: 'POST',
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    // Bulk update orders
    bulkUpdateOrders: builder.mutation<{
      data: {
        updated: number;
        failed: number;
        errors?: string[];
      }
    }, {
      orderIds: string[];
      updates: {
        status?: Order['status'];
        paymentStatus?: Order['paymentStatus'];
      };
    }>({
      query: ({ orderIds, updates }) => ({
        url: '/vendor/orders/bulk-update',
        method: 'PATCH',
        body: { orderIds, updates },
      }),
      invalidatesTags: ['Order', 'OrderStats'],
    }),

    // Get order invoice
    getOrderInvoice: builder.query<Blob, { orderId: string; format?: 'pdf' | 'html' }>({
      query: ({ orderId, format = 'pdf' }) => ({
        url: `/vendor/orders/${orderId}/invoice?format=${format}`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useCancelOrderMutation,
  useProcessReturnMutation,
  useGetOrderStatsQuery,
  useGetOrdersByLocationQuery,
  useGetOrdersByGenderQuery,
  useGetDailyOrdersQuery,
  useGenerateOrderReportMutation,
  useBulkUpdateOrdersMutation,
  useGetOrderInvoiceQuery,
} = ordersApiSlice;