"use client";
import React from "react";
import { DashboardTemplate } from "@/patterns/dashboard/templates/dashboard-template";
import {
  useGetTotalCustomersQuery,
  useGetOrdersQuery,
  useGetTotalEarningsQuery,
  useGetGenderByOrderQuery,
  useGetTopLocationsQuery,
  useGetTopProductsQuery,
  useGetDailyEarningsQuery,
  useGetDailyOrdersQuery,
} from "@/redux/services/dashboard/dashboard.api-slice";
import HorizontalChat from "@/components/Chat/HorizontalChart";
import DonutChart from "@/components/Chat/DoughnutChat";
import VerticalBarGraph from "@/components/VerticalBarGraph";
import RecentOrder from "@/components/RecentOrder";
import customerIcon from "@/public/assets/svg/total-customer.svg";
import TotalOrderIcon from "@/public/assets/svg/TotalOrder-Icon.svg";
import TotalearningIcon from "@/public/assets/svg/Totalearning-icon.svg";
import CartIcon from "@/public/assets/svg/customer-carticon.svg";
import Loader from "@/components/Loader";

const Dashboard: React.FC = () => {
  // Individual API calls
  const { data: customersData, isLoading: customersLoading } = useGetTotalCustomersQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery();
  const { data: earningsData, isLoading: earningsLoading } = useGetTotalEarningsQuery();
  const { data: genderData, isLoading: genderLoading } = useGetGenderByOrderQuery();
  const { data: locationsData, isLoading: locationsLoading } = useGetTopLocationsQuery();
  const { data: productsData, isLoading: productsLoading } = useGetTopProductsQuery();
  const { data: dailyEarningsData, isLoading: dailyEarningsLoading } = useGetDailyEarningsQuery({ filter: 'thisMonth' });
  const { data: dailyOrdersData, isLoading: dailyOrdersLoading } = useGetDailyOrdersQuery({ filter: 'thisMonth' });

  const isLoading = customersLoading || ordersLoading || earningsLoading || genderLoading || 
                    locationsLoading || productsLoading || dailyEarningsLoading || dailyOrdersLoading;

  if (isLoading) {
    return <Loader small={false} height={100} width={100} />;
  }

  if (!customersData || !ordersData || !earningsData) {
    return <div className="flex items-center justify-center min-h-screen">Error loading dashboard data</div>;
  }

  // Process data
  const totalCustomers = customersData?.data?.totalCount || 0;
  const orders = ordersData?.data?.data || [];
  const totalOrders = orders.length;
  const totalEarnings = earningsData?.data?.data?.earnings || 0;
  const totalReturns = orders.filter(order => order.status === "return").length;
  const genderByOrderData = genderData?.data?.data || { male: 0, female: 0 };
  
  // Process locations data
  const processedLocations: Array<{ location: string; female: number; male: number }> = [];
  if (locationsData?.data?.data?.locations && locationsData?.data?.data?.totalOrders) {
    locationsData.data.data.locations.forEach((location: any) => {
      processedLocations.push({
        location: location.location,
        female: (location.female / locationsData.data.data.totalOrders) * 100,
        male: (location.male / locationsData.data.data.totalOrders) * 100,
      });
    });
  }

  // Process products data
  const processedProducts: Array<{ location: string; female: number; male: number }> = [];
  if (productsData?.data?.data?.topProducts && productsData?.data?.data?.totalOrders) {
    productsData.data.data.topProducts.forEach((product: any) => {
      processedProducts.push({
        location: product.name, // Map name to location for chart compatibility
        female: (product.female / productsData.data.data.totalOrders) * 100,
        male: (product.male / productsData.data.data.totalOrders) * 100,
      });
    });
  }

  // Prepare gender data for donut chart
  const genderByOrder = {
    labels: ["Male", "Female"],
    values: [genderByOrderData.male, genderByOrderData.female],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  };

  // Prepare template data
  const templateData = {
    metrics: [
      {
        title: "Total Order",
        value: totalOrders,
        icon: <img src={TotalOrderIcon} alt="Total Orders" className="h-6 w-6" />,
        bgColor: "bg-[#57CAEB]",
        link: "orders",
        trend: { value: 2.5, isPositive: true }
      },
      {
        title: "Total earnings",
        value: totalEarnings.toLocaleString(),
        icon: <img src={TotalearningIcon} alt="Total Earnings" className="h-6 w-6" />,
        bgColor: "bg-[#5DDAB4]",
        trend: { value: 2.5, isPositive: true }
      },
      {
        title: "Total Customers",
        value: totalCustomers,
        icon: <img src={customerIcon} alt="Total Customers" className="h-6 w-6" />,
        bgColor: "bg-[#FF7976]",
        trend: { value: 2.5, isPositive: true }
      },
      {
        title: "Total returns",
        value: totalReturns,
        icon: <img src={CartIcon} alt="Total Returns" className="h-6 w-6" />,
        bgColor: "bg-[#FF3A3A]",
        trend: { value: 2.5, isPositive: false }
      }
    ],
    charts: [
      {
        title: "Order by gender",
        chart: (
          <DonutChart
            data={genderByOrder}
            width={200}
            height={200}
            cutout={true}
          />
        )
      },
      {
        title: "Order by top location",
        chart: <HorizontalChat data={processedLocations} />
      },
      {
        title: "Orders by product",
        chart: <HorizontalChat data={processedProducts} />
      }
    ],
    analytics: [
      {
        name: "Earning",
        data: dailyEarningsData?.data?.data || [],
        component: VerticalBarGraph
      },
      {
        name: "Order Count",
        data: dailyOrdersData?.data?.data || [],
        component: VerticalBarGraph
      }
    ],
    recentOrders: orders,
    recentOrdersComponent: <RecentOrder orders={orders} />
  };

  return (
    <DashboardTemplate 
      data={templateData}
      isLoading={false}
    />
  );
};

export default Dashboard;
