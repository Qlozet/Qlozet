'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  formatProductPrice,
  getProductCategory,
  getProductImage,
  getProductName,
  getProductQuantity,
  getProductTag,
  getProductType,
  stockBadgeVariant,
} from '@/lib/products';
import { ProductStatusBadge } from './product-status-badge';
import {
  ProductActionsCell,
  type ProductAction,
} from './product-actions-cell';
import type { Product } from '@/redux/services/products/products.api-slice';

export type { ProductAction };

interface ClothingProductsColumnsProps {
  onAction?: (action: ProductAction, product: Product) => void;
}

export const createClothingProductsColumns = ({
  onAction,
}: ClothingProductsColumnsProps = {}): ColumnDef<Product>[] => [
  {
    id: 'picture',
    header: 'Picture',
    cell: ({ row }) => {
      const img = getProductImage(row.original);
      return (
        <div className="h-[31px] w-[51px] overflow-hidden rounded-[8px] border border-border bg-gray-50">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={getProductName(row.original)}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'name',
    header: 'Product name',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">
        {getProductName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'price',
    header: 'Product price',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">
        {formatProductPrice(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <span className="text-sm capitalize text-gray-700">
        {getProductCategory(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'productType',
    header: 'Product type',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">
        {getProductType(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'tag',
    header: 'Tag',
    cell: ({ row }) => (
      <span className="text-sm capitalize text-gray-700">
        {getProductTag(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const { stock, variantCount } = getProductQuantity(row.original);
      return (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Badge
            variant={stockBadgeVariant(stock)}
            shape="square"
            className="flex h-4 min-w-[19px] items-center justify-center rounded-[4px] p-0 text-xs"
          >
            {stock}
          </Badge>
          <span>in</span>
          <Badge
            variant="outline"
            shape="square"
            className="flex h-4 min-w-[19px] items-center justify-center rounded-[4px] bg-accent p-0 text-xs"
          >
            {variantCount}
          </Badge>
          <span>Variants</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Product Status',
    cell: ({ row }) => <ProductStatusBadge product={row.original} />,
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <ProductActionsCell product={row.original} onAction={onAction} />
    ),
    enableSorting: false,
  },
];
