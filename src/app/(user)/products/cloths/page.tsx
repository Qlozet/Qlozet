"use client";
import React from 'react';
import { ProductsPageTemplate } from '@/patterns/products/templates/products-page-template';
import { useRouter } from 'next/navigation';
import { clearProductId } from '@/utils/localstorage';

const Products: React.FC = () => {
  const router = useRouter();

  const handleCreateProduct = () => {
    router.push('/add');
    clearProductId();
  };

  const handleImportProducts = () => {
    // TODO: Implement import products functionality
    console.log('Import products clicked');
    // For now, redirect to add page as per original behavior
    router.push('/add');
    clearProductId();
  };

  const handleExportProducts = () => {
    // TODO: Implement export products functionality
    console.log('Export products clicked');
  };

  const handleGenerateReport = () => {
    // TODO: Implement generate report functionality
    console.log('Generate report clicked');
  };

  return (
    <ProductsPageTemplate
      title="Products"
      showCreateButton={true}
      showBulkActions={true}
      onCreateProduct={handleCreateProduct}
      onImportProducts={handleImportProducts}
      onExportProducts={handleExportProducts}
      onGenerateReport={handleGenerateReport}
    />
  );
};

export default Products;
