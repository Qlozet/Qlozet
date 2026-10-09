'use client';

// Orders Page Template
// Vendor orders: headline metrics + paginated orders table with status filter.
// Uses the shared DataTable component.

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { readCustomerName, readOrderId } from '../lib/order-fields';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ReturnsPanel } from '../organisms/returns-panel';
import { DisputesPanel } from '../organisms/disputes-panel';
import { QuoteRequestsTemplate } from '@/pattern/bespoke/templates/quote-requests-template';
import { useAppSelector } from '@/redux/store';
import { useGetUnreadMessageCountsQuery } from '@/redux/services/messaging/messaging.api-slice';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
import { readPageCount } from '@/redux/services/types';
import { useSearchParams } from 'next/navigation';
import { useGetVendorOrderQuery } from '@/redux/services/orders/orders.api-slice';

const TAB_VALUES = ['orders', 'quotes', 'returns', 'disputes'] as const;
type OrdersTab = (typeof TAB_VALUES)[number];

const PAGE_SIZE = 7;

export const OrdersPageTemplate: React.FC = () => {
  // Active vendor business — used to scope each order row to this vendor's items.
  const businessId = useAppSelector(selectActiveBusiness)?._id ?? '';

  // Deep links. A notification about one order lands here with ?ref=<reference>
  // (plus ?chat=1 for a message, and ?tab= for the disputes/quotes tabs), and
  // the drawer opens on arrival — the point being that you should not have to
  // find the order the notification was about.
  const searchParams = useSearchParams();
  const deepLinkRef = searchParams.get('ref');
  const wantsChat = searchParams.get('chat') === '1';
  const requestedTab = searchParams.get('tab');
  const [tab, setTab] = useState<OrdersTab>(
    TAB_VALUES.includes(requestedTab as OrdersTab)
      ? (requestedTab as OrdersTab)
      : 'orders'
  );

  // Fetched by reference rather than hunted for in the loaded page: the order
  // may well be on a page the table has not loaded.
  const { data: deepLinkOrder } = useGetVendorOrderQuery(deepLinkRef ?? '', {
    skip: !deepLinkRef,
  });

  // Opened once per reference. Without the guard, every unrelated re-render
  // re-opens the drawer the user just closed.
  const openedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!deepLinkRef || !deepLinkOrder) return;
    if (openedRef.current === deepLinkRef) return;
    openedRef.current = deepLinkRef;
    NiceModal.show(OrderDetailsDrawer, {
      order: deepLinkOrder,
      openChat: wantsChat,
    });
  }, [deepLinkRef, deepLinkOrder, wantsChat]);

  // Unread chat counts for every order at once. The notifications socket
  // invalidates this tag when a message arrives, so the badges update live
  // without this component holding a socket of its own.
  const { data: unreadMessages } = useGetUnreadMessageCountsQuery();
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

  // Any order in this list is a real, accepted order (bespoke orders only exist
  // after a quote is accepted), so open the details/fulfil drawer for all of
  // them. The quote-builder drawer lives on the Quote Requests tab.
  const openDetails = (order: Order) => {
    NiceModal.show(OrderDetailsDrawer, { order });
  };

  const columns = useMemo(
    () =>
      createOrdersColumns(openDetails, businessId, unreadMessages?.per_order),
    [businessId, unreadMessages?.per_order]
  );

  const pageCount = readPageCount(data, pagination.pageSize);

  const notReady = (label: string) => () =>
    toast.info(`${label} is coming soon.`);

  return (
    <div className="w-full min-h-screen h-fit pb-10">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as OrdersTab)}
        className="space-y-6"
      >
        {/* Card-background tab bar; active tab uses the theme's primary colour.
            On mobile it spans the full screen width and scrolls horizontally
            (triggers keep their size and overflow into a swipe-scroll); on
            larger screens it shrinks back to fit its content. */}
        <TabsList className="h-12 w-full sm:w-fit justify-start sm:justify-center gap-1 overflow-x-auto scrollbar-hide rounded-2xl border border-border bg-card p-1.5 custom-card-shadow">
          {[
            { value: 'orders', label: 'Orders' },
            { value: 'quotes', label: 'Quote Requests' },
            { value: 'returns', label: 'Returns' },
            { value: 'disputes', label: 'Disputes' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="shrink-0 rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {/* Metrics */}
          <OrderStatsSection isLoading={isLoading} />

          {/* Orders table */}
          <div className="bg-card w-full rounded-xl border custom-card-shadow">
            <TableToolbar
              title="Orders"
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
              emptyMessage="Orders will show up here once a customer places an order."
            />
          </div>
        </TabsContent>

        <TabsContent value="quotes">
          <QuoteRequestsTemplate />
        </TabsContent>

        <TabsContent value="returns">
          <ReturnsPanel />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPageTemplate;
