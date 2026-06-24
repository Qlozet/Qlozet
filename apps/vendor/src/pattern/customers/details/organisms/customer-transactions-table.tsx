'use client';

import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import type { CustomerOrderPreview } from '@/redux/services/customers/customers.api-slice';
import { createCustomerTransactionsColumns } from '../molecules/customer-transactions-columns';

const PAGE_SIZE = 5;

interface CustomerTransactionsTableProps {
  orders: CustomerOrderPreview[];
}

export const CustomerTransactionsTable = ({
  orders,
}: CustomerTransactionsTableProps) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  const notReady = () => toast.info('This action is coming soon.');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((o) =>
      [o.reference, o.status]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query))
    );
  }, [orders, search]);

  const columns = useMemo(
    () => createCustomerTransactionsColumns({ onViewDetails: notReady }),
    []
  );

  return (
    <DataTable
      columns={columns}
      data={filtered}
      pagination={pagination}
      setPagination={setPagination}
      emptyMessage='No transactions found.'
      toolbar={
        <TableToolbar
          title='Recent Transactions'
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          onFilterDate={notReady}
          onExport={notReady}
          filterLabel='Filter By :'
          filterIcon={null}
        />
      }
    />
  );
};
