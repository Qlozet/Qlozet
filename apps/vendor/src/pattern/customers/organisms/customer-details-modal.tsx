'use client';

// Customer Details Modal - Organism
// Vendor customer details shown in a dialog (avatar + summary + Measurement
// button + order history), matching the vendor design. Resolves the customer
// from GET /business/customers by id (no single-customer endpoint exists).

import React, { useCallback, useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import NiceModal from '@ebay/nice-modal-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { Ruler, ChevronRight, Mail, Phone, User } from 'lucide-react';
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
  type VendorCustomer,
} from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerIdentifier,
  getCustomerName,
  getCustomerInitial,
  getCustomerStatus,
  formatCount,
  type CustomerStatusVariant,
} from '@/lib/customers';
import { APP_ROUTES } from '@/lib/routes';
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
    <span className='w-28 shrink-0 text-gray-500 dark:text-gray-400'>{label}</span>
    <span className='font-medium text-gray-900 dark:text-white'>{value}</span>
  </div>
);

export const CustomerDetailsModal = create<CustomerDetailsModalProps>(
  ({ customerId }) => {
    const { visible, resolve, hide, remove } = useModal();
    const router = useRouter();
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: ORDERS_PAGE_SIZE,
    });

    const { data, isLoading, isFetching, isSuccess, isError, error } =
      useGetVendorCustomersQuery(
        { page: 1, limit: 200, orders_limit: 50 },
        { skip: !customerId || !visible }
      );

    const customer = useMemo((): VendorCustomer | undefined => {
      if (!data) return undefined;
      // The response can be nested differently depending on the API wrapper:
      //   data.data = VendorCustomer[]           (direct)
      //   data.data = { data: VendorCustomer[] } (double-wrapped)
      let list: VendorCustomer[] = [];
      if (Array.isArray(data)) {
        list = data as unknown as VendorCustomer[];
      } else if (Array.isArray(data.data)) {
        list = data.data;
      } else if (data.data && Array.isArray((data.data as any).data)) {
        list = (data.data as any).data;
      }
      return list.find((c) => c._id === customerId);
    }, [data, customerId]);

    const orders = useMemo(() => customer?.orders ?? [], [customer]);

    const handleClose = (open?: boolean | React.MouseEvent) => {
      if (typeof open !== 'boolean' || !open) {
        resolve({ resolved: true });
        hide();
        setTimeout(() => remove(), 300);
      }
    };

    const openMeasurements = () => {
      if (!customer) return;
      NiceModal.show(CustomerMeasurementsModal, {
        customer,
        measurementSet: customer.default_measurement ?? undefined,
      });
    };

    const handleViewOrder = useCallback((order: CustomerOrderPreview) => {
      resolve({ resolved: true });
      hide();
      setTimeout(() => remove(), 300);
      router.push(APP_ROUTES.orders);
      toast.info(`Navigated to orders — look for #${order.reference.slice(-6).toUpperCase()}`);
    }, [resolve, hide, remove, router]);

    const columns = useMemo(
      () => createOrderHistoryColumns(handleViewOrder),
      [handleViewOrder]
    );

    const loading = isLoading || isFetching;

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto p-0'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle className='text-lg font-bold text-gray-900 dark:text-white'>
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
                    value={
                      <span className='inline-flex items-center gap-1.5'>
                        <User className='size-3.5 text-gray-400' />
                        @{getCustomerIdentifier(customer)}
                      </span>
                    }
                  />
                  {customer.full_name && (
                    <SummaryRow
                      label='Full Name'
                      value={getCustomerName(customer)}
                    />
                  )}
                  {customer.email && (
                    <SummaryRow
                      label='Email'
                      value={
                        <span className='inline-flex items-center gap-1.5'>
                          <Mail className='size-3.5 text-gray-400' />
                          {customer.email}
                        </span>
                      }
                    />
                  )}
                  {customer.phone_number && (
                    <SummaryRow
                      label='Phone'
                      value={
                        <span className='inline-flex items-center gap-1.5'>
                          <Phone className='size-3.5 text-gray-400' />
                          {customer.phone_number}
                        </span>
                      }
                    />
                  )}
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
              <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
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
