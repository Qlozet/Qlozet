'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { Layers, PackagePlus, Plus, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import NiceModal from '@ebay/nice-modal-react';
import { ConfirmActionModal } from '@/pattern/common/organisms/confirm-action-modal';
import { APP_ROUTES } from '@/lib/routes';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  useGetAdminStylesQuery,
  useDeactivatePlatformStyleMutation,
  useUpdatePlatformStyleMutation,
  useRegenerateStyleImagesMutation,
  useSeedPlatformStylesMutation,
  type PlatformStyle,
  type StyleScope,
} from '@/redux/services/style-library/style-library.api-slice';
import { createStylesColumns } from '../molecules/styles-columns';
import { StyleFormSheet } from '../organisms/style-form-sheet';
import { CATEGORY_LABELS } from '../lib/style-options';

const PAGE_SIZE = 10;

export default function StylesTableTemplate() {
  const router = useRouter();
  const [scope, setScope] = useState<StyleScope>('platform');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformStyle | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetAdminStylesQuery({ scope, include_inactive: includeInactive });
  const [deactivateStyle] = useDeactivatePlatformStyleMutation();
  const [updateStyle] = useUpdatePlatformStyleMutation();
  const [regenerateImages, { isLoading: regenerating }] =
    useRegenerateStyleImagesMutation();
  const [seedStyles, { isLoading: seeding }] = useSeedPlatformStylesMutation();

  const all: PlatformStyle[] = useMemo(() => data?.styles ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.style_code.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[s.category] ?? '').toLowerCase().includes(q)
    );
  }, [all, search]);

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
      createStylesColumns({
        onEdit: (s) => {
          setEditing(s);
          setFormOpen(true);
        },
        onToggleActive: async (s) => {
          try {
            if (s.is_active) {
              await deactivateStyle(s._id).unwrap();
              toast.success('Style deactivated');
            } else {
              await updateStyle({
                id: s._id,
                data: { is_active: true },
              }).unwrap();
              toast.success('Style reactivated');
            }
          } catch {
            toast.error('Could not update the style.');
          }
        },
      }),
    [deactivateStyle, updateStyle]
  );

  // Qlozet's starter list (men's agbada and kaftan looks, dress shapes,
  // collars, sleeves, trousers…) lives with the backend. Only styles the
  // library is missing are added; ones already there, edited or not, stay.
  const addStarterStyles = () =>
    NiceModal.show(ConfirmActionModal, {
      title: 'Add the starter styles?',
      description:
        'Adds any of Qlozet’s starter styles that the platform library doesn’t have yet, and draws a picture for each in the background (one AI image per new style). Styles already in the library are left exactly as they are.',
      confirmLabel: 'Add starter styles',
      onConfirm: async () => {
        try {
          const res = await seedStyles().unwrap();
          if (!res.created) {
            toast.success('The library already has every starter style.');
            return;
          }
          toast.success(
            `${res.created} style${res.created === 1 ? '' : 's'} added`,
            {
              description:
                'Pictures are being drawn now. Refresh in a few minutes to see them.',
            }
          );
        } catch (err: any) {
          toast.error('Could not add the starter styles.', {
            description: err?.data?.message,
          });
          throw err;
        }
      },
    });

  const backfillImages = async () => {
    try {
      await regenerateImages().unwrap();
      toast.success('Image backfill started for styles missing images.');
    } catch {
      toast.error('Could not start the image backfill.');
    }
  };

  return (
    <>
      <DataTable<PlatformStyle>
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
        emptyMessage="No styles yet. Add your first platform style."
        toolbar={
          <TableToolbar
            title="Styles"
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            showExport={false}
            rightExtra={
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={scope}
                  onChange={(e) => {
                    setScope(e.target.value as StyleScope);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                  }}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="platform">Platform styles</option>
                  <option value="vendor">Vendor styles</option>
                  <option value="all">All styles</option>
                </select>
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                  />
                  Inactive
                </label>
                <button
                  type="button"
                  onClick={backfillImages}
                  disabled={regenerating}
                  title="Generate images for styles missing one"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Wand2 className="size-4" />
                  {regenerating ? 'Backfilling…' : 'Backfill images'}
                </button>
                <button
                  type="button"
                  onClick={addStarterStyles}
                  disabled={seeding}
                  title="Add Qlozet's starter styles the library is missing"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <PackagePlus className="size-4" />
                  {seeding ? 'Adding…' : 'Add starter styles'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(APP_ROUTES.productsStylesBulk)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Layers className="size-4" />
                  Bulk add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="size-4" />
                  Add Style
                </button>
              </div>
            }
          />
        }
      />

      <StyleFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        style={editing}
      />
    </>
  );
}
