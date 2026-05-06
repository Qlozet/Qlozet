'use client';
import React, { FC, Suspense } from 'react';
import { toast } from 'sonner';
import AccessoriesTableTemplate from '@/pattern/products/templates/accessories-table-template';

export const dynamic = 'force-dynamic';

const AccessoriesPage: FC = () => {
  const handleExportProducts = () => {
    // TODO: Implement export products functionality
    console.log('Export products clicked');
    toast.info('Export feature coming soon');
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccessoriesTableTemplate onExport={handleExportProducts} />
    </Suspense>
  );
};

export default AccessoriesPage;
