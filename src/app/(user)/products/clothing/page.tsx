'use client';
import React from 'react';
import ClothingTableTemplate from '@/pattern/products/templates/clothing-table-template';
import { toast } from 'sonner';

const ClothingPage: React.FC = () => {
  const handleExportProducts = () => {
    // TODO: Implement export products functionality
    console.log('Export products clicked');
    toast.info('Export feature coming soon');
  };

  return (
    <ClothingTableTemplate onExport={handleExportProducts} />
  );
};

export default ClothingPage;
