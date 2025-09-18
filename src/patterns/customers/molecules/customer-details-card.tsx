// Customer Details Card - Molecule
// Displays detailed customer information in a card format

import React from 'react';
import { CustomerAvatar } from '../atoms/customer-avatar';
import { CustomerStatusBadge } from '../atoms/customer-status-badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';

interface CustomerDetailsData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  status: 'active' | 'inactive';
  totalSpent?: number;
  orders?: string[];
  createdAt: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface CustomerDetailsCardProps {
  customer: CustomerDetailsData;
  className?: string;
}

export const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({
  customer,
  className,
}) => {
  const formatAddress = (address?: CustomerDetailsData['address']): string => {
    if (!address) return 'No address provided';

    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  return (
    <Card className={className}>
      <CardHeader className='pb-4'>
        <div className='flex items-start space-x-4'>
          <CustomerAvatar
            src={customer.profileImage}
            alt={customer.name}
            name={customer.name}
            size='xl'
          />
          <div className='flex-1'>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              {customer.name}
            </h3>
            <CustomerStatusBadge status={customer.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Contact Information */}
        <div className='space-y-3'>
          <div className='flex items-center space-x-3'>
            <Mail className='h-4 w-4 text-gray-400 flex-shrink-0' />
            <span className='text-sm text-gray-900'>{customer.email}</span>
          </div>

          {customer.phone && (
            <div className='flex items-center space-x-3'>
              <Phone className='h-4 w-4 text-gray-400 flex-shrink-0' />
              <span className='text-sm text-gray-900'>{customer.phone}</span>
            </div>
          )}

          <div className='flex items-start space-x-3'>
            <MapPin className='h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5' />
            <span className='text-sm text-gray-900'>
              {formatAddress(customer.address)}
            </span>
          </div>
        </div>

        <hr className='border-gray-200' />

        {/* Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='flex items-center space-x-2'>
            <Package className='h-4 w-4 text-blue-500' />
            <div>
              <p className='text-xs text-gray-500'>Total Orders</p>
              <p className='font-semibold'>{customer.orders?.length || 0}</p>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <DollarSign className='h-4 w-4 text-green-500' />
            <div>
              <p className='text-xs text-gray-500'>Total Spent</p>
              <p className='font-semibold'>
                ${customer.totalSpent?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Calendar className='h-4 w-4 text-purple-500' />
            <div>
              <p className='text-xs text-gray-500'>Customer Since</p>
              <p className='font-semibold'>
                {format(new Date(customer.createdAt), 'MMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
