'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Power } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PlatformStyle } from '@/redux/services/style-library/style-library.api-slice';
import { CATEGORY_LABELS, GENDER_LABELS } from '../lib/style-options';

export interface StylesColumnActions {
  onEdit: (style: PlatformStyle) => void;
  onToggleActive: (style: PlatformStyle) => void;
}

const isPlatform = (s: PlatformStyle) => !s.business;

export function createStylesColumns(
  actions: StylesColumnActions
): ColumnDef<PlatformStyle>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Style',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
              {s.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.image_url}
                  alt={s.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[9px] text-gray-400">
                  No img
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {s.name}
              </span>
              <span className="font-mono text-[11px] text-gray-400">
                {s.style_code}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {CATEGORY_LABELS[row.original.category] ?? row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'gender',
      header: 'Audience',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {GENDER_LABELS[row.original.gender] ?? row.original.gender}
        </span>
      ),
    },
    {
      accessorKey: 'price_suggestion',
      header: 'Suggested price',
      cell: ({ row }) => {
        const p = row.original.price_suggestion;
        return (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {typeof p === 'number' && p > 0 ? `₦${p.toLocaleString()}` : '—'}
          </span>
        );
      },
    },
    {
      id: 'scope',
      header: 'Scope',
      cell: ({ row }) =>
        isPlatform(row.original) ? (
          <Badge variant="blue">Platform</Badge>
        ) : (
          <Badge variant="secondary">Vendor</Badge>
        ),
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
        const s = row.original;
        // Vendor custom styles are read-only here — oversight, not management.
        if (!isPlatform(s)) return null;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => actions.onToggleActive(s)}
              title={s.is_active ? 'Deactivate' : 'Reactivate'}
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
            >
              <Power className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => actions.onEdit(s)}
              title="Edit"
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        );
      },
    },
  ];
}
