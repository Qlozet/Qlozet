// Warehouse Content - Organism
// Warehouse section: list, add, edit, delete and set-default, all backed by
// the real /business/warehouse endpoints.

'use client'

import React, { useMemo } from 'react'
import { show } from '@ebay/nice-modal-react'
import { toast } from 'sonner'
import WarehouseTableTemplate from '../templates/warehouse-table-template'
import { Warehouse } from '../molecules/warehouse-table-columns'
import {
  useActivateBusinessWarehouseMutation,
  useDeleteBusinessWarehouseMutation,
  useGetBusinessProfileQuery,
  useGetBusinessWarehousesQuery,
  type BusinessWarehouse,
} from '@/redux/services/settings/settings.api-slice'
import { AddWarehouseModal } from './add-warehouse-modal'

const text = (value: unknown): string =>
  typeof value === 'string' && value.trim() ? value.trim() : '—'

export const WarehouseContent: React.FC = () => {
  const {
    data: warehouseData,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetBusinessWarehousesQuery()

  // Warehouses belong to the signed-in business, so the "Vendor's name" column
  // is that business — the warehouse record itself doesn't carry a name.
  const { data: business } = useGetBusinessProfileQuery()

  const [deleteWarehouse] = useDeleteBusinessWarehouseMutation()
  const [activateWarehouse] = useActivateBusinessWarehouseMutation()

  const warehouses: Warehouse[] = useMemo(
    () =>
      (warehouseData ?? []).map((item: BusinessWarehouse) => ({
        _id: item._id,
        warehouseName: text(item.name),
        vendorName: text(business?.business_name),
        warehouseAddress: text(item.address),
        contactName: text(item.contact_name),
        phoneNumber: text(item.contact_phone),
        email: text(item.contact_email),
        status: item.is_active ? 'default' : 'alternate',
      })),
    [warehouseData, business?.business_name]
  )

  const handleAddWarehouse = () => show(AddWarehouseModal)

  const handleEditWarehouse = (warehouseId: string) => {
    const warehouse = warehouseData?.find((item) => item._id === warehouseId)
    if (!warehouse) return
    show(AddWarehouseModal, { warehouse })
  }

  const handleDeleteWarehouse = async (warehouseId: string) => {
    try {
      await deleteWarehouse(warehouseId).unwrap()
      toast.success('Warehouse deleted')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete warehouse')
    }
  }

  const handleSetDefaultWarehouse = async (warehouseId: string) => {
    try {
      await activateWarehouse(warehouseId).unwrap()
      toast.success('Default warehouse updated')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to set default warehouse')
    }
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
      refetch={refetch}
    />
  )
}
