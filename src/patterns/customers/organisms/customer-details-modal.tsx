// Customer Details Modal - Organism
// Modal for displaying detailed customer information and order history

import React, { useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { CustomerDetailsCard } from '../molecules/customer-details-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetCustomerQuery } from '@/redux/services/customers/customers.api-slice';
import { Loader2, X } from 'lucide-react';

interface CustomerDetailsModalProps {
  customerId: string;
}

export const CustomerDetailsModal = create<CustomerDetailsModalProps>(({ customerId }) => {
  const { visible, resolve, remove } = useModal();
  const [activeTab, setActiveTab] = useState('details');

  const { 
    data: customerResponse, 
    isLoading, 
    error 
  } = useGetCustomerQuery(customerId, {
    skip: !customerId || !visible,
  });

  const customer = customerResponse?.data;

  const handleCloseModal = () => {
    resolve({ resolved: true });
    remove();
  };

  if (error) {
    return (
      <Dialog open={visible} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <p className="text-red-600">Failed to load customer details</p>
            <Button onClick={handleCloseModal} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={visible} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isLoading ? 'Loading...' : `Customer Details`}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCloseModal}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading customer details...</span>
            </div>
          ) : customer ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <CustomerDetailsCard customer={customer} />
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Order History</h3>
                  {customer.orders?.length ? (
                    <div className="space-y-3">
                      {customer.orders.map((orderId, index) => (
                        <div key={orderId} className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600">Order #{index + 1}</p>
                          <p className="text-xs text-gray-500">Order ID: {orderId}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No orders found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        This customer hasn't placed any orders yet
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Customer activity will appear here
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Customer not found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});