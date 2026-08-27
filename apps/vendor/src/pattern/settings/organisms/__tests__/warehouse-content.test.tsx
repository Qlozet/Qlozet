import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const useGetBusinessWarehousesQuery = vi.fn();

// The table itself is not under test — capture the rows the organism maps.
let rows: any[] = [];
vi.mock('../../templates/warehouse-table-template', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => {
    rows = data;
    return null;
  },
}));

vi.mock('@/redux/services/settings/settings.api-slice', () => ({
  useGetBusinessProfileQuery: () => ({ data: { business_name: 'Aso Oke Co' } }),
}));

vi.mock('@/redux/services/business/business.api-slice', () => ({
  useGetBusinessWarehousesQuery: () => useGetBusinessWarehousesQuery(),
  useDeleteBusinessWarehouseMutation: () => [vi.fn()],
  useActivateBusinessWarehouseMutation: () => [vi.fn()],
}));

vi.mock('../add-warehouse-modal', () => ({ AddWarehouseModal: () => null }));

import { WarehouseContent } from '../warehouse-content';

const withWarehouses = (data: any[]) => {
  useGetBusinessWarehousesQuery.mockReturnValue({
    data,
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  });
};

beforeEach(() => {
  rows = [];
  useGetBusinessWarehousesQuery.mockReset();
});

describe('WarehouseContent', () => {
  // Regression: this read `is_active`, which the Warehouse record does not
  // carry — so every warehouse, active or not, rendered as inactive.
  it('reads the active badge off `status`', () => {
    withWarehouses([
      { _id: 'w1', name: 'Lagos', status: 'active' },
      { _id: 'w2', name: 'Kano', status: 'inactive' },
    ]);
    render(<WarehouseContent />);
    expect(rows.map((r) => r.status)).toEqual(['default', 'alternate']);
  });

  it('treats an absent status as active, the way the schema defaults it', () => {
    withWarehouses([{ _id: 'w1', name: 'Lagos' }]);
    render(<WarehouseContent />);
    expect(rows[0].status).toBe('default');
  });

  it('fills the vendor column from the signed-in business', () => {
    withWarehouses([
      { _id: 'w1', name: 'Lagos', address: '12 Marina', contact_name: 'Ada' },
    ]);
    render(<WarehouseContent />);
    expect(rows[0]).toMatchObject({
      warehouseName: 'Lagos',
      vendorName: 'Aso Oke Co',
      warehouseAddress: '12 Marina',
      contactName: 'Ada',
      // Nothing was sent for these, so they dash rather than render blank.
      phoneNumber: '—',
      email: '—',
    });
  });
});
