'use client';

import React, { Suspense } from 'react';
import { OrdersPageTemplate } from '@/pattern/orders/templates/orders-page-template';

// The template reads ?ref=, ?chat= and ?tab= so a notification can open the
// order it is about. useSearchParams needs a Suspense boundary and a dynamic
// render — same pattern as the product-details page.
export const dynamic = 'force-dynamic';

const Order: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <OrdersPageTemplate />
    </Suspense>
  );
};

export default Order;
