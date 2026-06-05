'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  formatPricePerYard,
  getFabricColour,
  getFabricPattern,
  getFabricSubCategory,
  getFabricYards,
  getProductCategory,
  getProductImage,
  getProductName,
  stockBadgeVariant,
} from '@/lib/products';
import { ProductStatusBadge } from './product-status-badge';
import {
  ProductActionsCell,
  type ProductAction,
} from './product-actions-cell';
import type { Product } from '@/redux/services/products/products.api-slice';

interface FabricProductsColumnsProps {
  onAction?: (action: ProductAction, product: Product) => void;
}

const textCell = (value: string) => (
  <span className="text-sm capitalize text-gray-700">{value}</span>
);

export const createFabricProductsColumns = ({
  onAction,
}: FabricProductsColumnsProps = {}): ColumnDef<Product>[] => [
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
    id: 'pricePerYard',
    header: 'Price per yard',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">
        {formatPricePerYard(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'pattern',
    header: 'Pattern',
    cell: ({ row }) => textCell(getFabricPattern(row.original)),
    enableSorting: false,
  },
  {
    id: 'subCategory',
    header: 'Sub-category',
    cell: ({ row }) => textCell(getFabricSubCategory(row.original)),
    enableSorting: false,
  },
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) => textCell(getProductCategory(row.original)),
    enableSorting: false,
  },
  {
    id: 'colour',
    header: 'Colour',
    cell: ({ row }) => textCell(getFabricColour(row.original)),
    enableSorting: false,
  },
  {
    id: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const yards = getFabricYards(row.original);
      return (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Badge
            variant={stockBadgeVariant(yards)}
            shape="square"
            className="flex h-4 min-w-[19px] items-center justify-center rounded-[4px] p-0 text-xs"
          >
            {yards}
          </Badge>
          <span>Yards</span>
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
