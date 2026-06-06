'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductDetailsTemplate } from '@/pattern/products/templates/product-details-template';

function ProductDetailsContent() {
  const productId = useSearchParams().get('id') ?? '';
  return <ProductDetailsTemplate productId={productId} />;
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={null}>
      <ProductDetailsContent />
    </Suspense>
  );
}
