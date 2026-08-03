'use client';

import { useCallback } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { downloadCsv, toCsv } from '@/lib/csv';
import {
  formatOrderDate,
  orderStatusBadge,
  readAmountPaid,
  readCustomerName,
  readItemsCount,
  readOrderId,
  readProductPrice,
  readStatus,
} from '@/lib/orders';
import type { AdminOrder } from '@/redux/services/orders/orders.api-slice';
import { OrderStatusFilter } from '../molecules/order-status-filter';
import { OrderDetailsDrawer } from '../organisms/order-details-drawer';
import { OrdersTable } from '../organisms/orders-table';

const CSV_HEADERS = [
  'Date',
  'Order ID',
  'Product price',
  'Customer name',
  'Amount paid',
  'Items',
  'Delivery status',
];

interface OrdersTableTemplateProps {
  /** Rows for the current page. */
  orders: AdminOrder[];
  /** Every order matching the current filters — exported in full. */
  filteredOrders: AdminOrder[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
}

export const OrdersTableTemplate = ({
  orders,
  filteredOrders,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  search,
  onSearchChange,
  status,
  onStatusChange,
  pagination,
  setPagination,
  pageCount,
}: OrdersTableTemplateProps) => {
  // There's no single-order endpoint — the drawer renders the order already
  // cached by the list query.
  const handleViewDetails = useCallback((order: AdminOrder) => {
    NiceModal.show(OrderDetailsDrawer, { order });
  }, []);

  const handleExport = useCallback(() => {
    const rows = filteredOrders.map((order) => [
      formatOrderDate(order.createdAt),
      readOrderId(order),
      readProductPrice(order) ?? '',
      readCustomerName(order),
      readAmountPaid(order) ?? '',
      readItemsCount(order),
      orderStatusBadge(readStatus(order)).label,
    ]);
    downloadCsv('orders.csv', toCsv(CSV_HEADERS, rows));
  }, [filteredOrders]);

  return (
    <OrdersTable
      data={orders}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      onViewDetails={handleViewDetails}
      toolbar={
        <TableToolbar
          title="Orders"
          search={search}
          onSearchChange={onSearchChange}
          onExport={handleExport}
          filterControl={
            <OrderStatusFilter value={status} onChange={onStatusChange} />
          }
        />
      }
    />
  );
};
