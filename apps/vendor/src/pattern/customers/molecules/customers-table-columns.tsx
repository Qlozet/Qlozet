'use client';

import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VendorCustomer } from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerStatus,
  getCustomerIdentifier,
  getCustomerInitial,
  formatCount,
  type CustomerStatusVariant,
} from '@/lib/customers';

// Map the customer status to the shared Badge variants.
const STATUS_BADGE_VARIANT: Record<
  CustomerStatusVariant,
  'success' | 'error' | 'warning'
> = {
  active: 'success',
  inactive: 'error',
  suspended: 'warning',
};

const CustomerAvatar = ({ customer }: { customer: VendorCustomer }) => {
  if (customer.profile_picture) {
    return (
      <div className='relative size-9 overflow-hidden rounded-full bg-gray-100'>
        <Image
          src={customer.profile_picture}
          alt={getCustomerIdentifier(customer)}
          fill
          className='object-cover'
          sizes='36px'
        />
      </div>
    );
  }
  return (
    <span className='flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
      {getCustomerInitial(customer)}
    </span>
  );
};

export interface CustomersTableActions {
  onViewDetails: (customer: VendorCustomer) => void;
}

export const createCustomersTableColumns = ({
  onViewDetails,
}: CustomersTableActions): ColumnDef<VendorCustomer>[] => [
  {
    id: 'picture',
    header: 'Picture',
    cell: ({ row }) => <CustomerAvatar customer={row.original} />,
    enableSorting: false,
  },
  {
    id: 'username',
    header: 'Username',
    cell: ({ row }) => (
      <span className='text-sm font-medium text-gray-900'>
        {getCustomerIdentifier(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'totalOrders',
    header: 'Total orders',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>
        {formatCount(row.original.total_orders)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getCustomerStatus(row.original);
      return (
        <Badge
          variant={STATUS_BADGE_VARIANT[status.variant]}
          shape='square'
          className='h-[26px] flex w-fit items-center justify-center px-3 text-xs font-normal'
        >
          {status.label}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => onViewDetails(row.original)}
        className='h-9 text-sm'
      >
        View
      </Button>
    ),
    enableSorting: false,
  },
];
