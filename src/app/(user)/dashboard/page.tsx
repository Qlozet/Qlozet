"use client";
import React from "react";
import { DashboardTemplate } from "@/patterns/dashboard/templates/dashboard-template";
import { useGetDashboardDataQuery } from "@/redux/services/dashboard/dashboard.api-slice";
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
  const { data: dashboardData, isLoading, error } = useGetDashboardDataQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">Error loading dashboard data</div>;
  }

  if (!dashboardData) {
    return <div className="flex items-center justify-center min-h-screen">No data available</div>;
  }

  // Prepare gender data for donut chart
  const genderByOrder = {
    labels: ["Male", "Female"],
    values: [dashboardData.genderByOrder.male, dashboardData.genderByOrder.female],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  };

  // Prepare template data
  const templateData = {
    metrics: [
      {
        title: "Total Order",
        value: dashboardData.totalOrders,
        icon: <img src={TotalOrderIcon} alt="Total Orders" className="h-6 w-6" />,
        bgColor: "bg-[#57CAEB]",
        link: "orders",
        trend: { value: 2.5, isPositive: true }
      },
      {
        title: "Total earnings",
        value: dashboardData.totalEarnings.toLocaleString(),
        icon: <img src={TotalearningIcon} alt="Total Earnings" className="h-6 w-6" />,
        bgColor: "bg-[#5DDAB4]",
        trend: { value: 2.5, isPositive: true }
      },
      {
        title: "Total Customers",
        value: dashboardData.totalCustomers,
        icon: <img src={customerIcon} alt="Total Customers" className="h-6 w-6" />,
        bgColor: "bg-[#FF7976]",
        trend: { value: 2.5, isPositive: true }
      },
      {
        title: "Total returns",
        value: dashboardData.totalReturns,
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
            width={"200"}
            height={"200"}
            cutout={true}
          />
        )
      },
      {
        title: "Order by top location",
        chart: <HorizontalChat data={dashboardData.topLocations} />
      },
      {
        title: "Orders by product",
        chart: <HorizontalChat data={dashboardData.topProducts} />
      }
    ],
    analytics: [
      {
        name: "Earning",
        data: dashboardData.dailyEarnings,
        component: VerticalBarGraph
      },
      {
        name: "Order Count",
        data: dashboardData.dailyOrders,
        component: VerticalBarGraph
      }
    ],
    recentOrders: dashboardData.recentOrders,
    recentOrdersComponent: <RecentOrder orders={dashboardData.recentOrders} />
  };

  return (
    <DashboardTemplate 
      data={templateData}
      isLoading={false}
    />
  );
};

export default Dashboard;
