// Product Details Card - Molecule
// Displays detailed product information in a card format

import React from 'react';
import { ProductImage } from '../atoms/product-image';
import { ProductStatusBadge } from '../atoms/product-status-badge';
import { ProductPrice } from '../atoms/product-price';
import { StockIndicator } from '../atoms/stock-indicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Tag, Calendar, Edit, Palette, Ruler } from 'lucide-react';
import { format } from 'date-fns';

interface ProductVariant {
  _id: string;
  size?: string;
  color?: string;
  material?: string;
  additionalPrice: number;
  stock: number;
}

interface ProductCustomization {
  _id: string;
  name: string;
  options: string[];
  additionalPrice: number;
}

interface ProductDetailsData {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  stock: number;
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  category: string;
  tags: string[];
  variants?: ProductVariant[];
  customizations?: ProductCustomization[];
  createdAt: string;
  updatedAt: string;
}

interface ProductDetailsCardProps {
  product: ProductDetailsData;
  className?: string;
}

export const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({
  product,
  className,
}) => {
  const totalStock =
    product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ||
    product.stock;
  const variantCount = product.variants?.length || 0;
  const customizationCount = product.customizations?.length || 0;

  return (
    <Card className={className}>
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-xl font-semibold'>
              {product.name}
            </CardTitle>
            <p className='text-sm text-gray-500 mt-1'>
              Created on {format(new Date(product.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <ProductStatusBadge status={product.status} />
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Product Images */}
        {product.images.length > 0 && (
          <div>
            <div className='flex items-center space-x-2 mb-3'>
              <Package className='h-4 w-4 text-gray-400' />
              <h3 className='font-medium'>Product Images</h3>
            </div>
            <div className='flex space-x-3 overflow-x-auto'>
              {product.images.slice(0, 4).map((image, index) => (
                <ProductImage
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  size='lg'
                  className='flex-shrink-0'
                />
              ))}
              {product.images.length > 4 && (
                <div className='flex-shrink-0 h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center'>
                  <span className='text-sm text-gray-500'>
                    +{product.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            <h3 className='font-medium mb-3'>Basic Information</h3>
            <div className='space-y-3'>
              <div>
                <span className='text-sm text-gray-500'>Price:</span>
                <div className='mt-1'>
                  <ProductPrice price={product.price} size='lg' />
                </div>
              </div>

              <div>
                <span className='text-sm text-gray-500'>Stock:</span>
                <div className='mt-1'>
                  <StockIndicator stock={totalStock} />
                </div>
              </div>

              <div>
                <span className='text-sm text-gray-500'>Category:</span>
                <p className='mt-1 font-medium'>{product.category}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-3'>Additional Info</h3>
            <div className='space-y-3'>
              <div>
                <span className='text-sm text-gray-500'>Variants:</span>
                <p className='mt-1 font-medium'>
                  {variantCount > 0
                    ? `${variantCount} variants`
                    : 'No variants'}
                </p>
              </div>

              <div>
                <span className='text-sm text-gray-500'>Customizations:</span>
                <p className='mt-1 font-medium'>
                  {customizationCount > 0
                    ? `${customizationCount} options`
                    : 'No customizations'}
                </p>
              </div>

              <div>
                <span className='text-sm text-gray-500'>Last Updated:</span>
                <p className='mt-1 font-medium'>
                  {format(new Date(product.updatedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h3 className='font-medium mb-2'>Description</h3>
            <p className='text-gray-600 text-sm leading-relaxed'>
              {product.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div>
            <div className='flex items-center space-x-2 mb-2'>
              <Tag className='h-4 w-4 text-gray-400' />
              <h3 className='font-medium'>Tags</h3>
            </div>
            <div className='flex flex-wrap gap-2'>
              {product.tags.map((tag, index) => (
                <Badge key={index} variant='secondary'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div>
            <div className='flex items-center space-x-2 mb-3'>
              <Palette className='h-4 w-4 text-gray-400' />
              <h3 className='font-medium'>
                Variants ({product.variants.length})
              </h3>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {product.variants.slice(0, 4).map((variant, index) => (
                <div key={variant._id} className='p-3 bg-gray-50 rounded-lg'>
                  <div className='space-y-1 text-sm'>
                    {variant.size && (
                      <div className='flex items-center space-x-1'>
                        <Ruler className='h-3 w-3 text-gray-400' />
                        <span>
                          <strong>Size:</strong> {variant.size}
                        </span>
                      </div>
                    )}
                    {variant.color && (
                      <div className='flex items-center space-x-1'>
                        <div
                          className='w-3 h-3 rounded-full border'
                          style={{
                            backgroundColor: variant.color.toLowerCase(),
                          }}
                        />
                        <span>
                          <strong>Color:</strong> {variant.color}
                        </span>
                      </div>
                    )}
                    {variant.material && (
                      <div>
                        <strong>Material:</strong> {variant.material}
                      </div>
                    )}
                    <div>
                      <strong>Stock:</strong> {variant.stock}
                    </div>
                    {variant.additionalPrice > 0 && (
                      <div>
                        <strong>Additional Price:</strong> +
                        <ProductPrice
                          price={variant.additionalPrice}
                          showCurrency={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {product.variants.length > 4 && (
                <div className='text-gray-500 text-center col-span-full'>
                  +{product.variants.length - 4} more variants
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customizations */}
        {product.customizations && product.customizations.length > 0 && (
          <div>
            <div className='flex items-center space-x-2 mb-3'>
              <Edit className='h-4 w-4 text-gray-400' />
              <h3 className='font-medium'>
                Customizations ({product.customizations.length})
              </h3>
            </div>
            <div className='space-y-3'>
              {product.customizations
                .slice(0, 3)
                .map((customization, index) => (
                  <div
                    key={customization._id}
                    className='p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='font-medium mb-1'>{customization.name}</div>
                    <div className='text-sm text-gray-600'>
                      <strong>Options:</strong>{' '}
                      {customization.options.join(', ')}
                    </div>
                    {customization.additionalPrice > 0 && (
                      <div className='text-sm text-gray-600'>
                        <strong>Additional Price:</strong> +
                        <ProductPrice
                          price={customization.additionalPrice}
                          showCurrency={false}
                        />
                      </div>
                    )}
                  </div>
                ))}
              {product.customizations.length > 3 && (
                <div className='text-gray-500 text-center'>
                  +{product.customizations.length - 3} more customizations
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
