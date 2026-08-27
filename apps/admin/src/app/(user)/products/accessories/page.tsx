'use client';

import NiceModal from '@ebay/nice-modal-react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/routes';
import { ProductsStats } from '@/pattern/products/templates/products-stats';
import { VariantProductsTemplate } from '@/pattern/products/templates/variant-products-template';
import { AddAccessoryModal } from '@/pattern/products/organisms/add-accessory-modal';
import { useProductCatalogue } from '@/pattern/products/hooks/use-product-catalogue';

export default function AccessoriesPage() {
  const catalogue = useProductCatalogue('accessory');

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Header actions */}
      <div className="flex justify-end gap-3">
        {/* No Import Products action: the backend has no bulk product import
            endpoint, so there is nothing an import dialog could submit to. */}
        <Button
          onClick={() => NiceModal.show(AddAccessoryModal)}
          className="h-11 gap-2 rounded-lg px-5 text-sm"
        >
          Add new product
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Summary metrics + sales donut */}
      <ProductsStats
        totalProducts={catalogue.stats?.total_products ?? catalogue.totalCount}
        archivedProducts={catalogue.stats?.archived_products}
        isLoading={catalogue.isLoadingStats}
        salesTitle="Sales By Product Category"
        salesData={catalogue.stats?.sales_by_category}
        viewAllLink={APP_ROUTES.productsAccessories}
      />

      {/* Accessories table */}
      <VariantProductsTemplate
        title="Accessories"
        emptyMessage="No accessories found."
        exportName="accessories"
        products={catalogue.products}
        isLoading={catalogue.isLoading}
        isFetching={catalogue.isFetching}
        isSuccess={catalogue.isSuccess}
        isError={catalogue.isError}
        error={catalogue.error}
        search={catalogue.search}
        onSearchChange={catalogue.setSearch}
        filters={catalogue.filters}
        onFiltersChange={catalogue.setFilters}
        filterOptions={catalogue.filterOptions}
        isLoadingFilters={catalogue.isLoadingFilters}
        pagination={catalogue.pagination}
        setPagination={catalogue.setPagination}
        pageCount={catalogue.pageCount}
        totalRows={catalogue.totalCount}
      />
    </div>
  );
}
