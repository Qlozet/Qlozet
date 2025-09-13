// Dashboard Page - Template
// Page-level layout structure for dashboard

import React from "react";
import { TopCardsSection } from "../organisms";
import { RecentOrder } from "../organisms";

interface DashboardTemplateProps {
  loading: boolean;
  metricsData: {
    totalOrder: string;
    topEarning: string;
    totalCustomer: string;
    totalReturn: string;
  };
  chartsData: {
    genderByOrder: any;
    top4Location: any[];
    top4Product: any[];
    dailyEarnings: any[];
    dailyOrder: any[];
  };
  recentOrders: any[];
}

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  loading,
  metricsData,
  chartsData,
  recentOrders,
}) => {
  return (
    <section>
      <div className="flex bg-gray-400 w-full h-full">
        <div className="w-full mb-[2rem]">
          {loading ? (
            <div className="loader-section">
              {/* Loader component */}
            </div>
          ) : (
            <div>
              {/* Top Cards Section */}
              <TopCardsSection {...metricsData} />
              
              {/* Charts and Analytics Section */}
              <div className="bg-[#F8F9FA] px-4 lg:px-0">
                {/* Chart components layout */}
                <div className="md:flex block lg:flex items-center w-full md:gap-[21px] gap-4">
                  {/* Charts grid */}
                </div>
                
                {/* Bottom section with graphs and recent orders */}
                <div className="block md:flex lg:flex w-full md:gap-[21px] gap-4 mt-4">
                  {/* Graphs section */}
                  {/* Recent orders section */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardTemplate;