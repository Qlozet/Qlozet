import { useState, FC, useMemo } from 'react';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import SearchInput from '@/components/SearchInput';
import DropDownComponent from '@/components/DropDownComponent';
import Typography from '@/components/Typography';
import threeDotIcon from '@/public/assets/svg/three-dot.svg';
import exportIcon from '@/public/assets/svg/Content.svg';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserData {
  name: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  status: string;
  address: string;
}

const UserAndPermissionTable: FC<{ handleEdit: (item?: unknown) => void }> = ({ handleEdit }) => {
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const rawData: UserData[] = useMemo(() => [
    {
      name: 'Shola James',
      emailAddress: 'shola@mail.com',
      phoneNumber: '+234 8123456789',
      role: 'Super admin',
      status: 'Active',
      address: '14, Jones street, Lagos Nigeria',
    },
    {
      name: 'Esther Oke',
      emailAddress: 'oke@mail.com',
      phoneNumber: '+234 8123456789',
      role: 'Marketing',
      status: 'Active',
      address: '14, Jones street, Lagos Nigeria',
    },
    {
      name: 'Fola James',
      emailAddress: 'fola@mail.com',
      phoneNumber: '+234 8123456789',
      role: 'Customer service',
      status: 'Inactive',
      address: '14, Jones street, Lagos Nigeria',
    },
    {
      name: 'Fola James',
      emailAddress: 'fola2@mail.com',
      phoneNumber: '+234 8123456789',
      role: 'Operations',
      status: 'Active',
      address: '14, Jones street, Lagos Nigeria',
    },
    {
      name: 'Fola James',
      emailAddress: 'fola3@mail.com',
      phoneNumber: '+234 8123456789',
      role: 'Sales',
      status: 'Active',
      address: '14, Jones street, Lagos Nigeria',
    },
    {
      name: 'Fola James',
      emailAddress: 'fola4@mail.com',
      phoneNumber: '+234 8123456789',
      role: 'Data analyst',
      status: 'Active',
      address: '14, Jones street, Lagos Nigeria',
    },
  ], []);

  const data = useMemo(() => {
    return rawData.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.emailAddress.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.role.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
      
      return matchesSearch && matchesRole;
    });
  }, [rawData, searchValue, roleFilter]);

  const columns: ColumnDef<UserData>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div>{row.original.name}</div>,
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
        const isActive = row.original.status === 'Active';
        return (
          <div className="flex items-center">
            <span
              className={`px-3 py-1 rounded-[4px] text-xs font-medium ${
                isActive
                  ? 'bg-[#EAFFF2] text-[#00A843]'
                  : 'bg-[#FFF0F0] text-[#E02B2B]'
              }`}
            >
              {row.original.status}
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
  ], [handleEdit]);

  const toolbar = (
    <div className='flex items-center justify-between p-6 border-b border-gray-100 bg-white rounded-t-xl'>
      <div className='text-lg font-semibold text-gray-900'>Roles & Permissions</div>
      
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Filter By :</span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className='w-[140px] bg-white'>
              <SelectValue placeholder='Select role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All roles</SelectItem>
              <SelectItem value='super admin'>Super admin</SelectItem>
              <SelectItem value='marketing'>Marketing</SelectItem>
              <SelectItem value='customer service'>Customer service</SelectItem>
              <SelectItem value='operations'>Operations</SelectItem>
              <SelectItem value='sales'>Sales</SelectItem>
              <SelectItem value='data analyst'>Data analyst</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='w-[240px]'>
          <SearchInput placeholder='Search' value={searchValue} setValue={setSearchValue} />
        </div>

        <Button className='bg-[#492F1D] hover:bg-[#3a2517] text-white flex items-center gap-2 h-10 px-4 rounded-lg'>
          <Image src={exportIcon} alt='export' className='w-4 h-4 brightness-0 invert' />
          Export
        </Button>
      </div>
    </div>
  );

  return (
    <div className='w-full'>
      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        setPagination={setPagination}
        toolbar={toolbar}
      />
    </div>
  );
};

const ActionMenu: FC<{ handleEdit: () => void }> = ({ handleEdit }) => {
  const [showDropDown, setShowDropDown] = useState(false);

  const selectDropDownHandler = (option: string) => {
    if (option === 'Edit user') {
      handleEdit();
    }
    setShowDropDown(false);
  };

  return (
    <div className='relative'>
      <div
        className='cursor-pointer flex items-center justify-center p-2 rounded-md hover:bg-gray-100'
        onClick={() => setShowDropDown(!showDropDown)}
      >
        <Image src={threeDotIcon} alt='more' />
      </div>
      {showDropDown && (
        <div className='absolute top-8 right-0 z-50'>
          <DropDownComponent
            dropdownTitle='Menu'
            width='w-[15rem]'
            data={['Edit user', 'Deactivate user']}
            clickHandler={selectDropDownHandler}
          />
        </div>
      )}
    </div>
  );
};

export default UserAndPermissionTable;
