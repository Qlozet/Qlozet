'use client';

import React from 'react';
import { StatsCards } from '@/pattern/dashboard/templates/stats-cards';
import { ChartsSection } from '@/pattern/dashboard/templates/charts-section';
import { DashboardRangeControl } from '@/pattern/dashboard/molecules/dashboard-range-control';

const DashboardPage = () => {
  return (
    <div className="w-full min-h-screen h-fit space-y-6">
      {/* One time window for the whole page - change badges and charts alike. */}
      <div className="flex items-center justify-end">
        <DashboardRangeControl />
      </div>
      <StatsCards />
      <ChartsSection />
    </div>
  );
};

export default DashboardPage;
