'use client';

import type { Customer } from '@/redux/services/customers/customers.api-slice';
import {
  InfoCard,
  InfoCardSkeleton,
} from '@/pattern/common/molecules/info-card';
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
  isLoading?: boolean;
}

// Shared so the skeleton lays out on exactly the same grid as the real cards.
const GRID_CLASS =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

// Every value here comes from GET /admin/customer/:id. Counts render through
// formatCount so a genuine 0 shows as "0" and only a missing figure dashes.
//
// No card carries a "View all" or an edit pencil. A join date has nothing to
// list, and the counts have nowhere to go: no admin endpoint lists another
// customer's followed vendors or fabric reservations, and none writes their
// address. Each of those controls used to raise a "coming soon" toast, which
// costs the reader a click to learn nothing. Restore a control here when the
// endpoint behind it exists.
export const CustomerInfoGrid = ({
  customer,
  isLoading,
}: CustomerInfoGridProps) => {
  const c = customer ?? ({} as Customer);
  const email = str(c.email);

  if (isLoading) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 10 }).map((_, i) => (
          <InfoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      <InfoCard label="Customer name" value={getCustomerName(c)} />
      <InfoCard label="Location" value={getCustomerLocation(c)} />
      <InfoCard label="Phone number" value={getCustomerPhone(c)} />
      <InfoCard
        label="Email address"
        value={email}
        href={email ? `mailto:${email}` : undefined}
      />
      <InfoCard
        label="Date joined"
        value={formatJoinedDate(getCustomerJoinedDate(c))}
      />

      <InfoCard
        label="Total orders"
        value={formatCount(getCustomerTotalOrders(c))}
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
      />
      <InfoCard
        label="Reserved Fabric"
        value={formatCount(getCustomerReservedFabrics(c))}
      />
    </div>
  );
};
