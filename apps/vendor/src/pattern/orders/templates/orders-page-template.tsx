'use client';

// Orders Page Template
// Vendor orders: headline metrics + paginated orders table with status filter.
// Uses the shared DataTable component.

import React, { useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  useGetVendorOrdersQuery,
  type Order,
  type OrderStatus,
} from '@/redux/services/orders/orders.api-slice';
import { OrderStatsSection } from '../molecules/order-stats-section';
import { createOrdersColumns } from '../molecules/orders-table-columns';
import {
  OrderStatusFilterMenu,
  type OrderStatusFilter,
} from '../molecules/order-status-filter-menu';
import { OrderDetailsDrawer } from '../organisms/order-details-drawer';
import { OrderQuoteDrawer } from '../organisms/order-quote-drawer';
import {
  isCustomOrder,
  readCustomerName,
  readOrderId,
} from '../lib/order-fields';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { ReturnsPanel } from '../organisms/returns-panel';
import { DisputesPanel } from '../organisms/disputes-panel';

const PAGE_SIZE = 7;

export const OrdersPageTemplate: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorOrdersQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      status: statusFilter,
    });

  // Real orders only — no dummy data.
  const orders = useMemo<Order[]>(() => data?.data ?? [], [data]);

  // Client-side search filter (server doesn't support text search)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [readCustomerName(o), readOrderId(o)]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q))
    );
  }, [orders, search]);

  const openDetails = (order: Order) => {
    if (isCustomOrder(order)) {
      NiceModal.show(OrderQuoteDrawer, { order });
    } else {
      NiceModal.show(OrderDetailsDrawer, { order });
    }
  };

  const columns = useMemo(() => createOrdersColumns(openDetails), []);

  const pageCount = data?.total_pages ?? 1;

  const notReady = (label: string) => () =>
    toast.info(`${label} is coming soon.`);

  return (
    <div className='w-full min-h-screen h-fit pb-10'>
      <Tabs defaultValue='orders' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='orders'>Orders</TabsTrigger>
          <TabsTrigger value='returns'>Returns</TabsTrigger>
          <TabsTrigger value='disputes'>Disputes</TabsTrigger>
        </TabsList>

        <TabsContent value='orders' className='space-y-6'>
          {/* Metrics */}
          <OrderStatsSection isLoading={isLoading} />

          {/* Orders table */}
          <div className='bg-card w-full rounded-[10px] shadow-md'>
            <TableToolbar
              title='Orders'
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              filterControl={
                <OrderStatusFilterMenu
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                />
              }
              onExport={notReady('Export')}
            />
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
              pageCount={pageCount}
              manualPagination
              onRowClick={openDetails}
              emptyMessage='Orders will show up here once a customer places an order.'
            />
          </div>
        </TabsContent>

        <TabsContent value='returns'>
          <ReturnsPanel />
        </TabsContent>

        <TabsContent value='disputes'>
          <DisputesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPageTemplate;
