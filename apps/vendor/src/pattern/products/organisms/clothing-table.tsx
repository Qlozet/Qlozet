'use client'

import React, { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Pagination } from '@/pattern/common/organisms/table/pagination'
import { createClothingTableColumns } from '../molecules/clothing-table-columns'
import { Product } from '@/redux/services/products/products.api-slice'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon'

interface IClothingTableProps {
  data: Product[]
  pageCount?: number
  pagination?: PaginationState
  setPagination?: any
  isLoading: boolean
  isFetching: boolean
  isSuccess: boolean
  error: any
  isError: boolean
  onViewDetails: (productId: string) => void
  onEdit: (productId: string) => void
  onDuplicate?: (productId: string) => void
  onDelete?: (productId: string) => void
  showSelect?: boolean
}

export const ClothingTable = ({
  data,
  isLoading,
  isFetching,
  isSuccess,
  error,
  isError,
  pagination,
  pageCount,
  setPagination,
  onViewDetails,
  onEdit,
  onDuplicate,
  onDelete,
  showSelect = false,
}: IClothingTableProps) => {
  const [rowSelection, setRowSelection] = useState({})

  if (!pagination) {
    pagination = { pageIndex: 0, pageSize: 10 }
  }

  const defaultData = useMemo(() => [], [])

  const columns = useMemo(
    () =>
      createClothingTableColumns({
        onViewDetails,
        onEdit,
        onDuplicate,
        onDelete,
        showSelect,
      }),
    [onViewDetails, onEdit, onDuplicate, onDelete, showSelect]
  )

  const clothingTable = useReactTable({
    data: data ?? defaultData,
    columns: columns,
    pageCount: pageCount,
    rowCount: data?.length,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      pagination,
      rowSelection,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    debugTable: true,
  })

  return (
    <>
      {/* Display placeholder when it is loading */}
      {(isLoading || isFetching) && (
        <div className='flex items-center justify-center h-64'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>Loading products...</p>
          </div>
        </div>
      )}

      {/* Display table when data is done loading */}
      {!isLoading && !isFetching && (
        <>
          <div className=''>
            <Table>
              {/* Header */}
              <TableHeader className='bg-[hsla(0,0%,96%,1)] h-[52px] pt-7 pb-4'>
                {clothingTable.getHeaderGroups()?.map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers?.map((header, index) => {
                      const isFirst = index === 0
                      const isLast = index === headerGroup.headers?.length - 1
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            'h-[52px] pt-7 pb-4 whitespace-nowrap text-grey-black text-sm font-medium',
                            isFirst && 'pl-6',
                            isLast && 'pr-6'
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              {/* Body */}
              <TableBody>
                {/* Display table rows when data is done loading and the table rows are not empty */}
                {isSuccess && !isLoading && !isFetching && (
                  <>
                    {clothingTable.getRowModel().rows?.length
                      ? clothingTable.getRowModel().rows?.map(row => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          className='border-b'
                        >
                          {row.getVisibleCells()?.map((cell, cellIndex) => {
                            const isFirst = cellIndex === 0
                            const isLast = cellIndex === row.getVisibleCells()?.length - 1
                            return (
                              <TableCell
                                key={cell.id}
                                className={cn(
                                  'whitespace-nowrap',
                                  isFirst && 'pl-6',
                                  isLast && 'pr-6'
                                )}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))
                      : null}
                  </>
                )}

                {/* Display Message when data is empty */}
                {!isLoading && !isFetching && isSuccess && data?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns?.length}
                      className='h-64 text-center'
                    >
                      <div className='flex flex-col items-center gap-4'>
                        <BoldBoxRemoveIcon />
                        <div className='flex flex-col items-center gap-2'>
                          <p className='text-lg font-medium text-muted-foreground'>
                            Nothing in here yet.
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            Products will show up here once you add a product.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Display error message */}
                {!isLoading && !isFetching && isError && (
                  <TableRow>
                    <TableCell
                      colSpan={columns?.length}
                      className='h-64 text-center'
                    >
                      <div className='flex flex-col items-center gap-2'>
                        <p className='text-lg font-medium text-destructive'>
                          Error loading products
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {error?.data?.message || 'Something went wrong'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {isSuccess && !isLoading && !isFetching && clothingTable.getRowModel().rows?.length > 0 && (
            <div className='py-4'>
              <Pagination table={clothingTable} />
            </div>
          )}
        </>
      )}
    </>
  )
}
