'use client';

import { DonutChart, type DonutDatum } from '../molecules/donut-chart';

// TODO(api): orders carry no audience/gender field — the admin order payload
// (`AdminOrder`) has customer, items, totals and status only, and there is no
// admin analytics endpoint. Until the backend exposes it this renders the
// empty template rather than a made-up split.
const data: DonutDatum[] = [];

const COLORS = ['#3d2817', '#d4c5b9'];

export const OrdersByGender = () => (
  <DonutChart
    title="Orders by gender"
    data={data}
    colors={COLORS}
    emptyDescription="Order breakdown by audience needs a gender field on orders, which the API doesn't return yet."
  />
);
