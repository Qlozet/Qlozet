// Customers Table - Organism
// Complete table component for displaying customer list with sorting and pagination

import React, { useState } from 'react';
import { CustomerTableRow } from '../molecules/customer-table-row';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  status: 'active' | 'inactive';
  totalSpent?: number;
  orders?: string[];
  createdAt: string;
}

interface CustomersTableProps {
  customers: Customer[];
  onViewDetails: (customerId: string) => void;
  onSort?: (field: keyof Customer, direction: 'asc' | 'desc') => void;
  sortField?: keyof Customer;
  sortDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  showSelection?: boolean;
  selectedCustomers?: string[];
  onSelectCustomer?: (customerId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  onViewDetails,
  onSort,
  sortField,
  sortDirection,
  isLoading = false,
  showSelection = false,
  selectedCustomers = [],
  onSelectCustomer,
  onSelectAll,
}) => {
  const [localSortField, setLocalSortField] =
    useState<keyof Customer>('createdAt');
  const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc'>(
    'desc'
  );

  const currentSortField = sortField || localSortField;
  const currentSortDirection = sortDirection || localSortDirection;

  const handleSort = (field: keyof Customer) => {
    const newDirection =
      currentSortField === field && currentSortDirection === 'asc'
        ? 'desc'
        : 'asc';

    if (onSort) {
      onSort(field, newDirection);
    } else {
      setLocalSortField(field);
      setLocalSortDirection(newDirection);
    }
  };

  const getSortIcon = (field: keyof Customer) => {
    if (currentSortField !== field) {
      return <ChevronsUpDown className='ml-2 h-4 w-4' />;
    }
    return currentSortDirection === 'asc' ? (
      <ChevronUp className='ml-2 h-4 w-4' />
    ) : (
      <ChevronDown className='ml-2 h-4 w-4' />
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll?.(event.target.checked);
  };

  const allSelected =
    selectedCustomers.length === customers.length && customers.length > 0;
  const someSelected =
    selectedCustomers.length > 0 && selectedCustomers.length < customers.length;

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='animate-pulse'>
          <div className='h-12 bg-gray-100 border-b' />
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className='h-16 bg-gray-50 border-b border-gray-100'
            />
          ))}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow p-12 text-center'>
        <p className='text-gray-500 text-lg'>No customers found</p>
        <p className='text-gray-400 text-sm mt-2'>
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection && (
              <TableHead className='w-12'>
                <input
                  type='checkbox'
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
              </TableHead>
            )}

            <TableHead>
              <Button
                variant='ghost'
                onClick={() => handleSort('name')}
                className='h-auto p-0 font-medium text-left justify-start hover:bg-transparent'
              >
                Customer
                {getSortIcon('name')}
              </Button>
            </TableHead>

            <TableHead>Status</TableHead>

            <TableHead>Contact</TableHead>

            <TableHead>
              <Button
                variant='ghost'
                onClick={() => handleSort('orders')}
                className='h-auto p-0 font-medium text-right justify-end hover:bg-transparent'
              >
                Orders
                {getSortIcon('orders')}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant='ghost'
                onClick={() => handleSort('totalSpent')}
                className='h-auto p-0 font-medium text-right justify-end hover:bg-transparent'
              >
                Total Spent
                {getSortIcon('totalSpent')}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant='ghost'
                onClick={() => handleSort('createdAt')}
                className='h-auto p-0 font-medium text-left justify-start hover:bg-transparent'
              >
                Joined
                {getSortIcon('createdAt')}
              </Button>
            </TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.map((customer) => (
            <CustomerTableRow
              key={customer._id}
              customer={customer}
              onViewDetails={onViewDetails}
              isSelected={selectedCustomers.includes(customer._id)}
              onSelect={showSelection ? onSelectCustomer : undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
