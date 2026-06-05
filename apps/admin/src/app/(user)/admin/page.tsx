'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import NiceModal from '@ebay/nice-modal-react';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/routes';
import { AddAdminModal } from '@/pattern/admin/organisms/add-admin-modal';
import { AdminsTable } from '@/pattern/admin/organisms/admins-table';
import { useGetTeamMembersQuery } from '@/redux/services/users/users.api-slice';

const PAGE_SIZE = 7;

const AdminPage = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetTeamMembersQuery();

  const members = useMemo(() => data?.data ?? [], [data]);

  // The team-members endpoint returns the full list, so paginate client-side.
  const totalCount = members.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);
  const pageData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return members.slice(start, start + pagination.pageSize);
  }, [members, pagination.pageIndex, pagination.pageSize]);

  const showAddAdmin = () => NiceModal.show(AddAdminModal);
  const goToManageRoles = () => router.push(APP_ROUTES.adminManageRoles);

  return (
    <div className='w-full min-h-screen h-fit space-y-6 pb-10'>
      {/* Header */}
      <div className='flex items-center justify-between gap-4'>
        <h1 className='text-xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white'>
          Administrators
        </h1>

        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={goToManageRoles}>
            <KeyRound className='size-4' />
            Manage Roles
          </Button>
          <Button onClick={showAddAdmin}>Add Admin</Button>
        </div>
      </div>

      {/* Administrators table */}
      <AdminsTable
        data={pageData}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
      />
    </div>
  );
};

export default AdminPage;
