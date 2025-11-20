'use client'

import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Product } from '@/redux/services/products/products.api-slice'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

// Helper function to get status variant
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'destructive'
    case 'draft':
      return 'secondary'
    case 'scheduled':
      return 'outline'
    default:
      return 'secondary'
  }
}

// Helper function to get status label
const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Helper to get customization label
const getCustomizationLabel = (product: Product): string => {
  if (product.customizations && product.customizations.length > 0) {
    return 'Customisable'
  }
  return 'Non Customisable'
}

// Helper to get audience from tags
const getAudience = (tags?: string[]): string => {
  if (!tags || tags.length === 0) return '-'
  if (tags.includes('women') || tags.includes('female')) return 'Women'
  if (tags.includes('men') || tags.includes('male')) return 'Men'
  if (tags.includes('unisex')) return 'Unisex'
  return tags[0] || '-'
}

interface ClothingTableColumnsProps {
  onViewDetails: (productId: string) => void
  onEdit: (productId: string) => void
  onDuplicate?: (productId: string) => void
  onDelete?: (productId: string) => void
}

export const createClothingTableColumns = ({
  onViewDetails,
  onEdit,
  onDuplicate,
  onDelete,
}: ClothingTableColumnsProps): ColumnDef<Product>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'images',
    header: 'Picture',
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      const productName = row.original.name
      return (
        <div className='w-12 h-12 relative rounded-md overflow-hidden bg-gray-100'>
          {images && images.length > 0 ? (
            <Image
              src={images[0]}
              alt={productName}
              fill
              className='object-cover'
              sizes='48px'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-400'>
              <span className='text-xs'>No img</span>
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Product name',
    cell: ({ row }) => {
      return <div className='font-medium'>{row.getValue('name')}</div>
    },
  },
  {
    accessorKey: 'price',
    header: 'Product price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      return (
        <div className='font-medium'>
          {formatCurrency(price, 'NGN')}
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: 'Product Type',
    cell: ({ row }) => {
      return <div className='capitalize'>{row.getValue('category') || '-'}</div>
    },
  },
  {
    id: 'customization',
    header: 'Customization',
    cell: ({ row }) => {
      return <div>{getCustomizationLabel(row.original)}</div>
    },
    enableSorting: false,
  },
  {
    id: 'audience',
    header: 'Audience',
    cell: ({ row }) => {
      return <div>{getAudience(row.original.tags)}</div>
    },
    enableSorting: false,
  },
  {
    id: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const stock = row.original.stock
      const variants = row.original.variants
      const variantCount = variants ? variants.length : 1

      const stockBadgeVariant = stock <= 0 ? 'destructive' : stock <= 5 ? 'secondary' : 'default'
      const stockBadgeColor = stock <= 0 ? 'bg-red-500' : stock <= 5 ? 'bg-yellow-500' : 'bg-green-500'

      return (
        <div className='flex items-center gap-2'>
          <Badge
            variant={stockBadgeVariant}
            className={`${stockBadgeColor} text-white rounded-full w-6 h-6 flex items-center justify-center p-0 text-xs`}
          >
            {stock}
          </Badge>
          <span className='text-sm'>in</span>
          <Badge variant='outline' className='rounded-md'>
            {variantCount}
          </Badge>
          <span className='text-sm'>Variants</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Product Status',
    cell: ({ row }) => {
      const status: string = row.getValue('status')
      return (
        <Badge variant={getStatusVariant(status)} className='capitalize'>
          {getStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() => onViewDetails(product._id as string)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(product._id as string)}>
              Edit Product
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem
                onClick={() => onDuplicate(product._id as string)}
              >
                Duplicate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(product._id as string)}
                className='text-red-600'
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
