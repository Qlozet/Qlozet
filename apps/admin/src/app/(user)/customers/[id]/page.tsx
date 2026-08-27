'use client';

import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { useGetCustomerQuery } from '@/redux/services/customers/customers.api-slice';
import { GoBackButton } from '@/pattern/admin/atoms/go-back-button';
import { CustomerDetailHeader } from '@/pattern/customers/details/organisms/customer-detail-header';
import { CustomerInfoGrid } from '@/pattern/customers/details/organisms/customer-info-grid';
import { CustomerAnalyticsSection } from '@/pattern/customers/details/organisms/customer-analytics-section';
import { CustomerWalletSection } from '@/pattern/customers/details/organisms/customer-wallet-section';
import { CustomerTicketsTable } from '@/pattern/customers/details/organisms/customer-tickets-table';

const CustomerDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  // One record, straight from GET /admin/customer/:id — profile, activity and
  // wallet figures in a single payload. This used to pull the customers list at
  // size:200 and scan it for a matching _id, which found nothing for a customer
  // past the 200th and carried none of the detail-only fields.
  const { data, isLoading, isFetching } = useGetCustomerQuery(id, {
    skip: !id,
  });
  const customer = data?.data;

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
      <CustomerAnalyticsSection customerId={id} />

      {/* 4. Wallet details + recent transactions */}
      <CustomerWalletSection customer={customer} customerId={id} />

      {/* 5. Tickets */}
      <CustomerTicketsTable customerId={id} />
    </div>
  );
};

export default CustomerDetailsPage;
