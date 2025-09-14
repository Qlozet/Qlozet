// Dashboard API Slice
// RTK Query service for dashboard-related API operations

import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface LocationData {
  location: string;
  female: number;
  male: number;
}

interface ProductData {
  location: string;
  female: number;
  male: number;
}

interface GenderByOrderData {
  male: number;
  female: number;
}

interface DailyData {
  date: string;
  amount?: number;
  count?: number;
  [key: string]: any;
}

// API Slice
export const dashboardApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Combined Dashboard Data Query - Single optimized query for all dashboard data
    getDashboardData: builder.query<{
      totalCustomers: number;
      totalOrders: number;
      totalEarnings: number;
      totalReturns: number;
      genderByOrder: GenderByOrderData;
      topLocations: LocationData[];
      topProducts: ProductData[];
      dailyEarnings: DailyData[];
      dailyOrders: DailyData[];
      recentOrders: any[];
    }, void>({
      queryFn: async (arg, queryApi, extraOptions, baseQuery) => {
        // Execute multiple queries in parallel
        const [
          customersResult,
          ordersResult,
          earningsResult,
          genderResult,
          locationsResult,
          productsResult,
          dailyEarningsResult,
          dailyOrdersResult
        ] = await Promise.all([
          baseQuery('/vendor/customers/total-customers-sold-to'),
          baseQuery('/vendor/orders'),
          baseQuery('/vendor/dashboard/earnings'),
          baseQuery('/vendor/dashboard/orders/tag'),
          baseQuery('/vendor/dashboard/orders/top-locations'),
          baseQuery('/vendor/dashboard/orders/top-products'),
          baseQuery('/vendor/dashboard/daily-earnings?filter=thisMonth'),
          baseQuery('/vendor/orders/daily-order?filter=thisMonth')
        ]);

        // Check for errors
        if (customersResult.error || ordersResult.error || earningsResult.error) {
          return { error: 'Failed to fetch dashboard data' };
        }

        // Transform and combine data
        const customersData = customersResult.data as any;
        const ordersData = ordersResult.data as any;
        const earningsData = earningsResult.data as any;
        const genderData = genderResult.data as any;
        const locationsData = locationsResult.data as any;
        const productsData = productsResult.data as any;
        const dailyEarningsData = dailyEarningsResult.data as any;
        const dailyOrdersData = dailyOrdersResult.data as any;

        // Process top locations
        const processedLocations: LocationData[] = [];
        if (locationsData?.data?.data?.locations && locationsData?.data?.data?.totalOrders) {
          locationsData.data.data.locations.forEach((location: any) => {
            processedLocations.push({
              location: location.location,
              female: (location.female / locationsData.data.data.totalOrders) * 100,
              male: (location.male / locationsData.data.data.totalOrders) * 100,
            });
          });
        }

        // Process top products
        const processedProducts: ProductData[] = [];
        if (productsData?.data?.data?.topProducts && productsData?.data?.data?.totalOrders) {
          productsData.data.data.topProducts.forEach((product: any) => {
            processedProducts.push({
              location: product.name,
              female: (product.female / productsData.data.data.totalOrders) * 100,
              male: (product.male / productsData.data.data.totalOrders) * 100,
            });
          });
        }

        return {
          data: {
            totalCustomers: customersData?.data?.totalCount || 0,
            totalOrders: ordersData?.data?.data?.length || 0,
            totalEarnings: earningsData?.data?.data?.earnings || 0,
            totalReturns: ordersData?.data?.data?.filter((item: any) => item.status === "return").length || 0,
            genderByOrder: genderData?.data?.data || { male: 0, female: 0 },
            topLocations: processedLocations,
            topProducts: processedProducts,
            dailyEarnings: dailyEarningsData?.data?.data || [],
            dailyOrders: dailyOrdersData?.data?.data || [],
            recentOrders: ordersData?.data?.data || []
          }
        };
      },
      providesTags: ['DashboardMetrics', 'DashboardCharts', 'DashboardAnalytics'],
    }),

    // Individual queries for specific use cases
    getTotalCustomers: builder.query<{ totalCount: number }, void>({
      query: () => '/vendor/customers/total-customers-sold-to',
      providesTags: ['DashboardMetrics'],
      transformResponse: (response: any) => response.data,
    }),

    getTotalEarnings: builder.query<{ earnings: number }, void>({
      query: () => '/vendor/dashboard/earnings',
      providesTags: ['DashboardMetrics'],
      transformResponse: (response: any) => response.data?.data,
    }),

    getDailyEarnings: builder.query<DailyData[], { filter?: string }>({
      query: ({ filter = 'thisMonth' } = {}) => `/vendor/dashboard/daily-earnings?filter=${filter}`,
      providesTags: ['DashboardAnalytics'],
      transformResponse: (response: any) => response.data?.data,
    }),

    getDailyOrders: builder.query<DailyData[], { filter?: string }>({
      query: ({ filter = 'thisMonth' } = {}) => `/vendor/orders/daily-order?filter=${filter}`,
      providesTags: ['DashboardAnalytics'],
      transformResponse: (response: any) => response.data?.data,
    }),
  }),
});

// Export hooks
export const {
  useGetDashboardDataQuery,
  useGetTotalCustomersQuery,
  useGetTotalEarningsQuery,
  useGetDailyEarningsQuery,
  useGetDailyOrdersQuery,
} = dashboardApiSlice;