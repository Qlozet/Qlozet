'use client';

// Transaction status filter — a thin wrapper around the shared FilterMenu with
// the wallet's status options.

import {
  FilterMenu,
  type FilterOption,
} from '@/pattern/common/molecules/filter-menu';

export type TransactionStatusFilter =
  | 'all'
  | 'pending'
  | 'successful'
  | 'failed'
  | 'refund';

const FILTER_OPTIONS: FilterOption<TransactionStatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'successful', label: 'Successful' },
  { value: 'failed', label: 'Failed' },
  { value: 'refund', label: 'Refund' },
];

interface TransactionFilterMenuProps {
  value: TransactionStatusFilter;
  onChange: (value: TransactionStatusFilter) => void;
}

export const TransactionFilterMenu = ({
  value,
  onChange,
}: TransactionFilterMenuProps) => (
  <FilterMenu options={FILTER_OPTIONS} value={value} onChange={onChange} />
);
