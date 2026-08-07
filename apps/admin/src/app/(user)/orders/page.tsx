'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { OrderStatsCards } from '@/pattern/orders/templates/order-stats-cards';
import { OrdersTableTemplate } from '@/pattern/orders/templates/orders-table-template';
import { PeriodFilter } from '@/pattern/orders/molecules/period-filter';
import {
  computeOrderMetrics,
  filterOrdersByPeriod,
  searchOrders,
  type OrderPeriod,
} from '@/lib/orders';
import { useGetAdminOrdersQuery } from '@/redux/services/orders/orders.api-slice';

const PAGE_SIZE = 7;

export default function OrdersPage() {
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

  // `/admin/vendor/orders` only accepts a status filter — period, search and
  // pagination are applied client-side over the full result set.
  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetAdminOrdersQuery({ status: status || undefined });

  const orders = useMemo(() => data?.data ?? [], [data]);

  const periodOrders = useMemo(
    () => filterOrdersByPeriod(orders, period),
    [orders, period]
  );

  const filteredOrders = useMemo(
    () => searchOrders(periodOrders, debouncedSearch),
    [periodOrders, debouncedSearch]
  );

  // Metrics reflect the selected period but ignore the search box, so typing
  // doesn't make the headline numbers jump around.
  const metrics = useMemo(
    () => computeOrderMetrics(periodOrders),
    [periodOrders]
  );

  const pageCount = Math.max(
    Math.ceil(filteredOrders.length / pagination.pageSize),
    1
  );

  // Keep the current page in range when the filters shrink the result set.
  useEffect(() => {
    setPagination((prev) =>
      prev.pageIndex > pageCount - 1 ? { ...prev, pageIndex: 0 } : prev
    );
  }, [pageCount]);

  const pageOrders = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredOrders.slice(start, start + pagination.pageSize);
  }, [filteredOrders, pagination.pageIndex, pagination.pageSize]);

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

      {/* Order metrics */}
      <OrderStatsCards metrics={metrics} isLoading={isLoading} />

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
