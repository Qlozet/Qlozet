'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { useGetCustomersQuery } from '@/redux/services/customers/customers.api-slice';
import { GoBackButton } from '@/pattern/admin/atoms/go-back-button';
import { CustomerDetailHeader } from '@/pattern/customers/details/organisms/customer-detail-header';
import { CustomerInfoGrid } from '@/pattern/customers/details/organisms/customer-info-grid';
import { CustomerAnalyticsSection } from '@/pattern/customers/details/organisms/customer-analytics-section';
import { CustomerWalletSection } from '@/pattern/customers/details/organisms/customer-wallet-section';
import { CustomerTicketsTable } from '@/pattern/customers/details/organisms/customer-tickets-table';

const CustomerDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  // The backend has no single-customer endpoint, so resolve the record from the
  // (cached) customers list by id. A large page size covers deep-links where the
  // user lands here without the list having been paged to this customer.
  const { data, isLoading, isFetching } = useGetCustomersQuery({
    page: 1,
    size: 200,
  });
  const customer = useMemo(
    () => (data?.data?.data ?? []).find((c) => c._id === id),
    [data, id]
  );

  const notImplemented = () => toast.info('This action is coming soon');

  return (
    <div className="w-full min-h-screen h-fit space-y-8 pb-16">
      <GoBackButton href={APP_ROUTES.customers} />

      {/* 1. Identity header + actions */}
      <CustomerDetailHeader
        customer={customer}
        isLoading={isLoading || isFetching}
        onEscalate={notImplemented}
        onEdit={notImplemented}
        onViewReviews={notImplemented}
      />

      {/* 2. Info grid */}
      <CustomerInfoGrid
        customer={customer}
        onEditLocation={notImplemented}
        onViewDateJoined={notImplemented}
        onViewOrders={notImplemented}
        onViewFollowedVendors={notImplemented}
        onViewReservedFabric={notImplemented}
      />

      {/* 3. Analytics */}
      <CustomerAnalyticsSection />

      {/* 4. Wallet details + recent transactions */}
      <CustomerWalletSection customer={customer} />

      {/* 5. Tickets */}
      <CustomerTicketsTable customerId={id} />
    </div>
  );
};

export default CustomerDetailsPage;
