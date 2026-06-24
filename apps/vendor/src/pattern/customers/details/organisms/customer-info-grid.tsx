'use client';

import { InfoCard } from '@/pattern/common/molecules/info-card';
import type { VendorCustomer } from '@/redux/services/customers/customers.api-slice';
import { getCustomerName, formatCount, formatDate, getLastOrderDate } from '@/lib/customers';

interface CustomerInfoGridProps {
  customer?: VendorCustomer;
  onEditLocation?: () => void;
  onViewOrders?: () => void;
}

export const CustomerInfoGrid = ({
  customer,
  onEditLocation,
  onViewOrders,
}: CustomerInfoGridProps) => {
  // Only name, total orders and last order date are exposed by the endpoint;
  // the rest stay dashes until the API provides them (see [[no-stubbed-data]]).
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
      <InfoCard
        label='Customer name'
        value={customer ? getCustomerName(customer) : undefined}
      />
      <InfoCard label='Location' value={undefined} onEdit={onEditLocation} />
      <InfoCard label='Phone number' value={undefined} />
      <InfoCard label='Email address' value={undefined} />
      <InfoCard label='Date joined' value={undefined} />

      <InfoCard
        label='Total orders'
        value={formatCount(customer?.total_orders)}
        linkLabel='View all'
        onLinkClick={onViewOrders}
      />
      <InfoCard
        label='Last order date'
        value={formatDate(customer ? getLastOrderDate(customer) : undefined)}
      />
      <InfoCard label='Gender' value={undefined} />
      <InfoCard label='Followed Vendors' value={undefined} />
      <InfoCard label='Reserved Fabric' value={undefined} />
    </div>
  );
};
