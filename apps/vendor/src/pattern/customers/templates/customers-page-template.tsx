'use client';

// Customers Page Template
// Customer metrics + table + demographics for the vendor, backed by
// GET /business/customers. Customer details open in a modal (no detail route).

import React, { useEffect, useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Search, Sheet, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useGetVendorCustomersQuery,
  type VendorCustomer,
} from '@/redux/services/customers/customers.api-slice';
import {
  exportCustomersToCsv,
  getCustomerIdentifier,
  getCustomerName,
} from '@/lib/customers';
import { CustomerStatsSection } from '../molecules/customer-stats-section';
import { CustomersTable } from '../organisms/customers-table';
import { CustomerDemographicsChart } from '../organisms/customer-demographics-chart';
import { CustomerDetailsModal } from '../organisms/customer-details-modal';

const PAGE_SIZE = 5;
// The endpoint has no search param, so we load a generous page and search /
// paginate client-side. Revisit if a vendor can exceed this many customers.
const FETCH_LIMIT = 200;

interface CustomersPageTemplateProps {
  title?: string;
}

export const CustomersPageTemplate: React.FC<CustomersPageTemplateProps> = ({
  title = 'Customers',
}) => {
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorCustomersQuery({ page: 1, limit: FETCH_LIMIT, orders_limit: 5 });

  const allCustomers = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? allCustomers.length;

  // Client-side search across the identifier and full name.
  const customers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allCustomers;
    return allCustomers.filter((c) =>
      [getCustomerIdentifier(c), getCustomerName(c)]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query))
    );
  }, [allCustomers, search]);

  // Reset to the first page whenever the search narrows the result set.
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

  const openDetails = (customer: VendorCustomer) => {
    NiceModal.show(CustomerDetailsModal, { customerId: customer._id });
  };

  const notReady = (label: string) => () =>
    toast.info(`${label} is coming soon.`);

  const handleExport = () => {
    if (customers.length === 0) {
      toast.info('No customers to export yet.');
      return;
    }
    exportCustomersToCsv(customers);
  };

  return (
    <div className='w-full min-h-screen h-fit space-y-6 pb-10'>
      {/* Customer metrics */}
      <CustomerStatsSection total={total} isLoading={isLoading} />

      {/* Table + demographics */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Customers table */}
        <div className='overflow-hidden rounded-xl border bg-card custom-card-shadow'>
          {/* Toolbar */}
          <div className='flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between'>
            <h2 className='text-lg font-semibold text-[hsla(210,9%,31%,1)] dark:text-white'>
              {title}
            </h2>

            <div className='flex items-center gap-3'>
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={notReady('Filter')}
                aria-label='Filter'
                className='h-10 w-10 shrink-0 text-gray-600'
              >
                <SlidersHorizontal className='size-4' />
              </Button>

              <div className='relative flex-1'>
                <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search'
                  className='h-10 w-full rounded-lg pl-9 sm:w-[200px]'
                />
              </div>

              <Button
                type='button'
                size='icon'
                onClick={handleExport}
                aria-label='Export'
                className='h-10 w-10 shrink-0'
              >
                <Sheet className='size-4' />
              </Button>
            </div>
          </div>

          <CustomersTable
            data={customers}
            isLoading={isLoading}
            isFetching={isFetching}
            isSuccess={isSuccess}
            isError={isError}
            error={error}
            pagination={pagination}
            setPagination={setPagination}
            onRowClick={openDetails}
            actions={{ onViewDetails: openDetails }}
          />
        </div>

        {/* Demographics */}
        <CustomerDemographicsChart />
      </div>
    </div>
  );
};
