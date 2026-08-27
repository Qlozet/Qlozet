'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import NiceModal from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { getAdminName, isAdminActive } from '@/lib/admins';
import { AdminFormModal } from '@/pattern/admin/organisms/admin-form-modal';
import { AdminsTable } from '@/pattern/admin/organisms/admins-table';
import { ConfirmActionModal } from '@/pattern/common/organisms/confirm-action-modal';
import { PageActions } from '@/pattern/common/molecules/page-actions';
import {
  useGetAdminsQuery,
  useGetCurrentUserQuery,
  useSetAdminStatusMutation,
  type PlatformAdmin,
} from '@/redux/services/users/users.api-slice';
import {
  readApiError,
  readPageCount,
  readTotalItems,
} from '@/redux/services/types';

const PAGE_SIZE = 7;

const AdminPage = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetAdminsQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
    });

  const { data: currentUserData } = useGetCurrentUserQuery();
  const currentUserId = currentUserData?.data?._id;

  const [setAdminStatus] = useSetAdminStatusMutation();

  const paginated = data?.data;
  const admins = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount = readTotalItems(paginated);
  const pageCount = readPageCount(paginated, pagination.pageSize);

  const showAddAdmin = () => NiceModal.show(AdminFormModal);

  const showEditAdmin = useCallback(
    (admin: PlatformAdmin) => NiceModal.show(AdminFormModal, { admin }),
    []
  );

  // Deactivating is what actually locks someone out of the console — sign-in
  // requires status 'active' — so it gets a confirmation, and reactivating goes
  // through the same dialog for symmetry.
  const confirmToggleStatus = useCallback(
    (admin: PlatformAdmin) => {
      const active = isAdminActive(admin);
      const name = getAdminName(admin);

      NiceModal.show(ConfirmActionModal, {
        title: active ? `Deactivate ${name}?` : `Reactivate ${name}?`,
        description: active
          ? 'They will be signed out of the console and will not be able to sign back in until they are reactivated.'
          : 'They will be able to sign in to the console again with their existing password.',
        confirmLabel: active ? 'Deactivate admin' : 'Reactivate admin',
        destructive: active,
        onConfirm: async () => {
          try {
            await setAdminStatus({
              id: admin._id,
              status: active ? 'inactive' : 'active',
            }).unwrap();
            toast.success(active ? 'Admin deactivated' : 'Admin reactivated');
          } catch (err) {
            // e.g. "Deactivating the last active super admin would lock
            // everyone out of the console."
            toast.error(readApiError(err));
            throw err;
          }
        },
      });
    },
    [setAdminStatus]
  );

  const goToManageRoles = () => router.push(APP_ROUTES.adminManageRoles);

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white">
          Administrators
        </h1>

        {/* Below lg these collapse behind one trigger — two buttons beside the
            heading do not fit a phone. */}
        <PageActions
          label="Administrator actions"
          actions={[
            {
              label: 'Manage Roles',
              icon: <KeyRound className="size-4" />,
              variant: 'outline',
              onSelect: goToManageRoles,
            },
            { label: 'Add Admin', onSelect: showAddAdmin },
          ]}
        />
      </div>

      {/* Administrators table */}
      <AdminsTable
        data={admins}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        totalRows={totalCount}
        currentUserId={currentUserId}
        onEdit={showEditAdmin}
        onToggleStatus={confirmToggleStatus}
      />
    </div>
  );
};

export default AdminPage;
