'use client';

import NiceModal from '@ebay/nice-modal-react';
import { Star, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import type { VendorDashboardMetrics } from '@/redux/services/dashboard/dashboard.api-slice';
import { getVendorName, formatCount } from '@/lib/vendors';
import { VendorInfoCard } from '../molecules/vendor-info-card';
import { VendorDocumentModal } from './vendor-document-modal';

interface VendorInfoGridProps {
  vendor?: Business;
  metrics?: VendorDashboardMetrics;
  onApprove?: () => void;
  onVerify?: () => void;
  onReject?: () => void;
  onSetInReview?: () => void;
  /** Disables every status button while one of the mutations is in flight. */
  isUpdatingStatus?: boolean;
  onViewProducts?: () => void;
  onViewOrders?: () => void;
  onViewCustomers?: () => void;
}

const num = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

// cac_document_url is a string[]; take the most recent entry.
const readFirstUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value) return value;
  if (Array.isArray(value)) {
    const last = [...value].reverse().find((v) => typeof v === 'string' && v);
    return typeof last === 'string' ? last : undefined;
  }
  return undefined;
};

const formatJoined = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const VendorInfoGrid = ({
  vendor,
  metrics,
  onApprove,
  onVerify,
  onReject,
  onSetInReview,
  isUpdatingStatus = false,
  onViewProducts,
  onViewOrders,
  onViewCustomers,
}: VendorInfoGridProps) => {
  const m = (metrics ?? {}) as Record<string, unknown>;
  const v = (vendor ?? {}) as Record<string, unknown>;

  const rating = num(v.rating) ?? num(v.averageRating);
  const reviews = num(v.reviewsCount) ?? num(v.totalReviews);

  const idVerified = Boolean(v.id_verified ?? v.isVerified ?? v.kyc_verified);
  const status = str(v.status);

  // A "View all" link is only offered when there's somewhere to go.
  const cacUrl = readFirstUrl(v.cac_document_url);
  const logoUrl =
    str(v.business_logo_svg_url) ?? str(v.business_logo_url) ?? str(v.logo);
  const vendorName = getVendorName(vendor ?? ({} as Business));

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[hsla(210,9%,31%,1)]">
              {getVendorName(vendor ?? ({} as Business))}
            </h1>
            <span className="text-sm text-gray-500">
              Joined {formatJoined(vendor?.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <span className="font-semibold">{rating ?? '—'}</span>
            <Star className="size-4 fill-[#FFB020] text-[#FFB020]" />
            <span className="text-gray-500">({formatCount(reviews)})</span>
          </div>
        </div>

        {/*
          Status actions are the admin capabilities the backend actually
          exposes for a business (POST /admin/{id}/approve | verify | reject |
          in-review). "Notes", "Flag vendor", "Escalate to support" and "Edit
          Information" had no endpoints behind them and are omitted rather than
          shown as controls that do nothing.
          TODO(api): restore them if/when those endpoints exist.
        */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSetInReview}
            disabled={isUpdatingStatus || status === 'in_review'}
            className="h-10 cursor-pointer"
          >
            Mark in review
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onVerify}
            disabled={isUpdatingStatus || Boolean(vendor?.isVerified)}
            className="h-10 cursor-pointer gap-2"
          >
            <ShieldCheck className="size-4" />
            {vendor?.isVerified ? 'Verified' : 'Verify'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReject}
            disabled={isUpdatingStatus || status === 'rejected'}
            className="h-10 cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/5"
          >
            Reject
          </Button>
          <Button
            type="button"
            onClick={onApprove}
            disabled={isUpdatingStatus || status === 'approved'}
            className="h-10 cursor-pointer gap-2"
          >
            {status === 'approved' ? 'Approved' : 'Approve'}
            <Check className="size-4" />
          </Button>
        </div>
      </div>

      {/* Info card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <VendorInfoCard
          label="Vendor name"
          value={getVendorName(vendor ?? ({} as Business))}
        />
        <VendorInfoCard
          label="Address"
          value={str(v.address) ?? str(v.business_address)}
        />
        <VendorInfoCard
          label="Total products"
          value={formatCount(num(m.totalProducts) ?? num(v.productsCount))}
          linkLabel="View all"
          onLinkClick={onViewProducts}
        />
        <VendorInfoCard
          label="Total orders"
          value={formatCount(num(m.totalOrders) ?? num(v.ordersCount))}
          linkLabel="View all"
          onLinkClick={onViewOrders}
        />
        <VendorInfoCard
          label="Total customers"
          value={formatCount(num(m.totalCustomers))}
          linkLabel="View all"
          onLinkClick={onViewCustomers}
        />

        <VendorInfoCard
          label="Official phone number"
          value={
            str(v.business_phone_number) ?? str(v.phone_number) ?? str(v.phone)
          }
        />
        <VendorInfoCard
          label="Official email address"
          value={str(v.business_email) ?? str(v.email)}
        />
        <VendorInfoCard
          label="Admin"
          value={str(v.personal_name) ?? str(v.full_name)}
        />
        <VendorInfoCard
          label="Admin phone number"
          value={str(v.personal_phone_number)}
        />
        <VendorInfoCard
          label="Principal's email address"
          value={str(v.principal_email) ?? str(v.email)}
        />

        {/* TODO(api): no admin endpoint lists another business's warehouses
            (GET /business/warehouse is scoped to the caller), so the count
            stands alone rather than offering a link that can't resolve. */}
        <VendorInfoCard
          label="Warehouses"
          value={formatCount(num(m.warehouses) ?? num(v.warehousesCount))}
        />
        <VendorInfoCard
          label="Achieved custom orders / day"
          value={formatCount(num(m.customOrdersPerDay))}
        />
        <VendorInfoCard
          label="ID Check"
          value={idVerified ? 'Verified' : 'Unverified'}
          valueClassName={idVerified ? 'text-[#0F973D]' : 'text-destructive'}
        />
        {/* The viewer link is withheld when nothing was uploaded — it could
            only open an empty modal, and replacing a document has no endpoint
            either, so there is nothing for the click to do. */}
        <VendorInfoCard
          label="CAC Document"
          value={cacUrl ? 'Uploaded' : 'Not uploaded'}
          valueClassName={cacUrl ? 'text-[#0F973D]' : 'text-destructive'}
          linkLabel={cacUrl ? 'View document' : undefined}
          onLinkClick={
            cacUrl
              ? () =>
                  NiceModal.show(VendorDocumentModal, {
                    kind: 'CAC Document',
                    vendorName,
                    url: cacUrl,
                    downloadLabel: 'Download Document',
                  })
              : undefined
          }
        />
        <VendorInfoCard
          label="Company PNG logo"
          value={logoUrl ? 'Uploaded' : 'Not uploaded'}
          valueClassName={logoUrl ? 'text-[#0F973D]' : 'text-destructive'}
          linkLabel={logoUrl ? 'View logo' : undefined}
          onLinkClick={
            logoUrl
              ? () =>
                  NiceModal.show(VendorDocumentModal, {
                    kind: 'PNG Logo',
                    vendorName,
                    url: logoUrl,
                    downloadLabel: 'Download Logo',
                  })
              : undefined
          }
        />
      </div>
    </div>
  );
};
