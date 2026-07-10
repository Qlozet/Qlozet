import { useState, FC, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetTeamMembersQuery,
  type TeamMember,
} from '@/redux/services/users/users.api-slice';

interface UserData {
  _id: string;
  name: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  status: string;
  is_owner: boolean;
}

const UserAndPermissionTable: FC<{ handleEdit: (item?: unknown) => void }> = ({
  handleEdit,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const { data: response, isLoading, isFetching, isSuccess, isError, error } = useGetTeamMembersQuery();
  const members = response?.data ?? [];

  // Map API response to table format
  const rawData: UserData[] = useMemo(
    () =>
      members.map((m: TeamMember) => ({
        _id: m._id,
        name: m.full_name ?? '',
        emailAddress: m.email ?? '',
        phoneNumber: m.phone_number ?? '—',
        role:
          m.role?.name
            ?.replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Unknown',
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
        cell: ({ row }) => {
          return (
            <div className='relative flex items-center justify-end w-full'>
              <ActionMenu handleEdit={() => handleEdit(row.original)} />
            </div>
          );
        },
      },
    ],
    [handleEdit]
  );

  return (
    <div className='bg-card w-full rounded-[10px] shadow-md'>
      <TableToolbar
        title='Roles & Permissions'
        search={searchValue}
        onSearchChange={setSearchValue}
        filterControl={
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-700 dark:text-muted-foreground whitespace-nowrap'>
              Filter By :
            </span>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All roles</SelectItem>
                <SelectItem value='owner'>Owner</SelectItem>
                <SelectItem value='operations'>Operations</SelectItem>
                <SelectItem value='marketing'>Marketing</SelectItem>
                <SelectItem value='customer support'>Customer Support</SelectItem>
                <SelectItem value='tailor'>Tailor</SelectItem>
                <SelectItem value='sales'>Sales</SelectItem>
                <SelectItem value='data analyst'>Data Analyst</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

const ActionMenu: FC<{ handleEdit: () => void }> = ({ handleEdit }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4 text-gray-500' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleEdit}>Edit user</DropdownMenuItem>
        <DropdownMenuItem className='text-red-600 focus:text-red-600'>
          Deactivate user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAndPermissionTable;
