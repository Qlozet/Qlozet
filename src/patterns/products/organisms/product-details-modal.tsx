// Product Details Modal - Organism
// Modal for displaying detailed product information with management actions

import React, { useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { ProductDetailsCard } from '../molecules/product-details-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useGetProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '@/redux/services/products/products.api-slice';
import { Loader2, X, Edit, Copy, Trash2, Eye, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProductDetailsModalProps {
  productId: string;
  onProductUpdated?: () => void;
  onProductDeleted?: () => void;
  onEdit?: (productId: string) => void;
  onDuplicate?: (productId: string) => void;
}

export const ProductDetailsModal = create<ProductDetailsModalProps>(
  ({ productId, onProductUpdated, onProductDeleted, onEdit, onDuplicate }) => {
    const { visible, resolve, remove } = useModal();
    const [activeTab, setActiveTab] = useState('details');

    const {
      data: productResponse,
      isLoading,
      error,
    } = useGetProductQuery(productId, {
      skip: !productId || !visible,
    });

    const [updateProduct, { isLoading: isUpdating }] =
      useUpdateProductMutation();
    const [deleteProduct, { isLoading: isDeleting }] =
      useDeleteProductMutation();

    const product = productResponse?.data;

    const handleCloseModal = () => {
      resolve({ resolved: true });
      remove();
    };

    const handleEdit = () => {
      if (product) {
        onEdit?.(product._id);
        handleCloseModal();
      }
    };

    const handleDuplicate = () => {
      if (product) {
        onDuplicate?.(product._id);
        handleCloseModal();
      }
    };

    const handleStatusToggle = async () => {
      if (!product) return;

      const newStatus = product.status === 'active' ? 'inactive' : 'active';

      try {
        await updateProduct({
          _id: product._id,
          status: newStatus,
        }).unwrap();

        toast.success(
          `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
        );
        onProductUpdated?.();
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to update product status');
      }
    };

    const handleDelete = async () => {
      if (!product) return;

      if (
        !confirm(
          'Are you sure you want to delete this product? This action cannot be undone.'
        )
      ) {
        return;
      }

      try {
        await deleteProduct(product._id).unwrap();
        toast.success('Product deleted successfully');
        onProductDeleted?.();
        handleCloseModal();
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to delete product');
      }
    };

    if (error) {
      return (
        <Dialog open={visible} onOpenChange={handleCloseModal}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
            </DialogHeader>
            <div className='p-6 text-center'>
              <p className='text-red-600'>Failed to load product details</p>
              <Button onClick={handleCloseModal} className='mt-4'>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog open={visible} onOpenChange={handleCloseModal}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden'>
          <DialogHeader>
            <div className='flex items-center justify-between'>
              <DialogTitle>
                {isLoading ? 'Loading...' : 'Product Details'}
              </DialogTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCloseModal}
                className='h-8 w-8 p-0'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </DialogHeader>

          <div className='overflow-y-auto max-h-[70vh]'>
            {isLoading ? (
              <div className='flex items-center justify-center p-12'>
                <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
                <span className='ml-2 text-gray-600'>
                  Loading product details...
                </span>
              </div>
            ) : product ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='space-y-6'
              >
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='details'>Product Details</TabsTrigger>
                  <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                  <TabsTrigger value='history'>History</TabsTrigger>
                </TabsList>

                <TabsContent value='details' className='space-y-4'>
                  <ProductDetailsCard product={product} />

                  {/* Action Buttons */}
                  <div className='flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg'>
                    <Button
                      onClick={handleEdit}
                      className='flex items-center space-x-2'
                    >
                      <Edit className='h-4 w-4' />
                      <span>Edit Product</span>
                    </Button>

                    {onDuplicate && (
                      <Button
                        variant='outline'
                        onClick={handleDuplicate}
                        className='flex items-center space-x-2'
                      >
                        <Copy className='h-4 w-4' />
                        <span>Duplicate</span>
                      </Button>
                    )}

                    <Button
                      variant={
                        product.status === 'active' ? 'secondary' : 'default'
                      }
                      onClick={handleStatusToggle}
                      disabled={isUpdating}
                      className='flex items-center space-x-2'
                    >
                      <Eye className='h-4 w-4' />
                      <span>
                        {product.status === 'active'
                          ? 'Deactivate'
                          : 'Activate'}
                      </span>
                    </Button>

                    <Button
                      variant='destructive'
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className='flex items-center space-x-2'
                    >
                      <Trash2 className='h-4 w-4' />
                      <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value='analytics' className='space-y-4'>
                  <div className='bg-white rounded-lg border p-6'>
                    <div className='flex items-center space-x-2 mb-4'>
                      <BarChart3 className='h-5 w-5 text-blue-500' />
                      <h3 className='text-lg font-semibold'>
                        Product Analytics
                      </h3>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                      <div className='text-center p-4 bg-gray-50 rounded-lg'>
                        <p className='text-2xl font-bold text-blue-600'>0</p>
                        <p className='text-sm text-gray-600'>Total Views</p>
                      </div>
                      <div className='text-center p-4 bg-gray-50 rounded-lg'>
                        <p className='text-2xl font-bold text-green-600'>0</p>
                        <p className='text-sm text-gray-600'>Total Orders</p>
                      </div>
                      <div className='text-center p-4 bg-gray-50 rounded-lg'>
                        <p className='text-2xl font-bold text-purple-600'>$0</p>
                        <p className='text-sm text-gray-600'>Total Revenue</p>
                      </div>
                    </div>
                    <div className='mt-6 text-center text-gray-500'>
                      <p>
                        Analytics data will be available once the product starts
                        receiving traffic
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='history' className='space-y-4'>
                  <div className='bg-white rounded-lg border p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Product History
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                          <Edit className='h-4 w-4 text-blue-600' />
                        </div>
                        <div>
                          <p className='font-medium'>Product Created</p>
                          <p className='text-sm text-gray-500'>
                            {new Date(product.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {product.updatedAt !== product.createdAt && (
                        <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                          <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                            <Edit className='h-4 w-4 text-green-600' />
                          </div>
                          <div>
                            <p className='font-medium'>Product Updated</p>
                            <p className='text-sm text-gray-500'>
                              {new Date(product.updatedAt).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className='text-center py-8'>
                <p className='text-gray-500'>Product not found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
