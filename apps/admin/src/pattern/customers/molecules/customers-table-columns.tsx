'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerName,
  getCustomerHandle,
  getCustomerEmail,
  getCustomerPhone,
  getCustomerAvatar,
  getCustomerInitial,
  getCustomerStatus,
  getCustomerTotalOrders,
  getCustomerLastOrderDate,
  formatCount,
  formatDate,
  type CustomerStatusVariant,
} from '@/lib/customers';

// Map the customer status to the shared Badge variants.
const STATUS_BADGE_VARIANT: Record<CustomerStatusVariant, 'success' | 'error'> =
  {
    active: 'success',
    inactive: 'error',
  };

const CustomerAvatar = ({ customer }: { customer: Customer }) => {
  const avatar = getCustomerAvatar(customer);
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={getCustomerName(customer)}
        className="size-9 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {getCustomerInitial(customer)}
    </span>
  );
};

interface CustomersTableColumnsProps {
  onViewDetails: (customerId: string) => void;
}

export const createCustomersTableColumns = ({
  onViewDetails,
}: CustomersTableColumnsProps): ColumnDef<Customer>[] => [
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
      <span className="text-sm font-medium text-gray-900">
        {getCustomerHandle(row.original) || getCustomerName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'email',
    header: 'Email address',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {getCustomerEmail(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'phone',
    header: 'Phone number',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {getCustomerPhone(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'totalOrders',
    header: 'Total orders',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {formatCount(getCustomerTotalOrders(row.original))}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'lastOrderDate',
    header: 'Last Order date',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {formatDate(getCustomerLastOrderDate(row.original))}
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
          shape="square"
          className="h-[26px] flex w-fit items-center justify-center px-3 text-xs font-normal"
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
        type="button"
        variant="outline"
        onClick={() => onViewDetails(row.original._id)}
        className="h-9 rounded-lg text-sm font-normal text-gray-700"
      >
        View details
      </Button>
    ),
    enableSorting: false,
  },
];
