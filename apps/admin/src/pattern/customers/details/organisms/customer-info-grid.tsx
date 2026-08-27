'use client';

import type { Customer } from '@/redux/services/customers/customers.api-slice';
import { InfoCard } from '@/pattern/common/molecules/info-card';
import {
  getCustomerName,
  getCustomerPhone,
  getCustomerTotalOrders,
  getCustomerLocation,
  getCustomerJoinedDate,
  getCustomerFollowedVendors,
  getCustomerReservedFabrics,
  formatCount,
  formatJoinedDate,
  formatLastLoggedIn,
} from '@/lib/customers';

interface CustomerInfoGridProps {
  customer?: Customer;
  onEditLocation?: () => void;
  onViewDateJoined?: () => void;
  onViewOrders?: () => void;
  onViewFollowedVendors?: () => void;
  onViewReservedFabric?: () => void;
}

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

// Every value here comes from GET /admin/customer/:id. Counts render through
// formatCount so a genuine 0 shows as "0" and only a missing figure dashes.
export const CustomerInfoGrid = ({
  customer,
  onEditLocation,
  onViewDateJoined,
  onViewOrders,
  onViewFollowedVendors,
  onViewReservedFabric,
}: CustomerInfoGridProps) => {
  const c = customer ?? ({} as Customer);
  const email = str(c.email);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <InfoCard label="Customer name" value={getCustomerName(c)} />
      <InfoCard
        label="Location"
        value={getCustomerLocation(c)}
        onEdit={onEditLocation}
      />
      <InfoCard label="Phone number" value={getCustomerPhone(c)} />
      <InfoCard
        label="Email address"
        value={email}
        href={email ? `mailto:${email}` : undefined}
      />
      <InfoCard
        label="Date joined"
        value={formatJoinedDate(getCustomerJoinedDate(c))}
        linkLabel="View all"
        onLinkClick={onViewDateJoined}
      />

      <InfoCard
        label="Total orders"
        value={formatCount(getCustomerTotalOrders(c))}
        linkLabel="View all"
        onLinkClick={onViewOrders}
      />
      <InfoCard label="Last logged in" value={formatLastLoggedIn(c)} />
      <InfoCard
        label="Gender"
        value={str(c.gender)}
        valueClassName="capitalize"
      />
      <InfoCard
        label="Followed Vendors"
        value={formatCount(getCustomerFollowedVendors(c))}
        linkLabel="View all"
        onLinkClick={onViewFollowedVendors}
      />
      <InfoCard
        label="Reserved Fabric"
        value={formatCount(getCustomerReservedFabrics(c))}
        linkLabel="View all"
        onLinkClick={onViewReservedFabric}
      />
    </div>
  );
};
