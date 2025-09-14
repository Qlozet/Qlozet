// Order Table Row - Molecule
// Individual row component for order table

import React from 'react';
import { CustomerAvatar } from '../../customers/atoms/customer-avatar';
import { OrderStatusBadge } from '../atoms/order-status-badge';
import { PaymentStatusBadge } from '../atoms/payment-status-badge';
import { OrderAmount } from '../atoms/order-amount';
import { Button } from '@/components/ui/button';
import { Eye, Package, User } from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderRowData {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}

interface OrderTableRowProps {
  order: OrderRowData;
  onViewDetails: (orderId: string) => void;
  onViewCustomer?: (customerId: string) => void;
  isSelected?: boolean;
  onSelect?: (orderId: string, selected: boolean) => void;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({ 
  order, 
  onViewDetails,
  onViewCustomer,
  isSelected = false,
  onSelect
}) => {
  const handleViewDetails = () => {
    onViewDetails(order._id);
  };

  const handleViewCustomer = () => {
    onViewCustomer?.(order.customerId);
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(order._id, event.target.checked);
  };

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const primaryProduct = order.items[0]?.productName || 'No items';
  const additionalItems = order.items.length - 1;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {onSelect && (
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </td>
      )}

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">#{order.orderNumber}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(order.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <CustomerAvatar
            name={order.customerName}
            alt={order.customerName}
            size="sm"
          />
          <div>
            <p className="font-medium text-gray-900">{order.customerName}</p>
            <p className="text-xs text-gray-500">{order.customerEmail}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-900 truncate max-w-48">
            {primaryProduct}
          </p>
          {additionalItems > 0 && (
            <p className="text-xs text-gray-500">
              +{additionalItems} more item{additionalItems !== 1 ? 's' : ''}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {totalItems} item{totalItems !== 1 ? 's' : ''} total
          </p>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
        <OrderAmount amount={order.total} size="md" />
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <OrderStatusBadge status={order.status} />
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <PaymentStatusBadge status={order.paymentStatus} />
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="flex items-center space-x-1"
        >
          <Eye className="h-3 w-3" />
          <span>View</span>
        </Button>
        
        {onViewCustomer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewCustomer}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
          >
            <User className="h-3 w-3" />
            <span>Customer</span>
          </Button>
        )}
      </td>
    </tr>
  );
};