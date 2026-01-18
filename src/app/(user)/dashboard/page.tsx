'use client';

import React, { Suspense } from 'react';
import { StatsCards } from '@/pattern/dashboard/templates/stats-cards';
import { ChartsSection } from '@/pattern/dashboard/templates/charts-section';
import { LoadingWidget } from '@/pattern/common/organisms/loading-widget';

const DashboardPage = () => {

  return (
    <>
      <Suspense fallback={<LoadingWidget />}>
        <div className="w-full min-h-screen h-fit space-y-6">
          <StatsCards />
          <ChartsSection />
        </div>
      </Suspense>
    </>
  )
};

export default DashboardPage;
