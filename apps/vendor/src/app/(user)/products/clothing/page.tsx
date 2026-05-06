'use client';
import React, { Suspense } from 'react';
import ClothingTableTemplate from '@/pattern/products/templates/clothing-table-template';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

const ClothingPage: React.FC = () => {
  const handleExportProducts = () => {
    // TODO: Implement export products functionality
    console.log('Export products clicked');
    toast.info('Export feature coming soon');
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClothingTableTemplate onExport={handleExportProducts} />
    </Suspense>
  );
};

export default ClothingPage;
