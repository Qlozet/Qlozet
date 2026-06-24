'use client';

import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { VendorCustomer } from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerStatus,
  getCustomerIdentifier,
  getCustomerInitial,
  getLastOrderDate,
  formatCount,
  formatDate,
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
  onBlockUnblock: (customer: VendorCustomer) => void;
  onSendMessage: (customer: VendorCustomer) => void;
  onViewComplaints: (customer: VendorCustomer) => void;
  onDelete: (customer: VendorCustomer) => void;
}

export const createCustomersTableColumns = ({
  onViewDetails,
  onBlockUnblock,
  onSendMessage,
  onViewComplaints,
  onDelete,
}: CustomersTableActions): ColumnDef<VendorCustomer>[] => [
  {
    id: 'picture',
    header: 'Picture',
    cell: ({ row }) => <CustomerAvatar customer={row.original} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: 'Customer name',
    cell: ({ row }) => (
      <span className='text-sm font-medium text-gray-900'>
        {getCustomerIdentifier(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    // The endpoint doesn't return email/phone; kept for design parity as dashes.
    id: 'email',
    header: 'Email address',
    cell: () => <div className='text-sm text-gray-600'>—</div>,
    enableSorting: false,
  },
  {
    id: 'phone',
    header: 'Phone number',
    cell: () => <div className='text-sm text-gray-600'>—</div>,
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
    id: 'lastOrderDate',
    header: 'Last Order date',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>
        {formatDate(getLastOrderDate(row.original))}
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
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem onClick={() => onViewDetails(customer)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBlockUnblock(customer)}>
              Block/Unblock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendMessage(customer)}>
              Send Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewComplaints(customer)}>
              View Complaints
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(customer)}
              className='text-red-600 focus:text-red-600'
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
