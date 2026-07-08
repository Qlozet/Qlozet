'use client';
import React, { Suspense } from 'react';
import SizeGuidesTableTemplate from '@/pattern/products/templates/size-guides-table-template';

export const dynamic = 'force-dynamic';

const SizeGuidesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SizeGuidesTableTemplate />
    </Suspense>
  );
};

export default SizeGuidesPage;
