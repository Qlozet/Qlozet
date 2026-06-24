// Customer Details Modal - Organism
// Vendor customer details shown in a dialog (avatar + summary + Measurement
// button + order history), matching the vendor design. Resolves the customer
// from GET /business/customers by id (no single-customer endpoint exists).

'use client';

import React, { useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import NiceModal from '@ebay/nice-modal-react';
import Image from 'next/image';
import type { PaginationState } from '@tanstack/react-table';
import { Ruler, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import {
  useGetVendorCustomersQuery,
  type CustomerOrderPreview,
} from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerIdentifier,
  getCustomerInitial,
  getCustomerStatus,
  formatCount,
  type CustomerStatusVariant,
} from '@/lib/customers';
import { createOrderHistoryColumns } from '../details/molecules/customer-order-history-columns';
import { CustomerMeasurementsModal } from '../details/organisms/customer-measurements-modal';

const STATUS_BADGE_VARIANT: Record<
  CustomerStatusVariant,
  'success' | 'error' | 'warning'
> = {
  active: 'success',
  inactive: 'error',
  suspended: 'warning',
};

const ORDERS_PAGE_SIZE = 5;

interface CustomerDetailsModalProps {
  customerId: string;
}

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className='flex items-center gap-6 text-sm'>
    <span className='w-28 shrink-0 text-gray-500'>{label}</span>
    <span className='font-medium text-gray-900'>{value}</span>
  </div>
);

export const CustomerDetailsModal = create<CustomerDetailsModalProps>(
  ({ customerId }) => {
    const { visible, resolve, remove } = useModal();
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: ORDERS_PAGE_SIZE,
    });

    const { data, isLoading, isFetching, isSuccess, isError, error } =
      useGetVendorCustomersQuery(
        { page: 1, limit: 200, orders_limit: 50 },
        { skip: !customerId || !visible }
      );

    const customer = useMemo(
      () => data?.data?.find((c) => c._id === customerId),
      [data, customerId]
    );

    const orders = useMemo(() => customer?.orders ?? [], [customer]);

    const handleClose = () => {
      resolve({ resolved: true });
      remove();
    };

    const openMeasurements = () => {
      if (!customer) return;
      NiceModal.show(CustomerMeasurementsModal, {
        customer,
        measurementSet: customer.default_measurement ?? undefined,
      });
    };

    const columns = useMemo(
      () =>
        createOrderHistoryColumns((_order: CustomerOrderPreview) =>
          toast.info('Viewing an order is coming soon.')
        ),
      []
    );

    const loading = isLoading || isFetching;

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto p-0'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle className='text-lg font-bold text-gray-900'>
              Customer details
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-6 px-6 pb-6'>
            {/* Summary */}
            {loading ? (
              <div className='flex items-start gap-5'>
                <Skeleton className='size-24 rounded-full' />
                <div className='flex-1 space-y-3'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-4 w-40' />
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-10 w-44 rounded-lg' />
                </div>
              </div>
            ) : customer ? (
              <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
                {customer.profile_picture ? (
                  <div className='relative size-24 shrink-0 overflow-hidden rounded-full bg-gray-100'>
                    <Image
                      src={customer.profile_picture}
                      alt={getCustomerIdentifier(customer)}
                      fill
                      className='object-cover'
                      sizes='96px'
                    />
                  </div>
                ) : (
                  <span className='flex size-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary'>
                    {getCustomerInitial(customer)}
                  </span>
                )}

                <div className='flex-1 space-y-3'>
                  <SummaryRow
                    label='Username'
                    value={getCustomerIdentifier(customer)}
                  />
                  <SummaryRow
                    label='Total Orders'
                    value={formatCount(customer.total_orders)}
                  />
                  <SummaryRow
                    label='Status'
                    value={
                      <Badge
                        variant={
                          STATUS_BADGE_VARIANT[getCustomerStatus(customer).variant]
                        }
                        shape='square'
                        className='h-[26px] px-3 text-xs font-normal'
                      >
                        {getCustomerStatus(customer).label}
                      </Badge>
                    }
                  />

                  <Button
                    type='button'
                    variant='outline'
                    onClick={openMeasurements}
                    className='mt-1 gap-2'
                  >
                    <Ruler className='size-4' />
                    Measurement
                    <ChevronRight className='size-4' />
                  </Button>
                </div>
              </div>
            ) : (
              <p className='py-8 text-center text-sm text-muted-foreground'>
                Customer not found.
              </p>
            )}

            {/* Order history */}
            <div className='space-y-3'>
              <h3 className='text-base font-semibold text-gray-900'>
                Order history
              </h3>
              <DataTable
                columns={columns}
                data={orders}
                isLoading={loading}
                isSuccess={isSuccess}
                isError={isError}
                error={error}
                pagination={pagination}
                setPagination={setPagination}
                emptyMessage='No orders yet.'
                minWidth='640px'
              />
            </div>

            <div className='flex justify-end'>
              <Button type='button' onClick={handleClose} className='min-w-[8rem]'>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
