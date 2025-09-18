// Product Table Row - Molecule
// Individual row component for product table

import React from 'react';
import { ProductImage } from '../atoms/product-image';
import { ProductStatusBadge } from '../atoms/product-status-badge';
import { ProductPrice } from '../atoms/product-price';
import { StockIndicator } from '../atoms/stock-indicator';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Eye, Edit, MoreHorizontal, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ProductVariant {
  _id: string;
  size?: string;
  color?: string;
  material?: string;
  additionalPrice: number;
  stock: number;
}

interface ProductRowData {
  _id: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  category: string;
  tags: string[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

interface ProductTableRowProps {
  product: ProductRowData;
  onViewDetails: (productId: string) => void;
  onEdit: (productId: string) => void;
  onDuplicate?: (productId: string) => void;
  onStatusChange: (productId: string, newStatus: boolean) => void;
  isSelected?: boolean;
  onSelect?: (productId: string, selected: boolean) => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onViewDetails,
  onEdit,
  onDuplicate,
  onStatusChange,
  isSelected = false,
  onSelect,
}) => {
  const handleViewDetails = () => {
    onViewDetails(product._id);
  };

  const handleEdit = () => {
    onEdit(product._id);
  };

  const handleDuplicate = () => {
    onDuplicate?.(product._id);
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(product._id, event.target.checked);
  };

  const handleStatusToggle = (checked: boolean) => {
    onStatusChange(product._id, checked);
  };

  const isActive = product.status === 'active';
  const variantCount = product.variants?.length || 0;
  const totalStock =
    product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ||
    product.stock;

  return (
    <tr className='hover:bg-gray-50 transition-colors'>
      {onSelect && (
        <td className='px-6 py-4 whitespace-nowrap'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={handleSelect}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          />
        </td>
      )}

      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center space-x-3'>
          <ProductImage src={product.images[0]} alt={product.name} size='md' />
          <div>
            <p className='font-medium text-gray-900 truncate max-w-48'>
              {product.name}
            </p>
            <p className='text-sm text-gray-500'>{product.category}</p>
          </div>
        </div>
      </td>

      <td className='px-6 py-4 whitespace-nowrap'>
        <ProductPrice price={product.price} size='md' />
      </td>

      <td className='px-6 py-4 whitespace-nowrap'>
        <StockIndicator stock={totalStock} showText={false} />
      </td>

      <td className='px-6 py-4 whitespace-nowrap'>
        <ProductStatusBadge status={product.status} />
      </td>

      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex flex-wrap gap-1'>
          {product.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant='secondary' className='text-xs'>
              {tag}
            </Badge>
          ))}
          {product.tags.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{product.tags.length - 2}
            </Badge>
          )}
        </div>
      </td>

      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
        {variantCount > 0 ? `${variantCount} variants` : 'No variants'}
      </td>

      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
        {format(new Date(product.createdAt), 'MMM d, yyyy')}
      </td>

      <td className='px-6 py-4 whitespace-nowrap'>
        <Switch
          checked={isActive}
          onCheckedChange={handleStatusToggle}
          disabled={product.status === 'out_of_stock'}
        />
      </td>

      <td className='px-6 py-4 whitespace-nowrap text-right space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleViewDetails}
          className='flex items-center space-x-1'
        >
          <Eye className='h-3 w-3' />
          <span>View</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className='h-4 w-4 mr-2' />
                Duplicate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};
