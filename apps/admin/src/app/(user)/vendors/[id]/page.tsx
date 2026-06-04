'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { useGetBusinessQuery } from '@/redux/services/businesses/businesses.api-slice';
import { useGetVendorDashboardQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { VendorDetailHeader } from '@/pattern/vendors/details/organisms/vendor-detail-header';
import { VendorInfoGrid } from '@/pattern/vendors/details/organisms/vendor-info-grid';
import { VendorAnalyticsSection } from '@/pattern/vendors/details/organisms/vendor-analytics-section';
import { TopProductsTable } from '@/pattern/vendors/details/organisms/top-products-table';
import { WalletDetailsSection } from '@/pattern/vendors/details/organisms/wallet-details-section';
import { ActivityLogTable } from '@/pattern/vendors/details/organisms/activity-log-table';
import { ComplaintTable } from '@/pattern/vendors/details/organisms/complaint-table';

const VendorDetailsPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const { data: businessRes, isLoading: isVendorLoading } =
    useGetBusinessQuery(id, { skip: !id });
  const { data: dashboardRes } = useGetVendorDashboardQuery(
    { businessId: id },
    { skip: !id }
  );

  const vendor = businessRes?.data;
  const metrics = dashboardRes?.data;

  const notImplemented = () => toast.info('This action is coming soon');

  return (
    <div className="w-full min-h-screen h-fit space-y-10 pb-16">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push(APP_ROUTES.vendors)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="size-4" /> Back to vendors
      </button>

      {/* 1. Cover banner + avatar */}
      <VendorDetailHeader
        vendor={vendor}
        isLoading={isVendorLoading}
        onEditCover={notImplemented}
      />

      {/* 2. Info header + grid */}
      <div className="pt-2">
        <VendorInfoGrid
          vendor={vendor}
          metrics={metrics}
          onEscalate={notImplemented}
          onEdit={notImplemented}
          onViewOrders={notImplemented}
          onViewCustomers={notImplemented}
          onViewWarehouses={notImplemented}
          onViewDocument={notImplemented}
          onViewLogo={notImplemented}
        />
      </div>

      {/* 3. Analytics */}
      <VendorAnalyticsSection metrics={metrics} />

      {/* 4. Top products */}
      <TopProductsTable businessId={id} />

      {/* 5. Wallet details */}
      <WalletDetailsSection
        vendor={vendor}
        metrics={metrics}
        onEditBank={notImplemented}
      />

      {/* 6. Activity log + complaints */}
      <ActivityLogTable businessId={id} />
      <ComplaintTable businessId={id} />
    </div>
  );
};

export default VendorDetailsPage;
