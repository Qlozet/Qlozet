'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
  SystemCategory,
  SystemTag,
} from '@/redux/services/taxonomy/taxonomy.api-slice';
import { ASSIGNABLE_LABELS, KIND_LABELS } from '../lib/taxonomy-options';

const kindBadgeVariant: Record<string, 'blue' | 'success' | 'secondary'> = {
  clothing: 'blue',
  fabric: 'success',
  accessory: 'secondary',
};

/** Chips with a "+N more" tail so long lists don't blow up the row. */
const ChipList = ({ items, max = 4 }: { items: string[]; max?: number }) => {
  if (!items?.length) return <span className="text-sm text-gray-400">—</span>;
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <div className="flex max-w-[320px] flex-wrap gap-1">
      {shown.map((c) => (
        <span
          key={c}
          className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          {c}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-full px-2 py-0.5 text-[11px] text-gray-400">
          +{rest} more
        </span>
      )}
    </div>
  );
};

/** Products currently referencing this entry (by name — renames don't cascade). */
const UsageCell = ({ count }: { count: number }) =>
  count > 0 ? (
    <span
      className="text-sm font-medium text-gray-700 dark:text-gray-200"
      title="Live products reference this by name"
    >
      {count.toLocaleString()} product{count === 1 ? '' : 's'}
    </span>
  ) : (
    <span className="text-sm text-gray-400">Unused</span>
  );

const iconBtnCls =
  'rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800';

interface RowActions<T> {
  onEdit: (row: T) => void;
  onToggleActive: (row: T) => void;
  /** Only offered when the entry is unused. */
  onDelete: (row: T) => void;
}

export function createCategoryColumns(
  actions: RowActions<SystemCategory>,
  usageOf: (c: SystemCategory) => number
): ColumnDef<SystemCategory>[] {
  return [
    {
      accessorKey: 'product_type',
      header: 'Product type',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-lg dark:bg-gray-800">
              {c.icon || '🏷️'}
            </div>
            <span className="font-medium text-gray-800 dark:text-gray-100">
              {c.product_type}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'kind',
      header: 'Kind',
      cell: ({ row }) => (
        <Badge variant={kindBadgeVariant[row.original.kind] ?? 'secondary'}>
          {KIND_LABELS[row.original.kind] ?? row.original.kind}
        </Badge>
      ),
    },
    {
      accessorKey: 'categories',
      header: 'Sub-categories',
      cell: ({ row }) => <ChipList items={row.original.categories} />,
    },
    {
      accessorKey: 'attributes',
      header: 'Attributes',
      cell: ({ row }) => <ChipList items={row.original.attributes} max={3} />,
    },
    {
      id: 'usage',
      header: 'In use by',
      cell: ({ row }) => <UsageCell count={usageOf(row.original)} />,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'error'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const c = row.original;
        const used = usageOf(c) > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => actions.onToggleActive(c)}
              title={
                c.is_active
                  ? 'Deactivate — hides it from vendor product forms'
                  : 'Reactivate'
              }
              className={iconBtnCls}
            >
              <Power className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => actions.onEdit(c)}
              title="Edit"
              className={iconBtnCls}
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => actions.onDelete(c)}
              disabled={used}
              title={
                used ? 'In use by live products — deactivate instead' : 'Delete'
              }
              className={iconBtnCls}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        );
      },
    },
  ];
}

export function createTagColumns(
  actions: RowActions<SystemTag>,
  usageOf: (t: SystemTag) => number
): ColumnDef<SystemTag>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Tag',
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-800 dark:text-gray-100">
              {t.name}
            </span>
            <span className="font-mono text-[11px] text-gray-400">
              {t.slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'kind',
      header: 'Kind',
      cell: ({ row }) =>
        row.original.kind ? (
          <Badge variant={kindBadgeVariant[row.original.kind] ?? 'secondary'}>
            {KIND_LABELS[row.original.kind] ?? row.original.kind}
          </Badge>
        ) : (
          <span className="text-sm text-gray-400">All kinds</span>
        ),
    },
    {
      accessorKey: 'assignable_by',
      header: 'Assignable by',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {ASSIGNABLE_LABELS[row.original.assignable_by] ??
            row.original.assignable_by}
        </span>
      ),
    },
    {
      id: 'usage',
      header: 'In use by',
      cell: ({ row }) => <UsageCell count={usageOf(row.original)} />,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'error'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const t = row.original;
        const used = usageOf(t) > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => actions.onToggleActive(t)}
              title={
                t.is_active
                  ? 'Deactivate — hides it from tag pickers'
                  : 'Reactivate'
              }
              className={iconBtnCls}
            >
              <Power className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => actions.onEdit(t)}
              title="Edit"
              className={iconBtnCls}
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => actions.onDelete(t)}
              disabled={used}
              title={
                used ? 'In use by live products — deactivate instead' : 'Delete'
              }
              className={iconBtnCls}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        );
      },
    },
  ];
}
