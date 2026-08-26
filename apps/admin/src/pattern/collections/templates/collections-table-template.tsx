'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  useGetPlatformCollectionsAdminQuery,
  useDeletePlatformCollectionMutation,
  useUpdatePlatformCollectionMutation,
  type Collection,
} from '@/redux/services/collections/collections.api-slice';
import { createCollectionsColumns } from '../molecules/collections-columns';
import { formatCondition } from '../lib/collection-condition-options';

const PAGE_SIZE = 10;

export default function CollectionsTableTemplate() {
  const router = useRouter();
  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetPlatformCollectionsAdminQuery();
  const [deleteCollection] = useDeletePlatformCollectionMutation();
  const [updateCollection] = useUpdatePlatformCollectionMutation();

  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const allCollections: Collection[] = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCollections;
    return allCollections.filter((c) => {
      const inTitle = (c.title ?? '').toLowerCase().includes(q);
      const inConds = (c.conditions ?? []).some((cond) =>
        formatCondition(cond).toLowerCase().includes(q)
      );
      return inTitle || inConds;
    });
  }, [allCollections, search]);

  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / pagination.pageSize)
  );
  const pageData = useMemo(
    () =>
      filtered.slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize
      ),
    [filtered, pagination]
  );

  const columns = useMemo(
    () =>
      createCollectionsColumns({
        onEdit: (id) =>
          router.push(`${APP_ROUTES.productsCollectionsCreate}?edit=${id}`),
        onToggleActive: async (c) => {
          try {
            await updateCollection({
              id: c._id,
              is_active: !c.is_active,
            }).unwrap();
            toast.success(
              c.is_active ? 'Collection deactivated' : 'Collection activated'
            );
          } catch {
            toast.error('Could not update the collection.');
          }
        },
        onDelete: async (c) => {
          if (
            !window.confirm(
              `Delete "${c.title ?? 'this collection'}"? This can't be undone.`
            )
          )
            return;
          try {
            await deleteCollection(c._id).unwrap();
            toast.success('Collection deleted');
          } catch {
            toast.error('Could not delete the collection.');
          }
        },
      }),
    [router, updateCollection, deleteCollection]
  );

  return (
    <DataTable<Collection>
      columns={columns}
      data={pageData}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      emptyMessage="No collections yet. Create your first platform collection."
      toolbar={
        <TableToolbar
          title="Collections"
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          showExport={false}
          rightExtra={
            <button
              type="button"
              onClick={() => router.push(APP_ROUTES.productsCollectionsCreate)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              Create Collection
            </button>
          }
        />
      }
    />
  );
}
