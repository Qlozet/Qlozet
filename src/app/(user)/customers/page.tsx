"use client";
import React from 'react';
import { CustomersPageTemplate } from '@/patterns/customers/templates/customers-page-template';

const Customer: React.FC = () => {
  const handleCreateCustomer = () => {
    // TODO: Implement create customer functionality
    console.log('Create customer clicked');
  };

  const handleImportCustomers = () => {
    // TODO: Implement import customers functionality
    console.log('Import customers clicked');
  };

  const handleExportCustomers = () => {
    // TODO: Implement export customers functionality
    console.log('Export customers clicked');
  };

  return (
    <CustomersPageTemplate
      title="Customers"
      showCreateButton={true}
      showBulkActions={true}
      onCreateCustomer={handleCreateCustomer}
      onImportCustomers={handleImportCustomers}
      onExportCustomers={handleExportCustomers}
    />
  );
};

export default Customer;
