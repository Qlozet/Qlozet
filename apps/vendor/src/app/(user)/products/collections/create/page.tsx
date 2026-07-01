'use client';
import React, { FC, Suspense } from 'react';
import CollectionsCreateTemplate from '@/pattern/products/templates/collections-create-template';

export const dynamic = 'force-dynamic';

const CreateCollectionPage: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionsCreateTemplate />
    </Suspense>
  );
};

export default CreateCollectionPage;
