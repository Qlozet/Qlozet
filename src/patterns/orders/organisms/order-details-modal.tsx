// Order Details Modal - Organism
// Modal for displaying detailed order information with actions

import React, { useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { OrderDetailsCard } from '../molecules/order-details-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useGetOrderQuery,
  useUpdateOrderMutation,
} from '@/redux/services/orders/orders.api-slice';
import { Loader2, X, Edit, Truck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OrderDetailsModalProps {
  orderId: string;
  onOrderUpdated?: () => void;
}

export const OrderDetailsModal = create<OrderDetailsModalProps>(
  ({ orderId, onOrderUpdated }) => {
    const { visible, resolve, remove } = useModal();
    const [activeTab, setActiveTab] = useState('details');

    const {
      data: orderResponse,
      isLoading,
      error,
    } = useGetOrderQuery(orderId, {
      skip: !orderId || !visible,
    });

    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

    const order = orderResponse?.data;

    const handleCloseModal = () => {
      resolve({ resolved: true });
      remove();
    };

    const handleUpdateStatus = async (newStatus: string) => {
      if (!order) return;

      try {
        await updateOrder({
          _id: order._id,
          status: newStatus as any,
        }).unwrap();

        toast.success(`Order status updated to ${newStatus}`);
        onOrderUpdated?.();
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to update order status');
      }
    };

    const getStatusActions = () => {
      if (!order) return [];

      const actions = [];

      switch (order.status) {
        case 'pending':
          actions.push(
            <Button
              key='confirm'
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={isUpdating}
              className='flex items-center space-x-2'
            >
              <CheckCircle className='h-4 w-4' />
              <span>Confirm Order</span>
            </Button>
          );
          actions.push(
            <Button
              key='cancel'
              variant='destructive'
              onClick={() => handleUpdateStatus('cancelled')}
              disabled={isUpdating}
              className='flex items-center space-x-2'
            >
              <XCircle className='h-4 w-4' />
              <span>Cancel Order</span>
            </Button>
          );
          break;
        case 'confirmed':
          actions.push(
            <Button
              key='process'
              onClick={() => handleUpdateStatus('processing')}
              disabled={isUpdating}
              className='flex items-center space-x-2'
            >
              <Edit className='h-4 w-4' />
              <span>Start Processing</span>
            </Button>
          );
          break;
        case 'processing':
          actions.push(
            <Button
              key='ship'
              onClick={() => handleUpdateStatus('shipped')}
              disabled={isUpdating}
              className='flex items-center space-x-2'
            >
              <Truck className='h-4 w-4' />
              <span>Mark as Shipped</span>
            </Button>
          );
          break;
        case 'shipped':
          actions.push(
            <Button
              key='deliver'
              onClick={() => handleUpdateStatus('delivered')}
              disabled={isUpdating}
              className='flex items-center space-x-2'
            >
              <CheckCircle className='h-4 w-4' />
              <span>Mark as Delivered</span>
            </Button>
          );
          break;
      }

      return actions;
    };

    if (error) {
      return (
        <Dialog open={visible} onOpenChange={handleCloseModal}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
            </DialogHeader>
            <div className='p-6 text-center'>
              <p className='text-red-600'>Failed to load order details</p>
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
                {isLoading ? 'Loading...' : `Order Details`}
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
                  Loading order details...
                </span>
              </div>
            ) : order ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='space-y-6'
              >
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='details'>Order Details</TabsTrigger>
                  <TabsTrigger value='tracking'>Tracking</TabsTrigger>
                  <TabsTrigger value='history'>History</TabsTrigger>
                </TabsList>

                <TabsContent value='details' className='space-y-4'>
                  <OrderDetailsCard order={order} />

                  {/* Action Buttons */}
                  {getStatusActions().length > 0 && (
                    <div className='flex space-x-2 p-4 bg-gray-50 rounded-lg'>
                      <span className='text-sm font-medium text-gray-700 mr-4 self-center'>
                        Actions:
                      </span>
                      {getStatusActions()}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='tracking' className='space-y-4'>
                  <div className='bg-white rounded-lg border p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Order Tracking
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                          <CheckCircle className='h-4 w-4 text-green-600' />
                        </div>
                        <div>
                          <p className='font-medium'>Order Placed</p>
                          <p className='text-sm text-gray-500'>
                            Your order has been placed
                          </p>
                        </div>
                      </div>

                      {order.status !== 'pending' && (
                        <div className='flex items-center space-x-3'>
                          <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                            <CheckCircle className='h-4 w-4 text-blue-600' />
                          </div>
                          <div>
                            <p className='font-medium'>Order Confirmed</p>
                            <p className='text-sm text-gray-500'>
                              Your order has been confirmed
                            </p>
                          </div>
                        </div>
                      )}

                      {['processing', 'shipped', 'delivered'].includes(
                        order.status
                      ) && (
                        <div className='flex items-center space-x-3'>
                          <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                            <Edit className='h-4 w-4 text-purple-600' />
                          </div>
                          <div>
                            <p className='font-medium'>Processing</p>
                            <p className='text-sm text-gray-500'>
                              Your order is being prepared
                            </p>
                          </div>
                        </div>
                      )}

                      {['shipped', 'delivered'].includes(order.status) && (
                        <div className='flex items-center space-x-3'>
                          <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center'>
                            <Truck className='h-4 w-4 text-indigo-600' />
                          </div>
                          <div>
                            <p className='font-medium'>Shipped</p>
                            <p className='text-sm text-gray-500'>
                              Your order is on the way
                            </p>
                          </div>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className='flex items-center space-x-3'>
                          <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          </div>
                          <div>
                            <p className='font-medium'>Delivered</p>
                            <p className='text-sm text-gray-500'>
                              Your order has been delivered
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='history' className='space-y-4'>
                  <div className='bg-white rounded-lg border p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Order History
                    </h3>
                    <div className='text-center py-8'>
                      <p className='text-gray-500'>No history available</p>
                      <p className='text-gray-400 text-sm mt-1'>
                        Order history and logs will appear here
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className='text-center py-8'>
                <p className='text-gray-500'>Order not found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
