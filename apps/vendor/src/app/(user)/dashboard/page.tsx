'use client';

import React, { Suspense } from 'react';
import { StatsCards } from '@/pattern/dashboard/templates/stats-cards';
import { ChartsSection } from '@/pattern/dashboard/templates/charts-section';
import { LoadingWidget } from '@/pattern/common/organisms/loading-widget';
import { VerificationBanner } from '@/pattern/verification/verification-banner';

const DashboardPage = () => {
  return (
    <>
      <Suspense fallback={<LoadingWidget />}>
        <div className="w-full min-h-screen h-fit space-y-6">
          {/* Above the numbers on purpose: a vendor whose products cannot be
              seen needs to know that before they read their sales figures. */}
          <VerificationBanner />
          <StatsCards />
          <ChartsSection />
        </div>
      </Suspense>
    </>
  );
};

export default DashboardPage;
