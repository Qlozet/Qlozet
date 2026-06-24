'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { show } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { useGetVendorCustomersQuery } from '@/redux/services/customers/customers.api-slice';
import { GoBackButton } from '@/pattern/common/atoms/go-back-button';
import { CustomerDetailHeader } from '@/pattern/customers/details/organisms/customer-detail-header';
import { CustomerInfoGrid } from '@/pattern/customers/details/organisms/customer-info-grid';
import { CustomerAnalyticsSection } from '@/pattern/customers/details/organisms/customer-analytics-section';
import { CustomerWalletSection } from '@/pattern/customers/details/organisms/customer-wallet-section';
import { CustomerTicketsTable } from '@/pattern/customers/details/organisms/customer-tickets-table';
import { CustomerMeasurementsModal } from '@/pattern/customers/details/organisms/customer-measurements-modal';

// No single-customer endpoint exists, so resolve the customer from the
// /business/customers list by id. A larger orders_limit gives the transactions
// table more history than the list preview needs.
const FETCH_LIMIT = 200;
const ORDERS_LIMIT = 50;

const CustomerDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ? decodeURIComponent(params.id) : '';

  const { data, isLoading, isFetching } = useGetVendorCustomersQuery({
    page: 1,
    limit: FETCH_LIMIT,
    orders_limit: ORDERS_LIMIT,
  });

  const customer = useMemo(
    () => (data?.data ?? []).find((c) => c._id === id),
    [data, id]
  );

  const notImplemented = () => toast.info('This action is coming soon.');

  const handleViewMeasurements = () =>
    show(CustomerMeasurementsModal, {
      customer,
      measurementSet: customer?.default_measurement ?? undefined,
    });

  return (
    <div className='w-full min-h-screen h-fit space-y-8 pb-16'>
      <GoBackButton href={APP_ROUTES.customers} />

      {/* 1. Identity header + actions */}
      <CustomerDetailHeader
        customer={customer}
        isLoading={isLoading || isFetching}
        onEscalate={notImplemented}
        onEdit={notImplemented}
        onViewReviews={notImplemented}
        onViewMeasurements={handleViewMeasurements}
      />

      {/* 2. Info grid */}
      <CustomerInfoGrid
        customer={customer}
        onEditLocation={notImplemented}
        onViewOrders={notImplemented}
      />

      {/* 3. Analytics */}
      <CustomerAnalyticsSection />

      {/* 4. Wallet details + recent transactions */}
      <CustomerWalletSection customer={customer} />

      {/* 5. Tickets */}
      <CustomerTicketsTable />
    </div>
  );
};

export default CustomerDetailsPage;
