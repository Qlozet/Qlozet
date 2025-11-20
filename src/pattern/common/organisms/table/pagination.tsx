import React from 'react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/index'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  className?: string
}

export function Pagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount()

  return (
    <div className={cn('w-full flex items-center justify-end py-4', className)}>
      <div className='flex items-center'>
        {/* Previous Button */}
        <Button
          className='min-w-fit min-h-fit w-fit text-sm py-2.5 px-4 rounded-l-[8px] rounded-r-none'
          variant='outline'
          size='sm'
          onClick={() => {
            table.previousPage()
          }}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className='w-4 h-4 mr-1' />
          Previous
        </Button>

        {pageCount &&
          pageCount > 1 &&
          pageCount <= 7 &&
          Array.from({ length: pageCount }).map((_, index) => (
            <Button
              key={index}
              className={`${
                table.getState().pagination.pageIndex === index
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground'
              } min-w-fit min-h-fit w-fit text-sm py-2.5 px-4 rounded-none`}
              variant='outline'
              size='sm'
              onClick={() => {
                table.setPageIndex(index)
              }}
            >
              {index + 1}
            </Button>
          ))}

        {pageCount && pageCount > 7 && (
          <>
            {[...Array(3)].map((_, index) => (
              <Button
                key={index}
                className={`${
                  table.getState().pagination.pageIndex === index
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground'
                } min-w-fit min-h-fit w-fit text-sm py-2.5 px-4 rounded-none`}
                variant='outline'
                size='sm'
                onClick={() => {
                  table.setPageIndex(index)
                }}
              >
                {index + 1}
              </Button>
            ))}

            <span className='text-primary font-medium border h-[32px] py-2.5 px-4 w-[80px] text-center min-w-fit min-h-fit text-sm rounded-none'>
              {table.getState().pagination.pageIndex > 2 &&
              table.getState().pagination.pageIndex < pageCount - 3
                ? table.getState().pagination.pageIndex + 1
                : '...'}
            </span>

            {[...Array(3)].map((_, index) => (
              <Button
                key={index + pageCount - 2}
                className={`${
                  table.getState().pagination.pageIndex ===
                  pageCount - 3 + index
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground'
                } min-w-fit min-h-fit w-fit text-sm py-2.5 px-4 rounded-none`}
                variant='outline'
                size='sm'
                onClick={() => {
                  table.setPageIndex(pageCount - 3 + index)
                }}
              >
                {pageCount - 2 + index}
              </Button>
            ))}
          </>
        )}

        {/* Next button */}
        <Button
          className='py-2.5 px-4 rounded-r-[8px] rounded-l-none min-w-fit min-h-fit w-fit text-sm'
          variant='outline'
          size='sm'
          onClick={() => {
            table.nextPage()
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ChevronRight className='w-4 h-4 ml-1' />
        </Button>
      </div>
    </div>
  )
}
