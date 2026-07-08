'use client';

// Orders Page Template
// Vendor orders: headline metrics + orders table. Standard orders open a
// details drawer; custom (bespoke) orders open the quote-builder drawer.

import React, { useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { useGetVendorOrdersQuery } from '@/redux/services/orders/orders.api-slice';
import { OrderStatsSection } from '../molecules/order-stats-section';
import { createOrdersColumns } from '../molecules/orders-table-columns';
import { OrderDetailsDrawer } from '../organisms/order-details-drawer';
import { OrderQuoteDrawer } from '../organisms/order-quote-drawer';

import {
  isCustomOrder,
  readCustomerName,
  readOrderId,
  type OrderRow,
} from '../lib/order-fields';
import { SAMPLE_ORDERS } from '../lib/orders-sample';

const PAGE_SIZE = 7;

export const OrdersPageTemplate: React.FC = () => {
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorOrdersQuery();

  // Real list when present; otherwise fall back to mockup rows so the table
  // matches the design (the /orders/vendor shape is undocumented).
  const orders = useMemo<OrderRow[]>(() => {
    const real = (data?.data as OrderRow[] | undefined) ?? [];
    return real.length ? real : SAMPLE_ORDERS;
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [readCustomerName(o), readOrderId(o)]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q))
    );
  }, [orders, search]);

  const openDetails = (order: OrderRow) => {
    if (isCustomOrder(order)) {
      NiceModal.show(OrderQuoteDrawer, { order });
    } else {
      NiceModal.show(OrderDetailsDrawer, { order });
    }
  };

  const columns = useMemo(() => createOrdersColumns(openDetails), []);


  const notReady = (label: string) => () =>
    toast.info(`${label} is coming soon.`);

  return (
    <div className='w-full min-h-screen h-fit space-y-6 pb-10'>


      {/* Metrics */}
      <OrderStatsSection isLoading={isLoading} />

      {/* Orders table */}
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        pagination={pagination}
        setPagination={setPagination}
        onRowClick={openDetails}
        emptyMessage='No orders yet.'
        minWidth='980px'
        toolbar={
          <TableToolbar
            title='Orders'
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            filterLabel='Filter By :'
            filterIcon={<CalendarRange className='size-4' />}
            onFilterDate={notReady('Filter')}
            onExport={notReady('Export')}
          />
        }
      />
    </div>
  );
};

export default OrdersPageTemplate;
