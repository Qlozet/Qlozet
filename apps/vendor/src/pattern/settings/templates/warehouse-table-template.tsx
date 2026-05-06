'use client'

import { useState, useEffect } from 'react'
import { WarehouseTable } from '../organisms/warehouse-table'
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

  return (
    <div className='w-full bg-background'>
      {/* Header Section */}
      <div className='w-full h-[44px] flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4 mb-[21px]'>
        {/* Action Button */}
        <div className='flex items-center gap-2 flex-wrap'>
          <Button
            variant="default"
            size='default'
            onClick={handleAddWarehouse}
            className='gap-[10px] text-xs! font-medium bg-[#5C2D0D] hover:bg-[#4A2409]'
          >
            <Plus className='size-[18px]' />
            <span>Add warehouse</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className='bg-card w-full h-[72px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 rounded-t-[10px] shadow-md'>
        <h3 className='text-base font-medium'>Warehouses</h3>

        <div className='flex items-center gap-3'>
          {/* Filter Popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='default'
                className='bg-transparent gap-2 text-sm! font-medium py-3 rounded-[12px] relative'
              >
                <Filter className='w-4 h-4' />
                <span>Filter By:</span>
                {activeFilter !== 'all' && (
                  <span className='ml-1 font-semibold capitalize'>
                    {activeFilter}
                  </span>
                )}
                <ChevronDown className='w-4 h-4 ml-1' />
                {activeFilter !== 'all' && (
                  <div className='absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full' />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-0' align='start'>
              <div className='p-4 space-y-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-sm'>Filter Warehouses</h4>
                  {activeFilter !== 'all' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleClearFilters}
                      className='h-auto p-1 text-xs text-muted-foreground hover:text-foreground'
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Status Filter */}
                <div className='space-y-3'>
                  <h5 className='text-xs font-medium text-muted-foreground uppercase'>Status</h5>
                  <RadioGroup value={activeFilter} onValueChange={handleFilterChange}>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='all' id='all' />
                      <Label htmlFor='all' className='text-sm font-normal cursor-pointer'>
                        All Warehouses
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='default' id='default' />
                      <Label htmlFor='default' className='text-sm font-normal cursor-pointer'>
                        Default Warehouse
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='alternate' id='alternate' />
                      <Label htmlFor='alternate' className='text-sm font-normal cursor-pointer'>
                        Alternate Warehouses
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Input */}
          <SearchInputWithParams
            placeholder='Search'
            className='w-full sm:w-80'
            inputClassName='h-10 rounded-[12px]'
            paramName='search'
            onSearchChange={setSearchQuery}
          />

          {/* Export */}
          <Button
            variant="default"
            size='default'
            onClick={handleExportWarehouses}
            className='gap-[10px] text-sm font-semibold'
          >
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className='bg-card'>
        <WarehouseTable
          data={filteredData}
          isLoading={isLoading}
          error={error}
          isError={isError}
          isSuccess={isSuccess}
          isFetching={isFetching}
          pageCount={pageCount}
          pagination={pagination}
          setPagination={setPagination}
          onEdit={handleEditWarehouse}
          onDelete={handleDeleteWarehouse}
          onSetDefault={handleSetDefaultWarehouse}
        />
      </div>
    </div>
  )
}

export default WarehouseTableTemplate
