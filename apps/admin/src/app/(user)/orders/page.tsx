'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { OrderStatsCards } from '@/pattern/orders/templates/order-stats-cards';
import { OrdersTableTemplate } from '@/pattern/orders/templates/orders-table-template';
import { PeriodFilter } from '@/pattern/orders/molecules/period-filter';
import {
  filterOrdersByPeriod,
  searchOrders,
  type OrderPeriod,
} from '@/lib/orders';
import { useGetAdminOrdersQuery } from '@/redux/services/orders/orders.api-slice';

const PAGE_SIZE = 7;

function OrdersPageContent() {
  // Deep-link from a customer row's "View orders". The endpoint filters by
  // buyer server-side; without reading it back here the link would land on an
  // unfiltered list and quietly claim to have filtered.
  const customerId = useSearchParams().get('customerId') ?? '';

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [period, setPeriod] = useState<OrderPeriod>('week');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search input so filtering doesn't run on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // `page`/`size` are sent regardless: the backend ignores them until
  // server-side paging ships, and `serverPaginated` below reports which mode we
  // actually got back. Period, search and date range remain client-side —
  // the backend has deferred `search`/`startDate`/`endDate`.
  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetAdminOrdersQuery({
      status: status || undefined,
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      customerId: customerId || undefined,
    });

  const orders = useMemo(() => data?.data ?? [], [data]);
  const serverPaginated = data?.serverPaginated ?? false;

  const periodOrders = useMemo(
    () => filterOrdersByPeriod(orders, period),
    [orders, period]
  );

  const filteredOrders = useMemo(
    () => searchOrders(periodOrders, debouncedSearch),
    [periodOrders, debouncedSearch]
  );

  const pageCount = serverPaginated
    ? Math.max(data?.total_pages ?? 1, 1)
    : Math.max(Math.ceil(filteredOrders.length / pagination.pageSize), 1);

  // Keep the current page in range when the filters shrink the result set.
  // Server-side paging owns the page bounds, so this only guards the local one.
  useEffect(() => {
    if (serverPaginated) return;
    setPagination((prev) =>
      prev.pageIndex > pageCount - 1 ? { ...prev, pageIndex: 0 } : prev
    );
  }, [pageCount, serverPaginated]);

  // When the backend paginates, it has already returned exactly one page —
  // slicing again would show a page of a page.
  const pageOrders = useMemo(() => {
    if (serverPaginated) return filteredOrders;
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredOrders.slice(start, start + pagination.pageSize);
  }, [
    filteredOrders,
    serverPaginated,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  const resetToFirstPage = () =>
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Period filter */}
      <div className="flex justify-end">
        <PeriodFilter
          value={period}
          onChange={(next) => {
            setPeriod(next);
            resetToFirstPage();
          }}
        />
      </div>

      {/* Order metrics — platform-wide totals from /admin/dashboard. The
          period filter above scopes the table below, not these cards. */}
      <OrderStatsCards />

      {/* Orders table */}
      <OrdersTableTemplate
        orders={pageOrders}
        filteredOrders={filteredOrders}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        status={status}
        onStatusChange={(next) => {
          setStatus(next);
          resetToFirstPage();
        }}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
      />
    </div>
  );
}

export default function OrdersPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <OrdersPageContent />
    </Suspense>
  );
}
