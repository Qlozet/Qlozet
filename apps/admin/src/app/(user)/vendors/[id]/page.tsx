'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { GoBackButton } from '@/pattern/admin/atoms/go-back-button';
import {
  useGetBusinessQuery,
  useApproveBusinessMutation,
  useVerifyBusinessMutation,
  useRejectBusinessMutation,
  useSetBusinessInReviewMutation,
} from '@/redux/services/businesses/businesses.api-slice';
import { useGetVendorDashboardQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { VendorDetailHeader } from '@/pattern/vendors/details/organisms/vendor-detail-header';
import { VendorInfoGrid } from '@/pattern/vendors/details/organisms/vendor-info-grid';
import { VendorAnalyticsSection } from '@/pattern/vendors/details/organisms/vendor-analytics-section';
import { TopProductsTable } from '@/pattern/vendors/details/organisms/top-products-table';
import { WalletDetailsSection } from '@/pattern/vendors/details/organisms/wallet-details-section';
import { ActivityLogTable } from '@/pattern/vendors/details/organisms/activity-log-table';
import { ComplaintTable } from '@/pattern/vendors/details/organisms/complaint-table';

// Anchors for the "View all" links on the info cards — the tables they point at
// are further down this same page.
const PRODUCTS_ANCHOR = 'vendor-top-products';

const VendorDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';

  const { data: businessRes, isLoading: isVendorLoading } = useGetBusinessQuery(
    id,
    { skip: !id }
  );
  const { data: dashboardRes } = useGetVendorDashboardQuery(
    { businessId: id },
    { skip: !id }
  );

  const [approve, { isLoading: isApproving }] = useApproveBusinessMutation();
  const [verify, { isLoading: isVerifying }] = useVerifyBusinessMutation();
  const [reject, { isLoading: isRejecting }] = useRejectBusinessMutation();
  const [setInReview, { isLoading: isReviewing }] =
    useSetBusinessInReviewMutation();

  const vendor = businessRes?.data;
  const metrics = dashboardRes?.data;

  const isUpdatingStatus =
    isApproving || isVerifying || isRejecting || isReviewing;

  // The four status mutations share the same shape; `getBusiness` is
  // invalidated by each, so the header re-renders with the new status.
  const runStatusChange = async (
    action: (businessId: string) => { unwrap: () => Promise<unknown> },
    successMessage: string
  ) => {
    if (!id) return;
    try {
      await action(id).unwrap();
      toast.success(successMessage);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Something went wrong. Please try again.';
      toast.error(message);
    }
  };

  const scrollTo = (anchor: string) => () => {
    document
      .getElementById(anchor)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full min-h-screen h-fit space-y-10 pb-16">
      <GoBackButton href={APP_ROUTES.vendors} label="Back to vendors" />

      {/* 1. Cover banner + avatar */}
      <VendorDetailHeader vendor={vendor} isLoading={isVendorLoading} />

      {/* 2. Info header + grid */}
      <div className="pt-2">
        <VendorInfoGrid
          vendor={vendor}
          metrics={metrics}
          isUpdatingStatus={isUpdatingStatus}
          onApprove={() => runStatusChange(approve, 'Vendor approved')}
          onVerify={() => runStatusChange(verify, 'Vendor verified')}
          onReject={() => runStatusChange(reject, 'Vendor rejected')}
          onSetInReview={() =>
            runStatusChange(setInReview, 'Vendor marked in review')
          }
          onViewProducts={scrollTo(PRODUCTS_ANCHOR)}
          // The admin orders and customers pages are platform-wide; neither
          // endpoint accepts a business filter yet.
          // TODO(api): pass ?business_id= once /admin/vendor/orders and
          // /admin/customers support it, and deep-link instead.
          onViewOrders={() => router.push(APP_ROUTES.orders)}
          onViewCustomers={() => router.push(APP_ROUTES.customers)}
        />
      </div>

      {/* 3. Analytics */}
      <VendorAnalyticsSection metrics={metrics} />

      {/* 4. Top products */}
      <div id={PRODUCTS_ANCHOR} className="scroll-mt-24">
        <TopProductsTable businessId={id} />
      </div>

      {/* 5. Wallet details */}
      <WalletDetailsSection vendor={vendor} metrics={metrics} />

      {/* 6. Activity log + complaints */}
      <ActivityLogTable businessId={id} />
      <ComplaintTable businessId={id} />
    </div>
  );
};

export default VendorDetailsPage;
