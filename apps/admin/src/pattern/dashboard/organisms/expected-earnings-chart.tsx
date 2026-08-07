'use client';

import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartEmptyState } from '../molecules/chart-empty-state';

// TODO(api): "Expected earnings" is a forecast. There is no projection or
// payout-schedule endpoint for the admin console, and a forecast can't be
// derived from past orders without inventing a model — so this shows the empty
// template. The card previously displayed a hardcoded EUR figure and a fake
// trend line. If a real projection is out of reach, consider repurposing this
// slot for a metric the data supports (e.g. revenue to date).
export const ExpectedEarningsChart = () => (
  <Card className="relative w-full h-[450px] overflow-hidden rounded-[12px] custom-card-shadow">
    <span className="absolute top-5 right-5 z-10 flex size-9 items-center justify-center rounded-lg bg-gray-100">
      <BarChart3 className="size-4 text-gray-700" />
    </span>

    <CardContent className="flex h-full flex-col px-6 pt-10">
      <p className="text-sm text-[hsla(210,9%,31%,1)]">Expected earnings</p>

      <div className="flex flex-1 items-center">
        <ChartEmptyState
          isEmpty
          message="No forecast yet"
          description="Projected earnings need a forecasting endpoint, which the API doesn't expose yet."
          height={220}
        />
      </div>
    </CardContent>
  </Card>
);
