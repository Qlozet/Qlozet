'use client'

import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SizeGuide,
  SizeGuideCondition,
} from '@/redux/services/size-guides/size-guides.api-slice'
import { MoreHorizontal, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Helpers ─────────────────────────────────────────────────────────

const MAX_VISIBLE_CONDITIONS = 2

const FIELD_LABELS: Record<string, string> = {
  'clothing.taxonomy.product_type': 'Product Type',
  'clothing.taxonomy.categories': 'Category',
  'clothing.taxonomy.audience': 'Audience',
  'clothing.taxonomy.attributes': 'Attributes',
  'clothing.name': 'Product Name',
  'clothing.type': 'Customize Type',
  base_price: 'Price',
  kind: 'Product Kind',
  status: 'Status',
  'fabric.product_type': 'Fabric Material',
  'fabric.pattern': 'Fabric Pattern',
  'fabric.name': 'Fabric Name',
  'accessory.taxonomy.product_type': 'Accessory Type',
  'accessory.taxonomy.categories': 'Accessory Category',
}

const OPERATOR_LABELS: Record<string, string> = {
  is_equal_to: '=',
  not_equal_to: '≠',
  greater_than: '>',
  less_than: '<',
  contains: 'contains',
  starts_with: 'starts with',
  ends_with: 'ends with',
}

const humanizeField = (field: string): string =>
  FIELD_LABELS[field] ??
  field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

const humanizeOperator = (operator: string): string =>
  OPERATOR_LABELS[operator] ?? operator.replace(/_/g, ' ')

export const formatCondition = (condition: SizeGuideCondition): string =>
  `${humanizeField(condition.field)} ${humanizeOperator(condition.operator)} ${condition.value}`

// ─── Unit badge ──────────────────────────────────────────────────────

const UNIT_COLORS: Record<string, string> = {
  cm: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  inch: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
}

// ─── Date formatter ──────────────────────────────────────────────────

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Column Definitions ──────────────────────────────────────────────

export interface SizeGuidesTableActions {
  onEdit: (guideId: string) => void
  onActivate?: (guideId: string) => void
  onDeactivate?: (guideId: string) => void
  onDelete?: (guideId: string) => void
}

export const SizeGuidesTableColumns = ({
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: SizeGuidesTableActions): ColumnDef<SizeGuide>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const g = row.original
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-foreground text-sm'>
            {g.title || 'Untitled Size Guide'}
          </span>
          {g.conditions && g.conditions.length > 0 && (
            <div className='flex flex-col gap-0'>
              {g.conditions.slice(0, MAX_VISIBLE_CONDITIONS).map((c, i) => (
                <span key={i} className='text-xs text-muted-foreground'>
                  {formatCondition(c)}
                </span>
              ))}
              {g.conditions.length > MAX_VISIBLE_CONDITIONS && (
                <span className='text-xs text-muted-foreground'>
                  +{g.conditions.length - MAX_VISIBLE_CONDITIONS} more
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'unit',
    header: 'Unit',
    cell: ({ row }) => {
      const unit = row.original.unit ?? 'cm'
      return (
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${UNIT_COLORS[unit] ?? ''}`}
        >
          {unit.toUpperCase()}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'sizes',
    header: 'Sizes',
    cell: ({ row }) => {
      const sizes = row.original.sizes ?? []
      const labels = sizes.map((s) => s.label).join(', ')
      return (
        <span className='text-sm text-muted-foreground' title={labels}>
          {sizes.length} size{sizes.length !== 1 ? 's' : ''}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'fit_types',
    header: 'Fit Types',
    cell: ({ row }) => {
      const fitTypes = row.original.fit_types ?? []
      const labels = fitTypes.map((f) => f.label).join(', ')
      return (
        <span className='text-sm text-muted-foreground' title={labels}>
          {fitTypes.length || '—'}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.is_active
      return (
        <Badge
          variant={isActive ? 'success' : 'error'}
          shape='square'
          className='capitalize h-[26px] w-[93px] flex items-center justify-center px-2 text-xs font-normal'
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'date',
    header: 'Created',
    cell: ({ row }) => (
      <span className='text-xs text-muted-foreground'>
        {formatDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const guide = row.original
      const isActive = guide.is_active
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4 text-gray-500' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(guide._id)}>
              <Pencil className='mr-2 size-4 text-primary' />
              Edit
            </DropdownMenuItem>
            {isActive && onDeactivate && (
              <DropdownMenuItem onClick={() => onDeactivate(guide._id)}>
                Deactivate
              </DropdownMenuItem>
            )}
            {!isActive && onActivate && (
              <DropdownMenuItem onClick={() => onActivate(guide._id)}>
                Activate
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(guide._id)}
                className='text-red-600 focus:text-red-600'
              >
                Delete Size Guide
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
