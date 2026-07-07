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
import { Collection } from '@/redux/services/collections/collections.api-slice'
import { cn } from '@/lib/utils'
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon'
import { Skeleton } from '@/components/ui/skeleton'
import {
    CollectionsTableColumns,
    CollectionsTableActions,
} from '../molecules/collections-table-column'

interface ICollectionsTableProps extends CollectionsTableActions {
    data: Collection[]
    pagination?: PaginationState
    setPagination?: any
    isLoading: boolean
    isFetching: boolean
    isSuccess: boolean
    error: any
    isError: boolean
}

export const CollectionsTable = ({
    data,
    isLoading,
    isFetching,
    isSuccess,
    error,
    isError,
    pagination,
    setPagination,
    onEdit,
    onSelect,
    onActivate,
    onScheduleActivation,
    onArchive,
    onDeactivate,
    onDelete,
}: ICollectionsTableProps) => {
    const [internalPagination, setInternalPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const activePagination = pagination ?? internalPagination
    const setActivePagination = setPagination ?? setInternalPagination

    const defaultData = useMemo(() => [], [])

    const columns = useMemo(
        () =>
            CollectionsTableColumns({
                onEdit,
                onSelect,
                onActivate,
                onScheduleActivation,
                onArchive,
                onDeactivate,
                onDelete,
            }),
        [
            onEdit,
            onSelect,
            onActivate,
            onScheduleActivation,
            onArchive,
            onDeactivate,
            onDelete,
        ]
    )

    // All collections arrive in a single response, so pagination is client-side
    // (manualPagination: false lets the table slice and count pages itself).
    const collectionsTable = useReactTable({
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
            <div className=''>
                <Table>
                    {/* Header */}
                    <TableHeader className='bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] h-[52px] pt-7 pb-4'>
                        {collectionsTable.getHeaderGroups()?.map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers?.map((header, index) => {
                                    const isFirst = index === 0
                                    const isLast = index === headerGroup.headers?.length - 1
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                'h-[52px] pt-7 pb-4 whitespace-nowrap text-grey-black dark:text-white text-sm font-medium',
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
                        {/* Loading: skeleton rows that mirror the real table layout */}
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
                                                {isFirst ? (
                                                    <div className='flex items-center gap-4'>
                                                        <Skeleton className='size-10 rounded-[8px]' />
                                                        <Skeleton className='h-4 w-24 rounded-md' />
                                                    </div>
                                                ) : (
                                                    <Skeleton
                                                        className={cn(
                                                            'h-4 rounded-md',
                                                            isLast ? 'w-8' : 'w-40'
                                                        )}
                                                    />
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}

                        {/* Display table rows when data is done loading and rows are not empty */}
                        {!showLoader && !isError && (
                            <>
                                {collectionsTable.getRowModel().rows?.length
                                    ? collectionsTable.getRowModel().rows?.map(row => (
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

                        {/* Display message when data is empty.
                            Not gated on isSuccess: the collections endpoint can settle
                            without flipping isSuccess, which would otherwise leave the
                            body blank. Any settled, non-error, no-rows state shows this. */}
                        {!showLoader && !isError && data?.length === 0 && (
                            <TableRow className='bg-white dark:bg-card hover:bg-white dark:hover:bg-card'>
                                <TableCell
                                    colSpan={columns?.length}
                                    className='h-125 text-center bg-white dark:bg-card'
                                >
                                    <div className='flex flex-col items-center gap-4'>
                                        <BoldBoxRemoveIcon />
                                        <div className='flex flex-col items-center gap-2'>
                                            <p className='text-lg font-medium text-muted-foreground'>
                                                Nothing in here yet.
                                            </p>
                                            <p className='text-sm text-muted-foreground'>
                                                Collections will show up here once you create one.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Display error message */}
                        {!showLoader && isError && (
                            <TableRow>
                                <TableCell
                                    colSpan={columns?.length}
                                    className='h-64 text-center'
                                >
                                    <div className='flex flex-col items-center gap-2'>
                                        <p className='text-lg font-medium text-destructive'>
                                            Error loading collections
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
            {!showLoader && isSuccess && collectionsTable.getRowModel().rows?.length > 0 && (
                <div className='py-4'>
                    <Pagination table={collectionsTable} />
                </div>
            )}
        </>
    )
}
