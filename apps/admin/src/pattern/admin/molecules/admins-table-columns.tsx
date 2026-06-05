'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TeamMember } from '@/redux/services/users/users.api-slice';
import {
  getAdminName,
  getAdminEmail,
  getAdminPhone,
  getAdminRole,
  getAdminStatus,
  getAdminInitial,
  formatRegisteredDate,
  type AdminStatusVariant,
} from '@/lib/admins';

// Map the admin status to the shared Badge variants (mirrors the vendors table).
const STATUS_BADGE_VARIANT: Record<AdminStatusVariant, 'success' | 'error'> = {
  active: 'success',
  inactive: 'error',
};

interface AdminsTableColumnsProps {
  onEdit: (member: TeamMember) => void;
  onDeactivate: (member: TeamMember) => void;
}

export const createAdminsTableColumns = ({
  onEdit,
  onDeactivate,
}: AdminsTableColumnsProps): ColumnDef<TeamMember>[] => [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className='flex items-center gap-3'>
          <span className='flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
            {getAdminInitial(member)}
          </span>
          <span className='text-sm font-medium text-gray-900'>
            {getAdminName(member)}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'email',
    header: 'Email address',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>{getAdminEmail(row.original)}</div>
    ),
    enableSorting: false,
  },
  {
    id: 'phone',
    header: 'Phone number',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>{getAdminPhone(row.original)}</div>
    ),
    enableSorting: false,
  },
  {
    id: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>{getAdminRole(row.original)}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date registered',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>
        {formatRegisteredDate(row.original.createdAt as string | undefined)}
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
      const member = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-44'>
            <DropdownMenuItem onClick={() => onEdit(member)}>
              <Pencil className='size-4' /> Edit admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeactivate(member)}>
              <UserX className='size-4' /> Deactivate admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
