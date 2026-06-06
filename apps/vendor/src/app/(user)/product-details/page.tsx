'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductDetailsTemplate } from '@/pattern/products/templates/product-details-template';

export const dynamic = 'force-dynamic';

function ProductDetailsContent() {
  const productId = useSearchParams().get('id') ?? '';
  return <ProductDetailsTemplate productId={productId} />;
}

const ProductDetailsPage: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <ProductDetailsContent />
    </Suspense>
  );
};

export default ProductDetailsPage;
