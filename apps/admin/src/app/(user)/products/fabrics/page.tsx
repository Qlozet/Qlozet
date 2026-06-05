'use client';

import { useEffect, useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { Download, Plus } from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/routes';
import { ProductsStats } from '@/pattern/products/templates/products-stats';
import { FabricProductsTemplate } from '@/pattern/products/templates/fabric-products-template';
import { AddFabricModal } from '@/pattern/products/organisms/add-fabric-modal';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import type { DonutDatum } from '@/pattern/dashboard/molecules/donut-chart';
import { useGetProductsQuery } from '@/redux/services/products/products.api-slice';

const PAGE_SIZE = 5;

// Sales-by-product-category split shown in the header donut until the backend
// exposes a real breakdown.
const SALES_BY_CATEGORY_FALLBACK: DonutDatum[] = [
  { name: 'Suite', value: 30 },
  { name: 'Kaftan', value: 28 },
  { name: 'Cargo', value: 22 },
  { name: 'Abgada', value: 20 },
];

export default function FabricsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search input so we don't refetch on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetProductsQuery({
      kind: 'fabric',
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: debouncedSearch || undefined,
    });

  const paginated = data?.data;
  const products = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount =
    paginated?.totalCount ?? paginated?.total ?? products.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Header actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => NiceModal.show(WorkInProgressModal)}
          className="h-11 gap-2 rounded-lg px-5 text-sm"
        >
          Import Products
          <Download className="size-4" />
        </Button>
        <Button
          onClick={() => NiceModal.show(AddFabricModal)}
          className="h-11 gap-2 rounded-lg px-5 text-sm"
        >
          Add new product
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Summary metrics + sales donut */}
      <ProductsStats
        totalProducts={totalCount}
        isLoading={isLoading}
        salesTitle="Sales By Product Category"
        salesFallback={SALES_BY_CATEGORY_FALLBACK}
        viewAllLink={APP_ROUTES.productsFabrics}
      />

      {/* Fabric products table */}
      <FabricProductsTemplate
        products={products}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        search={search}
        onSearchChange={setSearch}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
      />
    </div>
  );
}
