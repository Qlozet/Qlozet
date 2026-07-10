'use client';

// Order status filter — a thin wrapper around the shared FilterMenu with
// the order status options.

import {
  FilterMenu,
  type FilterOption,
} from '@/pattern/common/molecules/filter-menu';
import type { OrderStatus } from '@/redux/services/orders/orders.api-slice';

export type OrderStatusFilter = OrderStatus | 'all';

const FILTER_OPTIONS: FilterOption<OrderStatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'processing', label: 'Processing' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

interface OrderStatusFilterMenuProps {
  value: OrderStatusFilter;
  onChange: (value: OrderStatusFilter) => void;
}

export const OrderStatusFilterMenu = ({
  value,
  onChange,
}: OrderStatusFilterMenuProps) => (
  <FilterMenu options={FILTER_OPTIONS} value={value} onChange={onChange} />
);
