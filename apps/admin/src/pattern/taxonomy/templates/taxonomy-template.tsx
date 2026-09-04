'use client';

import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { Plus, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  useGetTaxonomyOverviewQuery,
  useUpdateTaxonomyCategoryMutation,
  useDeleteTaxonomyCategoryMutation,
  useUpdateTaxonomyTagMutation,
  useDeleteTaxonomyTagMutation,
  useSeedTaxonomyMutation,
  type SystemCategory,
  type SystemTag,
} from '@/redux/services/taxonomy/taxonomy.api-slice';
import {
  createCategoryColumns,
  createTagColumns,
} from '../molecules/taxonomy-columns';
import { CategoryFormSheet } from '../organisms/category-form-sheet';
import { TagFormSheet } from '../organisms/tag-form-sheet';
import { KIND_OPTIONS } from '../lib/taxonomy-options';

const PAGE_SIZE = 10;

export default function TaxonomyTemplate() {
  const [tab, setTab] = useState<'categories' | 'tags'>('categories');
  const [kindFilter, setKindFilter] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SystemCategory | null>(
    null
  );
  const [tagFormOpen, setTagFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<SystemTag | null>(null);

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetTaxonomyOverviewQuery();
  const [updateCategory] = useUpdateTaxonomyCategoryMutation();
  const [deleteCategory] = useDeleteTaxonomyCategoryMutation();
  const [updateTag] = useUpdateTaxonomyTagMutation();
  const [deleteTag] = useDeleteTaxonomyTagMutation();
  const [seedTaxonomy, { isLoading: seeding }] = useSeedTaxonomyMutation();

  // Usage lookups — products reference taxonomy by name, so counts key on
  // (kind, product_type) and on tag slug.
  const typeUsage = useMemo(() => {
    const m = new Map<string, number>();
    for (const u of data?.type_usage ?? []) {
      m.set(`${u.kind}|${u.product_type}`, u.count);
    }
    return m;
  }, [data]);

  const tagUsage = useMemo(() => {
    const m = new Map<string, number>();
    for (const u of data?.tag_usage ?? []) m.set(u.slug, u.count);
    return m;
  }, [data]);

  const categoryUsageOf = (c: SystemCategory) =>
    typeUsage.get(`${c.kind}|${c.product_type}`) ?? 0;
  const tagUsageOf = (t: SystemTag) => tagUsage.get(t.slug) ?? 0;

  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  // ── Filtered rows for the active tab ──
  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.categories ?? []).filter(
      (c) =>
        (includeInactive || c.is_active) &&
        (!kindFilter || c.kind === kindFilter) &&
        (!q ||
          c.product_type.toLowerCase().includes(q) ||
          c.categories.some((s) => s.toLowerCase().includes(q)) ||
          c.attributes.some((a) => a.toLowerCase().includes(q)))
    );
  }, [data, search, kindFilter, includeInactive]);

  const filteredTags = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.tags ?? []).filter(
      (t) =>
        (includeInactive || t.is_active) &&
        (!kindFilter || !t.kind || t.kind === kindFilter) &&
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q))
    );
  }, [data, search, kindFilter, includeInactive]);

  const activeRows = tab === 'categories' ? filteredCategories : filteredTags;
  const pageCount = Math.max(
    1,
    Math.ceil(activeRows.length / pagination.pageSize)
  );
  const pageSlice = <T,>(rows: T[]) =>
    rows.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    );

  // ── Actions ──
  const categoryColumns = useMemo(
    () =>
      createCategoryColumns(
        {
          onEdit: (c) => {
            setEditingCategory(c);
            setCategoryFormOpen(true);
          },
          onToggleActive: async (c) => {
            try {
              await updateCategory({
                id: c._id,
                data: { is_active: !c.is_active },
              }).unwrap();
              toast.success(
                c.is_active
                  ? 'Product type deactivated'
                  : 'Product type reactivated'
              );
            } catch {
              toast.error('Could not update the product type.');
            }
          },
          onDelete: async (c) => {
            if (
              !window.confirm(
                `Delete the product type "${c.product_type}"? This cannot be undone.`
              )
            )
              return;
            try {
              await deleteCategory(c._id).unwrap();
              toast.success('Product type deleted');
            } catch {
              toast.error('Could not delete the product type.');
            }
          },
        },
        categoryUsageOf
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateCategory, deleteCategory, typeUsage]
  );

  const tagColumns = useMemo(
    () =>
      createTagColumns(
        {
          onEdit: (t) => {
            setEditingTag(t);
            setTagFormOpen(true);
          },
          onToggleActive: async (t) => {
            try {
              await updateTag({
                id: t._id,
                data: { is_active: !t.is_active },
              }).unwrap();
              toast.success(
                t.is_active ? 'Tag deactivated' : 'Tag reactivated'
              );
            } catch {
              toast.error('Could not update the tag.');
            }
          },
          onDelete: async (t) => {
            if (
              !window.confirm(
                `Delete the tag "${t.name}"? This cannot be undone.`
              )
            )
              return;
            try {
              await deleteTag(t._id).unwrap();
              toast.success('Tag deleted');
            } catch {
              toast.error('Could not delete the tag.');
            }
          },
        },
        tagUsageOf
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateTag, deleteTag, tagUsage]
  );

  const runSeed = async () => {
    if (
      !window.confirm(
        'Seed the default Qlozet taxonomy? Existing entries are kept — only missing defaults are added.'
      )
    )
      return;
    try {
      await seedTaxonomy().unwrap();
      toast.success('Default taxonomy seeded — existing entries untouched.');
    } catch {
      toast.error('Could not seed the taxonomy.');
    }
  };

  const toolbar = (
    <TableToolbar
      title="Taxonomy"
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        resetPage();
      }}
      showExport={false}
      rightExtra={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kindFilter}
            onChange={(e) => {
              setKindFilter(e.target.value);
              resetPage();
            }}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="">All kinds</option>
            {KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => {
                setIncludeInactive(e.target.checked);
                resetPage();
              }}
            />
            Inactive
          </label>
          <button
            type="button"
            onClick={runSeed}
            disabled={seeding}
            title="Add any missing default product types and tags"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Sprout className="size-4" />
            {seeding ? 'Seeding…' : 'Seed defaults'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (tab === 'categories') {
                setEditingCategory(null);
                setCategoryFormOpen(true);
              } else {
                setEditingTag(null);
                setTagFormOpen(true);
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            {tab === 'categories' ? 'Add product type' : 'Add tag'}
          </button>
        </div>
      }
    />
  );

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as 'categories' | 'tags');
          resetPage();
        }}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="categories">
            Product types
            {data && (
              <span className="ml-1.5 text-xs text-gray-400">
                {data.categories.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tags">
            Tags
            {data && (
              <span className="ml-1.5 text-xs text-gray-400">
                {data.tags.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <DataTable<SystemCategory>
            columns={categoryColumns}
            data={pageSlice(filteredCategories)}
            isLoading={isLoading}
            isFetching={isFetching}
            isSuccess={isSuccess}
            isError={isError}
            error={error}
            pagination={pagination}
            setPagination={setPagination}
            pageCount={pageCount}
            emptyMessage="No product types yet. Seed the defaults or add one."
            toolbar={toolbar}
          />
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <DataTable<SystemTag>
            columns={tagColumns}
            data={pageSlice(filteredTags)}
            isLoading={isLoading}
            isFetching={isFetching}
            isSuccess={isSuccess}
            isError={isError}
            error={error}
            pagination={pagination}
            setPagination={setPagination}
            pageCount={pageCount}
            emptyMessage="No tags yet. Seed the defaults or add one."
            toolbar={toolbar}
          />
        </TabsContent>
      </Tabs>

      <CategoryFormSheet
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        category={editingCategory}
        usageCount={editingCategory ? categoryUsageOf(editingCategory) : 0}
      />
      <TagFormSheet
        open={tagFormOpen}
        onOpenChange={setTagFormOpen}
        tag={editingTag}
        usageCount={editingTag ? tagUsageOf(editingTag) : 0}
      />
    </>
  );
}
