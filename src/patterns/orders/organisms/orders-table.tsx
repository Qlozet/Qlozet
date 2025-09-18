// Orders Table - Organism
// Complete table component for displaying order list with sorting and pagination

import React, { useState } from 'react';
import { OrderTableRow } from '../molecules/order-table-row';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'return';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (orderId: string) => void;
  onViewCustomer?: (customerId: string) => void;
  onSort?: (field: keyof Order, direction: 'asc' | 'desc') => void;
  sortField?: keyof Order;
  sortDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  showSelection?: boolean;
  selectedOrders?: string[];
  onSelectOrder?: (orderId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewDetails,
  onViewCustomer,
  onSort,
  sortField,
  sortDirection,
  isLoading = false,
  showSelection = false,
  selectedOrders = [],
  onSelectOrder,
  onSelectAll,
}) => {
  const [localSortField, setLocalSortField] =
    useState<keyof Order>('createdAt');
  const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc'>(
    'desc'
  );

  const currentSortField = sortField || localSortField;
  const currentSortDirection = sortDirection || localSortDirection;

  const handleSort = (field: keyof Order) => {
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

  const getSortIcon = (field: keyof Order) => {
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
    selectedOrders.length === orders.length && orders.length > 0;
  const someSelected =
    selectedOrders.length > 0 && selectedOrders.length < orders.length;

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='animate-pulse'>
          <div className='h-12 bg-gray-100 border-b' />
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className='h-20 bg-gray-50 border-b border-gray-100'
            />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow p-12 text-center'>
        <p className='text-gray-500 text-lg'>No orders found</p>
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
                onClick={() => handleSort('orderNumber')}
                className='h-auto p-0 font-medium text-left justify-start hover:bg-transparent'
              >
                Order
                {getSortIcon('orderNumber')}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant='ghost'
                onClick={() => handleSort('customerName')}
                className='h-auto p-0 font-medium text-left justify-start hover:bg-transparent'
              >
                Customer
                {getSortIcon('customerName')}
              </Button>
            </TableHead>

            <TableHead>Items</TableHead>

            <TableHead>
              <Button
                variant='ghost'
                onClick={() => handleSort('total')}
                className='h-auto p-0 font-medium text-right justify-end hover:bg-transparent'
              >
                Total
                {getSortIcon('total')}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant='ghost'
                onClick={() => handleSort('status')}
                className='h-auto p-0 font-medium text-left justify-start hover:bg-transparent'
              >
                Order Status
                {getSortIcon('status')}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant='ghost'
                onClick={() => handleSort('paymentStatus')}
                className='h-auto p-0 font-medium text-left justify-start hover:bg-transparent'
              >
                Payment
                {getSortIcon('paymentStatus')}
              </Button>
            </TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map((order) => (
            <OrderTableRow
              key={order._id}
              order={order}
              onViewDetails={onViewDetails}
              onViewCustomer={onViewCustomer}
              isSelected={selectedOrders.includes(order._id)}
              onSelect={showSelection ? onSelectOrder : undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
