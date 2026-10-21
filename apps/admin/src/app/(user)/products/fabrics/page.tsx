'use client';

import { APP_ROUTES } from '@/lib/routes';
import { ProductsStats } from '@/pattern/products/templates/products-stats';
import { FabricProductsTemplate } from '@/pattern/products/templates/fabric-products-template';
import { useProductCatalogue } from '@/pattern/products/hooks/use-product-catalogue';

export default function FabricsPage() {
  const catalogue = useProductCatalogue('fabric');

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* No Add here: listings are created by vendors in their own store.
          The team reviews and tidies them (row actions → Edit listing). */}
      {/* Summary metrics + sales donut */}
      <ProductsStats
        totalProducts={catalogue.stats?.total_products ?? catalogue.totalCount}
        archivedProducts={catalogue.stats?.archived_products}
        changes={catalogue.stats?.changes}
        isLoading={catalogue.isLoadingStats}
        salesTitle="Sales By Product Category"
        salesData={catalogue.stats?.sales_by_category}
        viewAllLink={APP_ROUTES.productsFabrics}
      />

      {/* Fabric products table */}
      <FabricProductsTemplate
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
