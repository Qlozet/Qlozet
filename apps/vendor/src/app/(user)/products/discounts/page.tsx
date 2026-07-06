'use client';
import React, { Suspense } from 'react';
import DiscountsTableTemplate from '@/pattern/products/templates/discounts-table-template';

export const dynamic = 'force-dynamic';

const DiscountsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiscountsTableTemplate />
    </Suspense>
  );
};

export default DiscountsPage;
