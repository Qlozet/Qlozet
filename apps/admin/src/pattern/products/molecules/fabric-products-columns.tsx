'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  formatPricePerYard,
  getFabricColour,
  getFabricMaterial,
  getFabricPattern,
  getFabricYards,
  getProductCategory,
  getProductName,
  getProductVendorName,
  stockBadgeVariant,
} from '@/lib/products';
import { ProductStatusBadge } from './product-status-badge';
import { ProductActionsCell, type ProductAction } from './product-actions-cell';
import { ProductThumbnail } from '../atoms/product-thumbnail';
import type { Product } from '@/redux/services/products/products.api-slice';

interface FabricProductsColumnsProps {
  onAction?: (action: ProductAction, product: Product) => void;
}

const textCell = (value: string) => (
  <span className="text-sm capitalize text-gray-700 dark:text-gray-200">
    {value}
  </span>
);

export const createFabricProductsColumns = ({
  onAction,
}: FabricProductsColumnsProps = {}): ColumnDef<Product>[] => [
  {
    id: 'picture',
    header: 'Picture',
    cell: ({ row }) => <ProductThumbnail product={row.original} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: 'Product name',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-200">
        {getProductName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    // This table spans every vendor on the platform, so whose fabric a row is
    // belongs beside the name. The CSV export has always included it.
    id: 'vendor',
    header: 'Vendor',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-200">
        {getProductVendorName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'pricePerYard',
    header: 'Price per yard',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-200">
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
    // What the fabric IS — cotton, silk, ankara. The vendor console has always
    // shown this; admin had no column for it. It replaces Sub-category, which
    // read overlapping fields to Category (`taxonomy.categories[0]` in both)
    // and so usually rendered the same text twice.
    id: 'material',
    header: 'Material',
    cell: ({ row }) => textCell(getFabricMaterial(row.original)),
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
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
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
    header: 'Status',
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
