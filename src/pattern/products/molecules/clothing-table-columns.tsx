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
import { ScrollArea } from '@/components/ui/scroll-area'

// Helper function to get status variant
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "error" | "blue" => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'error'
    case 'draft':
      return 'warning'
    case 'scheduled':
      return 'blue'
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
  showSelect?: boolean
}

export const createClothingTableColumns = ({
  onViewDetails,
  onEdit,
  onDuplicate,
  onDelete,
  showSelect = false,
}: ClothingTableColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: 'images',
    header: 'Picture',
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      const productName = row.original.name
      return (
        <div className='relative bg-white w-[51px] h-[31px] border-[0.5px] rounded-[8px] overflow-hidden'>
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
      return <div className='font-normal'>{row.getValue('name')}</div>
    },
  },
  {
    accessorKey: 'price',
    header: 'Product price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      return (
        <div className='font-normal'>
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

      const stockBadgeVariant = stock <= 0 ? 'destructive' : stock <= 5 ? 'warning' : 'success'

      return (
        <div className='flex items-center gap-2'>
          <Badge
            variant={stockBadgeVariant}
            shape='square'
            className='w-fit min-w-[19px] h-[16px] flex items-center justify-center p-0 text-xs rounded-[4px]!'
          >
            {stock}
          </Badge>
          <span className='text-sm'>in</span>
          <Badge variant='outline' shape='square' className='bg-accent w-fit min-w-[19px] h-[16px] flex items-center justify-center p-0 rounded-[4px]!'>
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
        <Badge variant={getStatusVariant(status)} shape="square" className='capitalize h-[26px] w-[93px] flex items-center justify-center px-2 text-xs font-normal'>
          {getStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: ({ table }) => {
      // Show actions dropdown in header when in select mode
      if (showSelect) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56 p-0'>
              <ScrollArea className='max-h-[300px]'>
                <div className='px-2 py-1.5 text-sm font-semibold text-muted-foreground'>
                  Product menu
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  View product
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Edit product
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Select Product
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled
                  className='text-muted-foreground'
                >
                  Feature product
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Activate product
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Schedule activation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-red-600'>
                  Archive product
                </DropdownMenuItem>
                <DropdownMenuItem className='text-red-600'>
                  Deactivate product
                </DropdownMenuItem>
                <DropdownMenuItem className='text-red-600'>
                  Delete product
                </DropdownMenuItem>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
      return null
    },
    cell: ({ row, table }) => {
      const product = row.original

      // Show checkbox when in select mode
      if (showSelect) {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label='Select row'
          />
        )
      }

      // Show actions dropdown by default
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56 p-0'>
            <ScrollArea className='max-h-[300px]'>
              <div className='px-2 py-1.5 text-sm font-semibold text-muted-foreground'>
                Product menu
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onViewDetails(product._id as string)}
              >
                View product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(product._id as string)}>
                Edit product
              </DropdownMenuItem>
              {onDuplicate && (
                <DropdownMenuItem
                  onClick={() => onDuplicate(product._id as string)}
                >
                  Select Product
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                disabled
                className='text-muted-foreground'
              >
                Feature product
              </DropdownMenuItem>
              <DropdownMenuItem>
                Activate product
              </DropdownMenuItem>
              <DropdownMenuItem>
                Schedule activation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600'>
                Archive product
              </DropdownMenuItem>
              <DropdownMenuItem className='text-red-600'>
                Deactivate product
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(product._id as string)}
                  className='text-red-600'
                >
                  Delete product
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
