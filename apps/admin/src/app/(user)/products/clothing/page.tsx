'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/routes';
import { ProductsStats } from '@/pattern/products/templates/products-stats';
import { VariantProductsTemplate } from '@/pattern/products/templates/variant-products-template';
import { useProductCatalogue } from '@/pattern/products/hooks/use-product-catalogue';

export default function ClothingPage() {
  const catalogue = useProductCatalogue('clothing');

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Header action */}
      <div className="flex justify-end">
        <Button asChild className="h-11 gap-2 rounded-lg px-5 text-sm">
          <Link href={APP_ROUTES.productsAdd}>
            Add new product
            <Plus className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Summary metrics + sales donut */}
      <ProductsStats
        totalProducts={catalogue.stats?.total_products ?? catalogue.totalCount}
        archivedProducts={catalogue.stats?.archived_products}
        isLoading={catalogue.isLoadingStats}
        salesTitle="Sales By Product Category"
        salesData={catalogue.stats?.sales_by_category}
        viewAllLink={APP_ROUTES.productsCloth}
      />

      {/* Clothing products table */}
      <VariantProductsTemplate
        title="Clothing"
        emptyMessage="No clothing products found."
        exportName="clothing"
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
