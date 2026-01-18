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
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface Warehouse {
  _id?: string
  warehouseName: string
  vendorName: string
  warehouseAddress: string
  contactName: string
  phoneNumber: string
  email: string
  status: 'default' | 'alternate'
}

// Helper function to get status variant
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "error" | "blue" => {
  switch (status) {
    case 'default':
      return 'success'
    case 'alternate':
      return 'warning'
    default:
      return 'secondary'
  }
}

// Helper function to get status label
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'default':
      return 'Default warehouse'
    case 'alternate':
      return 'Alternate warehouse'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

interface WarehouseTableColumnsProps {
  onEdit?: (warehouseId: string) => void
  onDelete?: (warehouseId: string) => void
  onSetDefault?: (warehouseId: string) => void
}

export const createWarehouseTableColumns = ({
  onEdit,
  onDelete,
  onSetDefault,
}: WarehouseTableColumnsProps): ColumnDef<Warehouse>[] => [
  {
    accessorKey: 'warehouseName',
    header: 'Warehouse name',
    cell: ({ row }) => {
      return <div className='font-normal'>{row.getValue('warehouseName')}</div>
    },
  },
  {
    accessorKey: 'vendorName',
    header: "Vendor's name",
    cell: ({ row }) => {
      return <div className='font-normal'>{row.getValue('vendorName')}</div>
    },
  },
  {
    accessorKey: 'warehouseAddress',
    header: 'Warehouse address',
    cell: ({ row }) => {
      return <div className='font-normal'>{row.getValue('warehouseAddress')}</div>
    },
  },
  {
    accessorKey: 'contactName',
    header: 'Contact name',
    cell: ({ row }) => {
      return <div className='font-normal'>{row.getValue('contactName')}</div>
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone number',
    cell: ({ row }) => {
      return <div className='font-normal'>{row.getValue('phoneNumber')}</div>
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      return <div className='font-normal'>{row.getValue('email')}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status: string = row.getValue('status')
      return (
        <Badge
          variant={getStatusVariant(status)}
          shape="square"
          className='capitalize h-[26px] px-3 flex items-center justify-center text-xs font-normal'
        >
          {getStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: () => null,
    cell: ({ row }) => {
      const warehouse = row.original

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
                Warehouse menu
              </div>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(warehouse._id as string)}>
                  Edit warehouse
                </DropdownMenuItem>
              )}
              {onSetDefault && warehouse.status !== 'default' && (
                <DropdownMenuItem onClick={() => onSetDefault(warehouse._id as string)}>
                  Set as default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(warehouse._id as string)}
                  className='text-red-600'
                >
                  Delete warehouse
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
