'use client';

// Customers Page Template
// Customer metrics + table + demographics for the vendor, backed by
// GET /business/customers. Customer details open in a modal (no detail route).

import React, { useEffect, useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExcelExportButton } from '@/pattern/common/molecules/excel-export-button';
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
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { createCustomersTableColumns } from '../molecules/customers-table-columns';
import { CustomerDemographicsChart } from '../organisms/customer-demographics-chart';
import { CustomerAgeGenderChart } from '../organisms/customer-demographics-chart';
import { CustomerDetailsModal } from '../organisms/customer-details-modal';
import { CustomersMobileList } from '../organisms/customers-mobile-list';

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

  const allCustomers = useMemo((): VendorCustomer[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (data.data && Array.isArray((data.data as any).data)) return (data.data as any).data;
    return [];
  }, [data]);
  const total = data?.total ?? (data?.data as any)?.total ?? allCustomers.length;

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

  const customerColumns = useMemo(
    () => createCustomersTableColumns({ onViewDetails: openDetails }),
    [openDetails]
  );

  return (
    <div className='w-full min-h-screen h-fit space-y-6 pb-10'>
      {/* Customer metrics */}
      <CustomerStatsSection total={total} isLoading={isLoading} />

      {/* Table + demographics */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Wrapper so the mobile toolbar can sit *above* the card, as the
            mobile design has it, while the card still fills the grid cell. */}
        <div className='flex flex-col'>
          {/* Mobile toolbar — search, filter and export above the card */}
          <div className='mb-4 flex items-center gap-3 md:hidden'>
            <div className='relative flex-1'>
              <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search'
                className='h-11 w-full rounded-lg pl-9 bg-[#F8F9FA] dark:bg-muted dark:border-border dark:text-foreground'
              />
            </div>

            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={notReady('Filter')}
              aria-label='Filter'
              className='h-11 w-11 shrink-0 cursor-pointer text-gray-600 dark:text-gray-400 dark:border-gray-500'
            >
              <SlidersHorizontal className='size-4' />
            </Button>

            <ExcelExportButton onClick={handleExport} />
          </div>

          {/* Customers table — flex column so the pagination is pushed to the
              bottom of the card (auto gap) when the card stretches taller than
              the table (e.g. matching the demographics column height). */}
          <div
            id='customers-table'
            className='flex flex-1 flex-col overflow-hidden rounded-xl border bg-card custom-card-shadow scroll-mt-24'
          >
            {/* Mobile card header band */}
            <div className='bg-[#F8F9FA] px-4 py-4 dark:bg-muted md:hidden'>
              <h2 className='text-base font-semibold text-[hsla(210,9%,31%,1)] dark:text-white'>
                {title}
              </h2>
            </div>

            {/* Toolbar — desktop only; below `md` it moves above the card */}
            <div className='hidden gap-4 px-6 py-5 md:flex md:items-center md:justify-between'>
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
                  className='h-10 w-10 shrink-0 text-gray-600 dark:text-gray-400 dark:border-gray-500'
                >
                  <SlidersHorizontal className='size-4' />
                </Button>

                <div className='relative flex-1'>
                  <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder='Search'
                    className='h-10 w-full rounded-lg pl-9 sm:w-[200px] bg-[#F8F9FA] dark:bg-muted dark:border-border dark:text-foreground'
                  />
                </div>

                {/* Shared export button — labelled "Export", collapsing to the
                    icon only below `sm`, like every other table's toolbar. */}
                <ExcelExportButton onClick={handleExport} />
              </div>
            </div>

            {/* The table's five columns don't fit a phone, so below `md` the
                list renders as cards instead. Both share `pagination`. */}
            <div className='flex flex-1 flex-col max-md:hidden'>
              <DataTable
                columns={customerColumns}
                data={customers}
                isLoading={isLoading}
                isFetching={isFetching}
                isSuccess={isSuccess}
                isError={isError}
                error={error}
                pagination={pagination}
                setPagination={setPagination}
                onRowClick={openDetails}
                emptyMessage='Customers will show up here once they make a purchase.'
              />
            </div>

            <CustomersMobileList
              customers={customers}
              isLoading={isLoading}
              isFetching={isFetching}
              isError={isError}
              error={error}
              pagination={pagination}
              setPagination={setPagination}
              onViewDetails={openDetails}
              emptyMessage='Customers will show up here once they make a purchase.'
            />
          </div>
        </div>

        {/* Customer Locations + Demographics */}
        <div className='flex flex-col gap-6'>
          <CustomerDemographicsChart />
          <CustomerAgeGenderChart />
        </div>
      </div>
    </div>
  );
};
