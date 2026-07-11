'use client'

import { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/pattern/common/organisms/table/data-table'
import { createWarehouseTableColumns } from '../molecules/warehouse-table-columns'
import { PaginationState } from '@tanstack/react-table'
import { Warehouse } from '../molecules/warehouse-table-columns'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { SearchInputWithParams } from '@/pattern/common/molecules/search-input-with-params'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Filter, ChevronDown } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { show } from '@ebay/nice-modal-react'
import { DeleteProductConfirmationModal } from '@/pattern/common/organisms/delete-confirmation-modal'
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar'
import { FilterMenu, type FilterOption } from '@/pattern/common/molecules/filter-menu'

const WAREHOUSE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Warehouses' },
  { value: 'default', label: 'Default Warehouse' },
  { value: 'alternate', label: 'Alternate Warehouses' },
]

interface WarehouseTableTemplateProps {
  data: Warehouse[]
  isLoading: boolean
  isFetching: boolean
  isSuccess: boolean
  error: any
  isError: boolean
  onAddWarehouse?: () => void
  onEditWarehouse?: (warehouseId: string) => void
  onDeleteWarehouse?: (warehouseId: string) => void
  onSetDefaultWarehouse?: (warehouseId: string) => void
  onExport?: () => void
  refetch?: () => void
}

const WarehouseTableTemplate = ({
  data,
  isLoading,
  isFetching,
  isSuccess,
  error,
  isError,
  onAddWarehouse,
  onEditWarehouse,
  onDeleteWarehouse,
  onSetDefaultWarehouse,
  onExport,
  refetch,
}: WarehouseTableTemplateProps) => {
  const router = useRouter()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [pageCount, setPageCount] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filteredData, setFilteredData] = useState<Warehouse[]>(data)
  const [filterOpen, setFilterOpen] = useState<boolean>(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const filtered = data.filter(
        (warehouse) =>
          warehouse.warehouseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          warehouse.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          warehouse.warehouseAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          warehouse.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          warehouse.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
  }, [searchQuery, data])

  // Handle filter change
  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType)

    let filtered = [...data]
    switch (filterType) {
      case 'default':
        filtered = data.filter(w => w.status === 'default')
        break
      case 'alternate':
        filtered = data.filter(w => w.status === 'alternate')
        break
      case 'all':
      default:
        filtered = data
        break
    }

    setFilteredData(filtered)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
    setFilterOpen(false)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilter('all')
    setFilteredData(data)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
    setFilterOpen(false)
  }

  // Update page count when data changes
  useEffect(() => {
    setPageCount(Math.ceil(filteredData?.length / pagination?.pageSize) || 1)
  }, [filteredData, pagination.pageSize])

  const handleAddWarehouse = () => {
    if (onAddWarehouse) {
      onAddWarehouse()
    } else {
      toast.info('Add warehouse feature coming soon')
    }
  }

  const handleExportWarehouses = () => {
    if (onExport) {
      onExport()
    } else {
      toast.info('Export warehouses feature coming soon')
    }
  }

  const handleEditWarehouse = (warehouseId: string) => {
    if (onEditWarehouse) {
      onEditWarehouse(warehouseId)
    } else {
      toast.info('Edit warehouse feature coming soon')
    }
  }

  const handleDeleteWarehouse = (warehouseId: string) => {
    show(DeleteProductConfirmationModal, {
      title: 'Are you sure you want to delete this warehouse?',
      description: 'Removing this warehouse will erase all stored information about it from your dashboard.',
      actionText: 'Delete Warehouse',
    }).then(() => {
      if (onDeleteWarehouse) {
        onDeleteWarehouse(warehouseId)
        if (refetch) refetch()
      } else {
        toast.info('Delete warehouse feature coming soon')
      }
    })
  }

  const handleSetDefaultWarehouse = (warehouseId: string) => {
    if (onSetDefaultWarehouse) {
      onSetDefaultWarehouse(warehouseId)
      if (refetch) refetch()
    } else {
      toast.info('Set default warehouse feature coming soon')
    }
  }

  const warehouseColumns = useMemo(
    () =>
      createWarehouseTableColumns({
        onEdit: handleEditWarehouse,
        onDelete: handleDeleteWarehouse,
        onSetDefault: handleSetDefaultWarehouse,
      }),
    [handleEditWarehouse, handleDeleteWarehouse, handleSetDefaultWarehouse]
  )

  return (
    <div className='w-full bg-background'>
      {/* Header Section */}
      <div className='w-full flex justify-end gap-4 mb-[21px]'>
        {/* Action Button */}
        <div className='flex items-center gap-2 flex-wrap justify-end'>
          <Button
            variant="default"
            size='default'
            onClick={handleAddWarehouse}
            className='gap-[10px] text-xs! font-medium bg-[#5C2D0D] hover:bg-[#4A2409] text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black'
          >
            <Plus className='size-[18px]' />
            <span>Add warehouse</span>
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className='bg-card w-full rounded-[10px] shadow-md'>
        <TableToolbar
          title='Warehouses'
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={handleExportWarehouses}
          filterControl={
            <FilterMenu
              options={WAREHOUSE_OPTIONS}
              value={activeFilter}
              onChange={handleFilterChange}
            />
          }
        />
        <DataTable
          columns={warehouseColumns}
          data={filteredData}
          isLoading={isLoading}
          isFetching={isFetching}
          isSuccess={isSuccess}
          isError={isError}
          error={error}
          pagination={pagination}
          setPagination={setPagination}
          pageCount={pageCount}
          emptyMessage='Warehouses will show up here once you add one.'
        />
      </div>
    </div>
  )
}

export default WarehouseTableTemplate
