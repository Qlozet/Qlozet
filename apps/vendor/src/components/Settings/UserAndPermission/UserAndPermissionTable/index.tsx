import { useState, FC, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { FilterMenu, type FilterOption } from '@/pattern/common/molecules/filter-menu';
import { MoreHorizontal } from 'lucide-react';
import { show } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
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
  useUpdateTeamMemberMutation,
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
  roleId?: string;
  status: string;
  is_active: boolean;
  is_owner: boolean;
}

const UserAndPermissionTable: FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const { data: response, isLoading, isFetching, isSuccess, isError, error } = useGetTeamMembersQuery();
  const members = response?.data ?? [];

  const [updateMember] = useUpdateTeamMemberMutation();

  // Soft-disable rather than DELETE — the hard delete is destructive and there
  // is no undo, so the menu offers deactivate/reactivate.
  const onToggleActive = useCallback(
    async (member: { _id: string; is_active: boolean; name: string }) => {
      const next = !member.is_active;
      try {
        await updateMember({
          id: member._id,
          data: { is_active: next },
        }).unwrap();
        toast.success(
          next ? `${member.name} reactivated` : `${member.name} deactivated`
        );
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to update team member');
      }
    },
    [updateMember]
  );

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
        roleId: m.role?._id,
        // `is_active` now persists server-side, so a disabled member is
        // distinct from one who simply hasn't accepted their invite.
        status:
          m.is_active === false
            ? 'Inactive'
            : m.accepted
              ? 'Active'
              : 'Pending',
        is_active: m.is_active !== false,
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
        // The owner is guarded server-side (can't be edited or removed), so
        // only "View details" is offered for that row.
        cell: ({ row }) => {
          const member = row.original;
          return (
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
                      show(TeamMemberDetailsModal, { member })
                    }
                  >
                    {member.is_owner ? 'View details' : 'Edit user'}
                  </DropdownMenuItem>

                  {!member.is_owner && (
                    <DropdownMenuItem
                      className='cursor-pointer text-red-600 focus:text-red-600'
                      onClick={() => onToggleActive(member)}
                    >
                      {member.is_active ? 'Deactivate user' : 'Reactivate user'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onToggleActive]
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
