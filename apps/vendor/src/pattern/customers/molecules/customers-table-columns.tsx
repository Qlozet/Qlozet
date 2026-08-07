'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VendorCustomer } from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerStatus,
  getCustomerIdentifier,
  formatCount,
  type CustomerStatusVariant,
} from '@/lib/customers';
import { CustomerAvatar } from '../atoms/customer-avatar';

// Map the customer status to the shared Badge variants.
const STATUS_BADGE_VARIANT: Record<
  CustomerStatusVariant,
  'success' | 'error' | 'warning'
> = {
  active: 'success',
  inactive: 'error',
  suspended: 'warning',
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
      <span className='text-sm font-medium text-gray-900 dark:text-white'>
        {getCustomerIdentifier(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'totalOrders',
    header: 'Total orders',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600 dark:text-gray-300'>
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
