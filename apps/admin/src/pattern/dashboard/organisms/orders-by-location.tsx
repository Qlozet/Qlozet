'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartEmptyState } from '../molecules/chart-empty-state';

// TODO(api): orders carry no shipping address / state on the admin payload
// (`AdminOrder` exposes customer, items, totals, status and a shipping_fee —
// no location), and there is no admin analytics endpoint. The bar chart that
// used to live here was drawing invented city figures, so it renders the empty
// template until the API provides real geography.
export const OrdersByLocation = () => (
  <Card className="w-full rounded-[12px] custom-card-shadow">
    <CardHeader className="px-6 pb-4">
      <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
        Orders by top location
      </CardTitle>
    </CardHeader>
    <CardContent className="w-full px-3 pt-0 pb-6">
      <ChartEmptyState
        isEmpty
        description="Orders don't carry a delivery location yet, so there's nothing to rank by region."
      />
    </CardContent>
  </Card>
);
