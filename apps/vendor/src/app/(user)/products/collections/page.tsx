'use client';
import React, { FC, Suspense } from 'react';
import { toast } from 'sonner';
import CollectionsTableTemplate from '@/pattern/products/templates/collections-table-template';

export const dynamic = 'force-dynamic';

const CollectionsPage: FC = () => {
  const handleExportCollections = () => {
    // TODO: Implement export collections functionality
    toast.info('Export feature coming soon');
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionsTableTemplate onExport={handleExportCollections} />
    </Suspense>
  );
};

export default CollectionsPage;
