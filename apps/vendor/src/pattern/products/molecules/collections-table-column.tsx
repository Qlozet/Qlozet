'use client'

import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collection,
  CollectionCondition,
} from '@/redux/services/collections/collections.api-slice'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'

// Number of conditions shown before collapsing into a "… and N more" line.
const MAX_VISIBLE_CONDITIONS = 3

// Humanize the condition `field` (e.g. "product_category" → "Product category").
const FIELD_LABELS: Record<string, string> = {
  product_category: 'Product category',
  category: 'Product category',
  product_tags: 'Product Tags',
  tags: 'Product Tags',
  product_type: 'Product Type',
  type: 'Product Type',
  price: 'Price',
  brand: 'Brand',
  audience: 'Audience',
  name: 'Product name',
}

// Humanize the condition `operator` (e.g. "is_equal_to" → "is equal to").
const OPERATOR_LABELS: Record<string, string> = {
  is_equal_to: 'is equal to',
  not_equal_to: 'is not equal to',
  greater_than: 'is greater than',
  less_than: 'is less than',
}

const humanizeField = (field: string): string =>
  FIELD_LABELS[field] ??
  field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

const humanizeOperator = (operator: string): string =>
  OPERATOR_LABELS[operator] ?? operator.replace(/_/g, ' ')

export const formatCondition = (condition: CollectionCondition): string =>
  `${humanizeField(condition.field)} ${humanizeOperator(condition.operator)} ${condition.value}`

// Cover image: prefer an explicit collection image, otherwise fall back to the
// first available image from the collection's products.
const getCoverImage = (collection: Collection): string | undefined => {
  const record = collection as Record<string, any>
  const direct = record.image ?? record.cover_image ?? record.thumbnail
  if (typeof direct === 'string' && direct) return direct
  if (direct && typeof direct === 'object' && direct.url) return direct.url

  const products = (collection.products ?? []) as any[]
  for (const product of products) {
    const inner = product?.[product?.kind] ?? product
    const img = inner?.images?.[0]
    const url = typeof img === 'string' ? img : img?.url
    if (url) return url
  }
  return undefined
}

const getProductCount = (collection: Collection): number => {
  const record = collection as Record<string, any>
  return (
    record.product_count ??
    record.products_count ??
    collection.products?.length ??
    0
  )
}

export interface CollectionsTableActions {
  onEdit: (collectionId: string) => void
  onSelect?: (collectionId: string) => void
  onActivate?: (collectionId: string) => void
  onScheduleActivation?: (collectionId: string) => void
  onArchive?: (collectionId: string) => void
  onDeactivate?: (collectionId: string) => void
  onDelete?: (collectionId: string) => void
}

export const CollectionsTableColumns = ({
  onEdit,
  onSelect,
  onActivate,
  onScheduleActivation,
  onArchive,
  onDeactivate,
  onDelete,
}: CollectionsTableActions): ColumnDef<Collection>[] => [
  {
    accessorKey: 'title',
    header: 'Name',
    cell: ({ row }) => {
      const collection = row.original
      const cover = getCoverImage(collection)
      const title = collection.title || 'Untitled Collection'
      return (
        <div className='flex items-center gap-4'>
          <div className='relative bg-white size-10 shrink-0 border-[0.5px] rounded-[8px] overflow-hidden'>
            {cover ? (
              <Image
                src={cover}
                alt={title}
                fill
                className='object-cover'
                sizes='40px'
                quality={100}
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-gray-400'>
                <span className='text-[10px]'>No img</span>
              </div>
            )}
          </div>
          <span className='font-normal'>{title}</span>
        </div>
      )
    },
  },
  {
    id: 'products',
    header: 'Products',
    cell: ({ row }) => {
      return <div className='font-normal'>{getProductCount(row.original)}</div>
    },
    enableSorting: false,
  },
  {
    id: 'conditions',
    header: 'Product conditions',
    cell: ({ row }) => {
      const conditions = row.original.conditions ?? []
      if (conditions.length === 0) {
        return <span className='text-sm text-muted-foreground'>—</span>
      }
      const visible = conditions.slice(0, MAX_VISIBLE_CONDITIONS)
      const remaining = conditions.length - visible.length
      return (
        <div className='flex flex-col gap-0.5 max-w-[360px]'>
          {visible.map((condition, index) => (
            <span key={index} className='text-sm text-foreground/80'>
              {formatCondition(condition)}
            </span>
          ))}
          {remaining > 0 && (
            <span className='text-sm text-muted-foreground'>
              … and {remaining} more
            </span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.is_active ?? false
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
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const collection = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56 p-0'>
            <ScrollArea className='max-h-75 space-y-4'>
              <div className='px-2 py-1.5 text-sm font-medium text-muted-foreground'>
                Collection menu
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(collection._id)}>
                Edit Collection
              </DropdownMenuItem>
              {onSelect && (
                <DropdownMenuItem onClick={() => onSelect(collection._id)}>
                  Select Collection
                </DropdownMenuItem>
              )}
              {onActivate && (
                <DropdownMenuItem onClick={() => onActivate(collection._id)}>
                  Activate Collection
                </DropdownMenuItem>
              )}
              {onScheduleActivation && (
                <DropdownMenuItem
                  onClick={() => onScheduleActivation(collection._id)}
                >
                  Schedule activation
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onArchive && (
                <DropdownMenuItem
                  onClick={() => onArchive(collection._id)}
                  className='text-red-600'
                >
                  Archive Collection
                </DropdownMenuItem>
              )}
              {onDeactivate && (
                <DropdownMenuItem
                  onClick={() => onDeactivate(collection._id)}
                  className='text-red-600'
                >
                  Deactivate Collection
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(collection._id)}
                  className='text-red-600'
                >
                  Delete Collection
                </DropdownMenuItem>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
