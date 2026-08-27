'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PlatformAdmin } from '@/redux/services/users/users.api-slice';
import {
  getAdminName,
  getAdminEmail,
  getAdminPhone,
  getAdminRole,
  getAdminStatus,
  isAdminActive,
  formatRegisteredDate,
  type AdminStatusVariant,
} from '@/lib/admins';

// Map the admin status to the shared Badge variants (mirrors the vendors table).
const STATUS_BADGE_VARIANT: Record<AdminStatusVariant, 'success' | 'error'> = {
  active: 'success',
  inactive: 'error',
};

interface AdminsTableColumnsProps {
  onEdit: (admin: PlatformAdmin) => void;
  /** Deactivate an active admin, or reactivate a deactivated one. */
  onToggleStatus: (admin: PlatformAdmin) => void;
  /** The signed-in admin's id — they cannot deactivate themselves. */
  currentUserId?: string;
}

export const createAdminsTableColumns = ({
  onEdit,
  onToggleStatus,
  currentUserId,
}: AdminsTableColumnsProps): ColumnDef<PlatformAdmin>[] => [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        {getAdminName(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'email',
    header: 'Email address',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {getAdminEmail(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'phone',
    header: 'Phone number',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {getAdminPhone(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {getAdminRole(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date registered',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatRegisteredDate(row.original.createdAt)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getAdminStatus(row.original);
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
      const admin = row.original;
      const active = isAdminActive(admin);
      // Deactivating yourself locks you out of the console you are standing in,
      // so the API refuses it — don't offer it either.
      const isSelf = Boolean(currentUserId && admin._id === currentUserId);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(admin)}>
              Edit admin
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isSelf}
              onClick={() => onToggleStatus(admin)}
              className={active ? 'text-destructive' : undefined}
            >
              {active ? 'Deactivate admin' : 'Activate admin'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
