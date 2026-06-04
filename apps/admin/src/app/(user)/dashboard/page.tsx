'use client';

import React from 'react';
import { StatsCards } from '@/pattern/dashboard/templates/stats-cards';
import { ChartsSection } from '@/pattern/dashboard/templates/charts-section';

const DashboardPage = () => {
  return (
    <div className="w-full min-h-screen h-fit space-y-6">
      <StatsCards />
      <ChartsSection />
    </div>
  );
};

export default DashboardPage;
