'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { RowActionsMenu } from '@/pattern/common/molecules/row-actions-menu';
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
  onCopyEmail: (email: string) => void;
  onViewOrders: (customerId: string) => void;
  onSetStatus: (customer: Customer, status: 'active' | 'suspended') => void;
  onDelete: (customer: Customer) => void;
  /** Disables the state-changing items while a mutation is in flight. */
  isUpdating?: boolean;
}

export const createCustomersTableColumns = ({
  onViewDetails,
  onCopyEmail,
  onViewOrders,
  onSetStatus,
  onDelete,
  isUpdating,
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
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {getCustomerHandle(row.original) || getCustomerName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'email',
    header: 'Email address',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {getCustomerEmail(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'phone',
    header: 'Phone number',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {getCustomerPhone(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'totalOrders',
    header: 'Total orders',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatCount(getCustomerTotalOrders(row.original))}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'lastOrderDate',
    header: 'Last Order date',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
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
    cell: ({ row }) => {
      const customer = row.original;
      const email = getCustomerEmail(customer);
      const isSuspended = getCustomerStatus(customer).variant === 'inactive';

      return (
        <RowActionsMenu
          title="Customer actions"
          triggerLabel={`Actions for ${getCustomerName(customer)}`}
          actions={[
            {
              label: 'View details',
              onSelect: () => onViewDetails(customer._id),
            },
            {
              label: 'Copy email',
              // Disabled rather than hidden, so the menu keeps a stable shape
              // from row to row.
              disabled: email === '—',
              onSelect: () => onCopyEmail(email),
            },
            {
              label: 'View orders',
              onSelect: () => onViewOrders(customer._id),
            },
            // One item, not both: offering "Suspend" on an already-suspended
            // account is a no-op the admin has to reason about.
            isSuspended
              ? {
                  label: 'Reactivate',
                  disabled: isUpdating,
                  onSelect: () => onSetStatus(customer, 'active'),
                }
              : {
                  label: 'Suspend',
                  disabled: isUpdating,
                  onSelect: () => onSetStatus(customer, 'suspended'),
                },
            {
              label: 'Delete',
              destructive: true,
              disabled: isUpdating,
              onSelect: () => onDelete(customer),
            },
          ]}
        />
      );
    },
    enableSorting: false,
  },
];
