// Warehouse Content - Organism
// Warehouse section with table and actions

'use client'

import React, { useState, useEffect } from 'react'
import WarehouseTableTemplate from '../templates/warehouse-table-template'
import { Warehouse } from '../molecules/warehouse-table-columns'
import { useGetWarehouseQuery } from '@/redux/services/settings/settings.api-slice'
import { toast } from 'sonner'
import { show } from '@ebay/nice-modal-react'
import { AddWarehouseModal } from './add-warehouse-modal'
import { mockWarehouses } from '@/lib/mocks'

export const WarehouseContent: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  const {
    data: warehouseData,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetWarehouseQuery()

  // Transform API data to match Warehouse interface
  useEffect(() => {
    if (warehouseData?.data?.data?.formattedWarehouses) {
      const transformedWarehouses: Warehouse[] =
        warehouseData.data.data.formattedWarehouses?.map((item: any) => ({
          _id: item._id || item.warehouseName,
          warehouseName: item.warehouseName,
          vendorName: item.vendorName,
          warehouseAddress: item.warehouseAddress,
          contactName: item.contactName,
          phoneNumber: item.contactPhoneNumber || '+234 8123456789',
          email: item.contactEmail,
          status: item.warehouseStatus === 'default' ? 'default' : 'alternate',
        }))
      setWarehouses(transformedWarehouses)
    } else if (!isLoading && !isFetching) {
      // Use mock data if API returns no data or fails
      setWarehouses(mockWarehouses)
    }
  }, [warehouseData, isLoading, isFetching])

  const handleAddWarehouse = () => {
    show(AddWarehouseModal, {
      onWarehouseAdded: () => {
        refetch()
      },
    })
  }

  const handleEditWarehouse = (warehouseId: string) => {
    toast.info('Edit warehouse feature coming soon')
  }

  const handleDeleteWarehouse = (warehouseId: string) => {
    toast.info('Delete warehouse feature coming soon')
  }

  const handleSetDefaultWarehouse = (warehouseId: string) => {
    toast.info('Set default warehouse feature coming soon')
  }

  const handleExport = () => {
    toast.info('Export warehouses feature coming soon')
  }

  return (
    <WarehouseTableTemplate
      data={warehouses}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      onAddWarehouse={handleAddWarehouse}
      onEditWarehouse={handleEditWarehouse}
      onDeleteWarehouse={handleDeleteWarehouse}
      onSetDefaultWarehouse={handleSetDefaultWarehouse}
      onExport={handleExport}
      refetch={refetch}
    />
  )
}
