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
import { Discount } from '@/redux/services/discounts/discounts.api-slice'
import { cn } from '@/lib/utils'
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DiscountsTableColumns,
    DiscountsTableActions,
} from '../molecules/discounts-table-columns'

interface IDiscountsTableProps extends DiscountsTableActions {
    data: Discount[]
    pagination?: PaginationState
    setPagination?: any
    isLoading: boolean
    isFetching: boolean
    isSuccess: boolean
    error: any
    isError: boolean
}

export const DiscountsTable = ({
    data,
    isLoading,
    isFetching,
    isSuccess,
    error,
    isError,
    pagination,
    setPagination,
    onEdit,
    onActivate,
    onDeactivate,
    onDelete,
}: IDiscountsTableProps) => {
    const [internalPagination, setInternalPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const activePagination = pagination ?? internalPagination
    const setActivePagination = setPagination ?? setInternalPagination

    const defaultData = useMemo(() => [], [])

    const columns = useMemo(
        () =>
            DiscountsTableColumns({
                onEdit,
                onActivate,
                onDeactivate,
                onDelete,
            }),
        [onEdit, onActivate, onDeactivate, onDelete]
    )

    const discountsTable = useReactTable({
        data: data ?? defaultData,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            pagination: activePagination,
        },
        onPaginationChange: setActivePagination,
        debugTable: false,
    })

    const showLoader = isLoading || isFetching
    const skeletonRowCount = activePagination?.pageSize || 10

    return (
        <>
            <div>
                <Table>
                    {/* Header */}
                    <TableHeader className='bg-[hsla(0,0%,96%,1)] h-[52px] pt-7 pb-4'>
                        {discountsTable.getHeaderGroups()?.map(headerGroup => (
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
                        {/* Loading skeleton */}
                        {showLoader &&
                            Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                                <TableRow
                                    key={`skeleton-${rowIndex}`}
                                    className='border-b hover:bg-transparent'
                                >
                                    {columns.map((_, cellIndex) => {
                                        const isFirst = cellIndex === 0
                                        const isLast = cellIndex === columns.length - 1
                                        return (
                                            <TableCell
                                                key={cellIndex}
                                                className={cn('py-4', isFirst && 'pl-6', isLast && 'pr-6')}
                                            >
                                                <Skeleton
                                                    className={cn(
                                                        'h-4 rounded-md',
                                                        isFirst ? 'w-32' : isLast ? 'w-8' : 'w-20'
                                                    )}
                                                />
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}

                        {/* Data rows */}
                        {!showLoader && !isError && (
                            <>
                                {discountsTable.getRowModel().rows?.length
                                    ? discountsTable.getRowModel().rows?.map(row => (
                                        <TableRow
                                            key={row.id}
                                            className='border-b align-top'
                                        >
                                            {row.getVisibleCells()?.map((cell, cellIndex) => {
                                                const isFirst = cellIndex === 0
                                                const isLast = cellIndex === row.getVisibleCells().length - 1
                                                return (
                                                    <TableCell
                                                        key={cell.id}
                                                        className={cn(
                                                            'py-5',
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

                        {/* Empty state */}
                        {!showLoader && !isError && data?.length === 0 && (
                            <TableRow className='bg-white hover:bg-white'>
                                <TableCell
                                    colSpan={columns?.length}
                                    className='h-125 text-center bg-white'
                                >
                                    <div className='flex flex-col items-center gap-4'>
                                        <BoldBoxRemoveIcon />
                                        <div className='flex flex-col items-center gap-2'>
                                            <p className='text-lg font-medium text-muted-foreground'>
                                                No discounts yet.
                                            </p>
                                            <p className='text-sm text-muted-foreground'>
                                                Create your first discount to start offering deals.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Error */}
                        {!showLoader && isError && (
                            <TableRow>
                                <TableCell
                                    colSpan={columns?.length}
                                    className='h-64 text-center'
                                >
                                    <div className='flex flex-col items-center gap-2'>
                                        <p className='text-lg font-medium text-destructive'>
                                            Error loading discounts
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
            {!showLoader && isSuccess && discountsTable.getRowModel().rows?.length > 0 && (
                <div className='py-4'>
                    <Pagination table={discountsTable} />
                </div>
            )}
        </>
    )
}
