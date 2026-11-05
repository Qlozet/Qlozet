import { useState, FC, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  FilterMenu,
  type FilterOption,
} from '@/pattern/common/molecules/filter-menu';
import { MoreHorizontal } from 'lucide-react';
import { remove, show } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMemberDetailsModal } from '@/pattern/settings/organisms/team-member-details-modal';
import { DeleteProductConfirmationModal as ConfirmModal } from '@/pattern/common/organisms/delete-confirmation-modal';
import {
  useDeleteTeamMemberMutation,
  useGetTeamMembersQuery,
  useGetVendorRolesQuery,
  useResendTeamInviteMutation,
  useUpdateTeamMemberMutation,
  type TeamMember,
} from '@/redux/services/users/users.api-slice';
import { readApiError } from '@/redux/services/types';

import { prettyRole } from '@/pattern/settings/lib/team-roles';

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

  // A new search or filter starts from the first page; staying on page 3 of
  // a list that now has one page shows nothing.
  const onSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);
  const onRoleFilterChange = useCallback((value: string) => {
    setRoleFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const {
    data: response,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetTeamMembersQuery();
  // Memoized on the response, not rebuilt inline: a team member without the
  // owner role gets a 403 here, which leaves `response` undefined, and a fresh
  // `[]` on every render used to drive the table into an endless re-render.
  const members = useMemo(() => response?.data ?? [], [response]);

  const [updateMember] = useUpdateTeamMemberMutation();
  const [resendInvite] = useResendTeamInviteMutation();
  const [deleteMember] = useDeleteTeamMemberMutation();

  const onResendInvite = useCallback(
    async (member: { _id: string; emailAddress: string }) => {
      try {
        await resendInvite(member._id).unwrap();
        toast.success(`New invite sent to ${member.emailAddress}`);
      } catch (error: any) {
        toast.error(readApiError(error, 'Failed to resend the invite'));
      }
    },
    [resendInvite]
  );

  // Deactivate keeps them on the team with access turned off (reversible);
  // Remove takes them off the team. Both ask first; reactivating doesn't.
  const onToggleActive = useCallback(
    async (member: { _id: string; is_active: boolean; name: string }) => {
      const next = !member.is_active;
      if (!next) {
        // Resolves on confirm only; closing the dialog leaves it pending.
        await show(ConfirmModal, {
          title: `Deactivate ${member.name || 'this member'}?`,
          description:
            'They lose access to this store straight away, but stay on the team. You can reactivate them at any time.',
          actionText: 'Deactivate',
        });
        remove(ConfirmModal);
      }
      try {
        await updateMember({
          id: member._id,
          data: { is_active: next },
        }).unwrap();
        toast.success(
          next ? `${member.name} reactivated` : `${member.name} deactivated`
        );
      } catch (error: any) {
        toast.error(readApiError(error, 'Failed to update team member'));
      }
    },
    [updateMember]
  );

  const onRemove = useCallback(
    async (member: { _id: string; name: string }) => {
      const name = member.name || 'this member';
      await show(ConfirmModal, {
        title: `Remove ${name} from the team?`,
        description:
          'They lose access to this store straight away. You can invite them again later.',
        actionText: 'Remove',
      });
      remove(ConfirmModal);
      try {
        const res = await deleteMember(member._id).unwrap();
        toast.success(res?.message || `${name} was removed from the team`);
      } catch (error: any) {
        toast.error(readApiError(error, 'Failed to remove team member'));
      }
    },
    [deleteMember]
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
        // Inactive: the owner turned their access off. Invited: they haven't
        // signed in and set their own password yet.
        status:
          m.is_active === false
            ? 'Inactive'
            : !m.is_owner && m.user?.must_change_password
              ? 'Invited'
              : 'Active',
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
          <div className="flex items-center gap-2">
            {row.original.name}
            {row.original.is_owner && (
              <span className="text-[10px] font-medium bg-primary/10 text-primary dark:bg-white/10 dark:text-white px-1.5 py-0.5 rounded">
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
            Invited: 'bg-[#FFF8E1] text-[#F59E0B]',
            Inactive: 'bg-[#FFF0F0] text-[#E02B2B]',
          };
          return (
            <div className="flex items-center">
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
            <div className="relative flex w-full items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 cursor-pointer p-0"
                    aria-label="Team member actions"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => show(TeamMemberDetailsModal, { member })}
                  >
                    {member.is_owner ? 'View details' : 'Edit user'}
                  </DropdownMenuItem>

                  {!member.is_owner && (
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => onToggleActive(member)}
                    >
                      {member.is_active ? 'Deactivate user' : 'Reactivate user'}
                    </DropdownMenuItem>
                  )}
                  {member.status === 'Invited' && (
                    <DropdownMenuItem onClick={() => onResendInvite(member)}>
                      Resend invite
                    </DropdownMenuItem>
                  )}
                  {!member.is_owner && (
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => onRemove(member)}
                    >
                      Remove
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onToggleActive, onResendInvite, onRemove]
  );

  return (
    <div className="bg-card w-full rounded-xl border custom-card-shadow">
      <TableToolbar
        title="Roles & Permissions"
        search={searchValue}
        onSearchChange={onSearchChange}
        filterControl={
          <FilterMenu
            options={roleOptions}
            value={roleFilter}
            onChange={onRoleFilterChange}
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
        emptyMessage="Team members will show up here once you add them."
      />
    </div>
  );
};

export default UserAndPermissionTable;
