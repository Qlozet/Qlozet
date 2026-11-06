'use client';

import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import {
  productActionsColumn,
  productSelectColumn,
} from './product-row-columns';
import { Product } from '@/redux/services/products/products.api-slice';
import { AlertTriangle } from 'lucide-react';
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

// Helper to get customization label
const getCustomizationLabel = (product: Product): React.ReactNode => {
  const hasStyles = product.customizations && product.customizations.length > 0;
  if (product.type === 'customize') {
    if (!hasStyles && product.status === 'draft') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
          Customisable <AlertTriangle className="size-3" />
        </span>
      );
    }
    return 'Customisable';
  }
  return 'Non Customisable';
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

export const createFabricTableColumns = ({
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
    id: 'pricePerYard',
    header: 'Price',
    cell: ({ row }) => {
      const r = row.original as any;
      const price = parseFloat(r.pricePerYard || r.price || 0);
      const piece =
        (r.soldBy === 'piece' || r.soldBy === 'both') && r.piecePrice
          ? `${formatCurrency(Number(r.piecePrice), 'NGN')} / ${r.pieceYards}-yd piece`
          : null;
      return (
        <div className="font-normal">
          {r.soldBy === 'piece' && piece ? (
            piece
          ) : (
            <>
              {formatCurrency(price, 'NGN')} / yd
              {piece && (
                <span className="block text-xs text-muted-foreground">
                  {piece}
                </span>
              )}
            </>
          )}
        </div>
      );
    },
  },
  {
    id: 'pattern',
    header: 'Pattern',
    cell: ({ row }) => {
      return (
        <div className="capitalize text-sm">
          {(row.original as any).pattern || '-'}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'material',
    header: 'Material',
    cell: ({ row }) => {
      return (
        <div className="capitalize text-sm">
          {(row.original as any).material || '-'}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'colour',
    header: 'Colour',
    cell: ({ row }) => {
      return (
        <div className="capitalize text-sm">
          {(row.original as any).colour || '-'}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const stock = row.original.stock || 0;
      return <span className="text-sm">{stock.toLocaleString()} Yards</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status: string = row.getValue('status');
      const moderation = (row.original as any).moderation as
        | { status?: string; reason?: string | null }
        | undefined;
      // Published is not live until Qlozet has reviewed it; rejected stays
      // hidden whatever the vendor sets. Say so next to the status.
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
