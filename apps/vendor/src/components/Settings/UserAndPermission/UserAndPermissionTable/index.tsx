import { useState, FC, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { FilterMenu, type FilterOption } from '@/pattern/common/molecules/filter-menu';
import { MoreHorizontal } from 'lucide-react';
import { show } from '@ebay/nice-modal-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMemberDetailsModal } from '@/pattern/settings/organisms/team-member-details-modal';
import {
  useGetTeamMembersQuery,
  useGetVendorRolesQuery,
  type TeamMember,
} from '@/redux/services/users/users.api-slice';

// "customer_support" -> "Customer Support"
const prettyRole = (name?: string): string =>
  (name ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

interface UserData {
  _id: string;
  name: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  status: string;
  is_owner: boolean;
}

const UserAndPermissionTable: FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const { data: response, isLoading, isFetching, isSuccess, isError, error } = useGetTeamMembersQuery();
  const members = response?.data ?? [];

  // Filter options come from the roles endpoint — a hardcoded list drifts from
  // whatever roles the business actually has.
  const { data: rolesResponse } = useGetVendorRolesQuery();
  const roleOptions: FilterOption[] = useMemo(
    () => [
      { value: 'all', label: 'All roles' },
      ...(rolesResponse?.data ?? []).map((role) => ({
        value: (role.name ?? '').toLowerCase().replace(/_/g, ' '),
        label: prettyRole(role.name),
      })),
    ],
    [rolesResponse]
  );

  // Map API response to table format
  const rawData: UserData[] = useMemo(
    () =>
      members.map((m: TeamMember) => ({
        _id: m._id,
        name: m.full_name ?? '',
        emailAddress: m.email ?? '',
        phoneNumber: m.phone_number ?? '—',
        role: m.role?.name ? prettyRole(m.role.name) : '—',
        status: m.accepted ? 'Active' : 'Pending',
        is_owner: m.is_owner ?? false,
      })),
    [members]
  );

  const data = useMemo(() => {
    return rawData.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.emailAddress.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.role.toLowerCase().includes(searchValue.toLowerCase());

      const matchesRole =
        roleFilter === 'all' ||
        user.role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [rawData, searchValue, roleFilter]);

  const columns: ColumnDef<UserData>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {row.original.name}
            {row.original.is_owner && (
              <span className='text-[10px] font-medium bg-primary/10 text-primary dark:bg-white/10 dark:text-white px-1.5 py-0.5 rounded'>
                Owner
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'emailAddress',
        header: 'Email address',
        cell: ({ row }) => <div>{row.original.emailAddress}</div>,
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone number',
        cell: ({ row }) => <div>{row.original.phoneNumber}</div>,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => <div>{row.original.role}</div>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const colorMap: Record<string, string> = {
            Active: 'bg-[#EAFFF2] text-[#00A843]',
            Pending: 'bg-[#FFF8E1] text-[#F59E0B]',
            Inactive: 'bg-[#FFF0F0] text-[#E02B2B]',
          };
          return (
            <div className='flex items-center'>
              <span
                className={`px-3 py-1 rounded-[4px] text-xs font-medium ${colorMap[status] ?? ''}`}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        // View only. The backend exposes just GET /users/team/members and
        // POST /users/team/invite-member — nothing to update, deactivate or
        // remove a member with, so no such actions are offered.
        // TODO(api): add Edit / Deactivate once those endpoints exist.
        cell: ({ row }) => (
          <div className='relative flex w-full items-center justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 cursor-pointer p-0'
                  aria-label='Team member actions'
                >
                  <MoreHorizontal className='h-4 w-4 text-gray-500' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={() =>
                    show(TeamMemberDetailsModal, { member: row.original })
                  }
                >
                  View details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className='bg-card w-full rounded-[10px] shadow-md'>
      <TableToolbar
        title='Roles & Permissions'
        search={searchValue}
        onSearchChange={setSearchValue}
        filterControl={
          <FilterMenu
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        }
      />
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        pagination={pagination}
        setPagination={setPagination}
        emptyMessage='Team members will show up here once you add them.'
      />
    </div>
  );
};

export default UserAndPermissionTable;
