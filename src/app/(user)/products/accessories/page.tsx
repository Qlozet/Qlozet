'use client';
import React, { FC } from 'react';
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
    <AccessoriesTableTemplate onExport={handleExportProducts} />
  );
};

export default AccessoriesPage;
