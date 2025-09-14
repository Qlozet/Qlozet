// Order Details Card - Molecule
// Displays detailed order information in a card format

import React from 'react';
import { OrderStatusBadge } from '../atoms/order-status-badge';
import { PaymentStatusBadge } from '../atoms/payment-status-badge';
import { OrderAmount } from '../atoms/order-amount';
import { CustomerAvatar } from '../../customers/atoms/customer-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, User, MapPin, Calendar, CreditCard, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderDetailsData {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  createdAt: string;
  deliveredAt?: string;
}

interface OrderDetailsCardProps {
  order: OrderDetailsData;
  className?: string;
}

export const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ 
  order, 
  className 
}) => {
  const formatAddress = (address: OrderDetailsData['shippingAddress']): string => {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">
              Order #{order.orderNumber}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex space-x-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <CustomerAvatar
            name={order.customerName}
            alt={order.customerName}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{order.customerName}</span>
            </div>
            <p className="text-sm text-gray-500">{order.customerEmail}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Package className="h-4 w-4 text-gray-400" />
            <h3 className="font-medium">Order Items</h3>
          </div>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} × <OrderAmount amount={item.price} />
                  </p>
                </div>
                <OrderAmount amount={item.total} size="md" />
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <OrderAmount amount={order.subtotal} />
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <OrderAmount amount={order.tax} />
              </div>
            )}
            {order.shipping > 0 && (
              <div className="flex justify-between">
                <span>Shipping:</span>
                <OrderAmount amount={order.shipping} />
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-<OrderAmount amount={order.discount} /></span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <OrderAmount amount={order.total} size="lg" />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
          <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium">Payment Method</p>
            <p className="text-sm text-gray-600">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Shipping Address</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.name}
            </p>
            <p className="text-sm text-gray-600">
              {formatAddress(order.shippingAddress)}
            </p>
            {order.shippingAddress.phone && (
              <p className="text-sm text-gray-600">
                {order.shippingAddress.phone}
              </p>
            )}
          </div>
        </div>

        {/* Delivery Information */}
        {order.deliveredAt && (
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <Truck className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Delivered</p>
              <p className="text-sm text-green-600">
                {format(new Date(order.deliveredAt), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};