'use client';
import React, { Suspense } from 'react';
import FabricsTableTemplate from '@/pattern/products/templates/fabrics-table-template';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

const FabricsPage: React.FC = () => {
  const handleExportProducts = () => {
    // TODO: Implement export products functionality
    console.log('Export products clicked');
    toast.info('Export feature coming soon');
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FabricsTableTemplate onExport={handleExportProducts} />
    </Suspense>
  );
};

export default FabricsPage;
