// Warehouse Content - Organism
// Warehouse section: list, add, edit, delete and set-default, all backed by
// the real /business/warehouse endpoints.

'use client';

import React, { useMemo } from 'react';
import { show } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import WarehouseTableTemplate from '../templates/warehouse-table-template';
import { Warehouse } from '../molecules/warehouse-table-columns';
import { useGetBusinessProfileQuery } from '@/redux/services/settings/settings.api-slice';
import {
  useActivateBusinessWarehouseMutation,
  useDeleteBusinessWarehouseMutation,
  useGetBusinessWarehousesQuery,
  type Warehouse as BusinessWarehouse,
} from '@/redux/services/business/business.api-slice';
import { AddWarehouseModal } from './add-warehouse-modal';
import { readApiError } from '@/redux/services/types';

const text = (value: unknown): string =>
  typeof value === 'string' && value.trim() ? value.trim() : '—';

export const WarehouseContent: React.FC = () => {
  const {
    data: warehouseData,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetBusinessWarehousesQuery();

  // Warehouses belong to the signed-in business, so the "Vendor's name" column
  // is that business — the warehouse record itself doesn't carry a name.
  const { data: business } = useGetBusinessProfileQuery();

  const [deleteWarehouse] = useDeleteBusinessWarehouseMutation();
  const [activateWarehouse] = useActivateBusinessWarehouseMutation();

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
        // The record carries `status`, not `is_active`. It defaults to
        // 'active' server-side, so an absent value is active, not inactive.
        status: item.status === 'inactive' ? 'alternate' : 'default',
      })),
    [warehouseData, business?.business_name]
  );

  const handleAddWarehouse = () => show(AddWarehouseModal);

  const handleEditWarehouse = (warehouseId: string) => {
    const warehouse = warehouseData?.find((item) => item._id === warehouseId);
    if (!warehouse) return;
    show(AddWarehouseModal, { warehouse });
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    try {
      await deleteWarehouse(warehouseId).unwrap();
      toast.success('Warehouse deleted');
    } catch (error: any) {
      toast.error(readApiError(error, 'Failed to delete warehouse'));
    }
  };

  const handleSetDefaultWarehouse = async (warehouseId: string) => {
    try {
      await activateWarehouse(warehouseId).unwrap();
      toast.success('Default warehouse updated');
    } catch (error: any) {
      toast.error(readApiError(error, 'Failed to set default warehouse'));
    }
  };

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
  );
};
