'use client';

import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import {
  productActionsColumn,
  productSelectColumn,
} from './product-row-columns';
import { Product } from '@/redux/services/products/products.api-slice';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Helper function to get status variant
const getStatusVariant = (
  status: string
):
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'error'
  | 'blue' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    case 'draft':
      return 'warning';
    case 'scheduled':
      return 'blue';
    default:
      return 'secondary';
  }
};

// Helper function to get status label
const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Helper to get audience from tags
const getAudience = (tags?: string[]): string => {
  if (!tags || tags?.length === 0) return '-';
  if (tags.includes('women') || tags.includes('female')) return 'Women';
  if (tags.includes('men') || tags.includes('male')) return 'Men';
  if (tags.includes('unisex')) return 'Unisex';
  return tags[0] || '-';
};

interface ClothingTableColumnsProps {
  onViewDetails: (productId: string) => void;
  onEdit: (productId: string) => void;
  onDuplicate?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onStatusChange?: (
    productId: string,
    status: 'active' | 'draft' | 'inactive' | 'scheduled'
  ) => void;
  showSelect?: boolean;
}

export const AccessoriesTableColumns = ({
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
  showSelect = false,
}: ClothingTableColumnsProps): ColumnDef<Product>[] => [
  ...(showSelect ? [productSelectColumn()] : []),
  {
    accessorKey: 'images',
    header: 'Picture',
    cell: ({ row }) => {
      const images = row.getValue('images') as string[];
      const productName = row.original.name;
      return (
        <div className="relative bg-white w-[51px] h-[31px] border-[0.5px] rounded-[8px] overflow-hidden">
          {images && images?.length > 0 ? (
            <Image
              src={images[0]}
              alt={productName}
              fill
              className="object-cover"
              sizes="150px"
              quality={100}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-xs">No img</span>
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Product name',
    cell: ({ row }) => {
      // Long names truncate; the full name shows on hover.
      const name = String(row.getValue('name') ?? '');
      return (
        <div className="max-w-[240px] truncate font-normal" title={name}>
          {name}
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: 'Product price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      return <div className="font-normal">{formatCurrency(price, 'NGN')}</div>;
    },
  },
  {
    accessorKey: 'category',
    header: 'Product Type',
    cell: ({ row }) => {
      return (
        <div className="capitalize">{row.getValue('category') || '-'}</div>
      );
    },
  },
  {
    id: 'audience',
    header: 'Audience',
    cell: ({ row }) => {
      return <div>{getAudience(row.original.tags)}</div>;
    },
    enableSorting: false,
  },
  {
    id: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const stock = row.original.stock;
      const variants = row.original.variants;
      const variantCount = variants ? variants?.length : 1;

      const stockBadgeVariant =
        stock <= 0 ? 'destructive' : stock <= 5 ? 'warning' : 'success';

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={stockBadgeVariant}
            shape="square"
            className="w-fit min-w-[19px] h-[16px] flex items-center justify-center p-0 text-xs rounded-[4px]!"
          >
            {stock}
          </Badge>
          <span className="text-sm">in</span>
          <Badge
            variant="outline"
            shape="square"
            className="bg-accent w-fit min-w-[19px] h-[16px] flex items-center justify-center p-0 rounded-[4px]!"
          >
            {variantCount}
          </Badge>
          <span className="text-sm">Variants</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Product Status',
    cell: ({ row }) => {
      const status: string = row.getValue('status');
      const moderation = (row.original as any).moderation as
        | { status?: string; reason?: string | null }
        | undefined;
      const review =
        moderation?.status === 'rejected'
          ? { label: 'Changes requested', variant: 'error' as const }
          : status === 'active' &&
              (moderation?.status ?? 'pending') === 'pending'
            ? { label: 'Under review', variant: 'warning' as const }
            : null;
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge
            variant={getStatusVariant(status)}
            shape="square"
            className="capitalize h-[26px] w-[93px] flex items-center justify-center px-2 text-xs font-normal"
          >
            {getStatusLabel(status)}
          </Badge>
          {review && (
            <Badge
              variant={review.variant}
              shape="square"
              title={moderation?.reason ?? undefined}
              className="h-[22px] px-2 text-[11px] font-normal"
            >
              {review.label}
            </Badge>
          )}
        </div>
      );
    },
  },
  productActionsColumn({ onViewDetails, onEdit, onDelete, onStatusChange }),
];
