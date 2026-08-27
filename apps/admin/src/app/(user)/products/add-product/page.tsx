'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AddClothingTemplate } from '@/pattern/products/templates/add-clothing-template';

// `?id=` puts the form in edit mode — the catalogue's "Edit product" row action
// links here rather than to a separate screen, so create and edit stay one form.
function AddProductContent() {
  const productId = useSearchParams().get('id') ?? undefined;
  return <AddClothingTemplate productId={productId} />;
}

export default function AddProductPage() {
  return (
    <Suspense fallback={null}>
      <AddProductContent />
    </Suspense>
  );
}
