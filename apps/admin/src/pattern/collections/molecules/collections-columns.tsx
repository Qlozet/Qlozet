'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, Power } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Collection } from '@/redux/services/collections/collections.api-slice';
import { formatCondition } from '../lib/collection-condition-options';

export interface CollectionsColumnActions {
  onEdit: (id: string) => void;
  onDelete: (collection: Collection) => void;
  onToggleActive: (collection: Collection) => void;
}

const MAX_CONDITIONS = 2;

function coverOf(c: Collection): string | undefined {
  if (c.cover_image) return c.cover_image;
  const first = (c.products as Array<{ images?: string[] }> | undefined)?.[0];
  return first?.images?.[0];
}

function productCount(c: Collection): number {
  return (
    (c.product_count as number | undefined) ??
    (Array.isArray(c.products) ? c.products.length : 0)
  );
}

export function createCollectionsColumns(
  actions: CollectionsColumnActions
): ColumnDef<Collection>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Name',
      cell: ({ row }) => {
        const c = row.original;
        const cover = coverOf(c);
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={c.title ?? ''}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[9px] text-gray-400">
                  No img
                </span>
              )}
            </div>
            <span className="font-medium text-gray-800 dark:text-gray-100">
              {c.title ?? 'Untitled'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'products',
      header: 'Products',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {productCount(row.original)}
        </span>
      ),
    },
    {
      id: 'conditions',
      header: 'Conditions',
      cell: ({ row }) => {
        const conds = row.original.conditions ?? [];
        if (conds.length === 0) return <span className="text-gray-400">—</span>;
        const shown = conds.slice(0, MAX_CONDITIONS);
        const extra = conds.length - shown.length;
        return (
          <div className="flex flex-col gap-0.5">
            {shown.map((c, i) => (
              <span
                key={i}
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                {formatCondition(c)}
              </span>
            ))}
            {extra > 0 && (
              <span className="text-xs text-gray-400">…and {extra} more</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'scope',
      header: 'Explore scope',
      cell: ({ row }) => {
        const kinds = row.original.kinds ?? [];
        if (kinds.length === 0)
          return <span className="text-xs text-gray-400">All pages</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {kinds.map((k) => (
              <span
                key={k}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {k}
              </span>
            ))}
          </div>
        );
      },
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
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => actions.onToggleActive(c)}
              title={c.is_active ? 'Deactivate' : 'Activate'}
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
            >
              <Power className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => actions.onEdit(c._id)}
              title="Edit"
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => actions.onDelete(c)}
              title="Delete"
              className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        );
      },
    },
  ];
}
