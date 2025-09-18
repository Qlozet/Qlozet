'use client';
import React from 'react';
import { OrdersPageTemplate } from '@/patterns/orders/templates/orders-page-template';

const Order: React.FC = () => {
  const handleCreateOrder = () => {
    // TODO: Implement create order functionality
    console.log('Create order clicked');
  };

  const handleImportOrders = () => {
    // TODO: Implement import orders functionality
    console.log('Import orders clicked');
  };

  const handleExportOrders = () => {
    // TODO: Implement export orders functionality
    console.log('Export orders clicked');
  };

  const handleGenerateReport = () => {
    // TODO: Implement generate report functionality
    console.log('Generate report clicked');
  };

  return (
    <OrdersPageTemplate
      title='Orders'
      showCreateButton={true}
      showBulkActions={true}
      onCreateOrder={handleCreateOrder}
      onImportOrders={handleImportOrders}
      onExportOrders={handleExportOrders}
      onGenerateReport={handleGenerateReport}
    />
  );
};

export default Order;
