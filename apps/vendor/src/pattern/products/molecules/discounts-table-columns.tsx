'use client'

import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Discount, DiscountCondition } from '@/redux/services/discounts/discounts.api-slice'
import { MoreHorizontal } from 'lucide-react'
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

export const formatCondition = (condition: DiscountCondition): string =>
  `${humanizeField(condition.field)} ${humanizeOperator(condition.operator)} ${condition.value}`

// ─── Type badge ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  percentage: '% Off',
  fixed: 'Fixed',
  store_wide: 'Store-Wide',
  flash_percentage: 'Flash %',
  flash_fixed: 'Flash Fixed',
  category_specific: 'Category',
}

const TYPE_COLORS: Record<string, string> = {
  percentage: 'bg-blue-50 text-blue-700 border-blue-200',
  fixed: 'bg-green-50 text-green-700 border-green-200',
  store_wide: 'bg-purple-50 text-purple-700 border-purple-200',
  flash_percentage: 'bg-orange-50 text-orange-700 border-orange-200',
  flash_fixed: 'bg-orange-50 text-orange-700 border-orange-200',
  category_specific: 'bg-teal-50 text-teal-700 border-teal-200',
}

// ─── Value formatter ─────────────────────────────────────────────────

const formatValue = (discount: Discount): string => {
  const { type, value, value_type } = discount
  if (!type || value == null) return '—'
  const isPercent =
    type === 'percentage' ||
    type === 'flash_percentage' ||
    (type === 'store_wide' && value_type === 'percentage') ||
    (type === 'category_specific' && value_type === 'percentage')
  return isPercent ? `${value}%` : `₦${value.toLocaleString()}`
}

// ─── Status helpers ──────────────────────────────────────────────────

const getStatus = (
  discount: Discount
): { label: string; variant: 'success' | 'error' | 'warning' } => {
  const now = new Date()
  const isFlash = discount.type?.startsWith('flash_')

  if (isFlash && discount.start_date) {
    const start = new Date(discount.start_date)
    if (start > now) return { label: 'Scheduled', variant: 'warning' }
  }

  if (isFlash && discount.end_date) {
    const end = new Date(discount.end_date)
    if (end < now) return { label: 'Expired', variant: 'error' }
  }

  return discount.is_active
    ? { label: 'Active', variant: 'success' }
    : { label: 'Inactive', variant: 'error' }
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

export interface DiscountsTableActions {
  onEdit: (discountId: string) => void
  onActivate?: (discountId: string) => void
  onDeactivate?: (discountId: string) => void
  onDelete?: (discountId: string) => void
}

export const DiscountsTableColumns = ({
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: DiscountsTableActions): ColumnDef<Discount>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const d = row.original
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-foreground text-sm'>
            {d.title || 'Untitled Discount'}
          </span>
          {d.conditions && d.conditions.length > 0 && (
            <div className='flex flex-col gap-0'>
              {d.conditions.slice(0, MAX_VISIBLE_CONDITIONS).map((c, i) => (
                <span key={i} className='text-xs text-muted-foreground'>
                  {formatCondition(c)}
                </span>
              ))}
              {d.conditions.length > MAX_VISIBLE_CONDITIONS && (
                <span className='text-xs text-muted-foreground'>
                  +{d.conditions.length - MAX_VISIBLE_CONDITIONS} more
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type ?? 'percentage'
      return (
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? ''}`}
        >
          {TYPE_LABELS[type] ?? type}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'value',
    header: 'Value',
    cell: ({ row }) => (
      <span className='text-sm font-semibold text-foreground'>
        {formatValue(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { label, variant } = getStatus(row.original)
      return (
        <Badge
          variant={variant}
          shape='square'
          className='capitalize h-[26px] w-[93px] flex items-center justify-center px-2 text-xs font-normal'
        >
          {label}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const d = row.original
      const isFlash = d.type?.startsWith('flash_')
      if (isFlash && (d.start_date || d.end_date)) {
        return (
          <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
            <span>{formatDate(d.start_date)} →</span>
            <span>{formatDate(d.end_date)}</span>
          </div>
        )
      }
      return (
        <span className='text-xs text-muted-foreground'>
          {formatDate(d.createdAt)}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const discount = row.original
      const isActive = discount.is_active
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4 text-gray-500' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(discount._id)}>
              Edit Discount
            </DropdownMenuItem>
            {isActive && onDeactivate && (
              <DropdownMenuItem onClick={() => onDeactivate(discount._id)}>
                Deactivate
              </DropdownMenuItem>
            )}
            {!isActive && onActivate && (
              <DropdownMenuItem onClick={() => onActivate(discount._id)}>
                Activate
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(discount._id)}
                className='text-red-600 focus:text-red-600'
              >
                Delete Discount
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
