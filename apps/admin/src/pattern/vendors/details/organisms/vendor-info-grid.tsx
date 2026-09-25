'use client';

import NiceModal from '@ebay/nice-modal-react';
import { Star, ShieldCheck, Check, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RowActionsMenu } from '@/pattern/common/molecules/row-actions-menu';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import type { VendorDashboardMetrics } from '@/redux/services/dashboard/dashboard.api-slice';
import { getVendorName, formatCount } from '@/lib/vendors';
import { LifeBuoy, Pencil } from 'lucide-react';
import { VendorWarehousesModal } from './vendor-warehouses-modal';
import { EscalateVendorModal } from './escalate-vendor-modal';
import { EditVendorDrawer } from './edit-vendor-drawer';
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

/**
 * Registry numbers are stored however the vendor typed them — "RC100001" or
 * "100001". Prefixing unconditionally produced "(RC RC100001)".
 */
const formatRcNumber = (value: unknown): string => {
  const rc = typeof value === 'string' ? value.trim() : '';
  if (!rc) return '';
  const bare = rc.replace(/^RC[\s-]*/i, '');
  return bare ? ` (RC ${bare})` : '';
};

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

  // The account owner — what this page labels "Admin". Business has no
  // personal_name / personal_phone_number / principal_email fields, so those
  // three cards read undefined and rendered a dash. The detail endpoint joins
  // the owning user in as `vendor`; `created_by` is the copy stamped on the
  // business at signup, covering rows whose user record has since gone.
  const owner = (v.vendor ?? {}) as Record<string, unknown>;
  const createdBy = (v.created_by ?? {}) as Record<string, unknown>;

  const rating = num(v.rating) ?? num(v.averageRating);
  const reviews = num(v.reviewsCount) ?? num(v.totalReviews);

  // QoreID verification results live under business.verification — the old
  // id_verified/isVerified/kyc_verified fields never existed on the document,
  // so this card used to read "Unverified" for everyone.
  const verification = (v.verification ?? {}) as {
    identity?: Record<string, any> | null;
    business?: Record<string, any> | null;
    bank?: Record<string, any> | null;
  };
  const identityCheck = verification.identity ?? null;
  const bankCheck = verification.bank ?? null;
  const cacCheck = verification.business ?? null;
  const idVerified =
    identityCheck?.status === 'verified' ||
    Boolean(v.id_verified ?? v.isVerified ?? v.kyc_verified);
  const status = str(v.status);

  // A "View all" link is only offered when there's somewhere to go.
  const cacUrl = readFirstUrl(v.cac_document_url);
  const logoUrl =
    str(v.business_logo_svg_url) ?? str(v.business_logo_url) ?? str(v.logo);
  const vendorName = getVendorName(vendor ?? ({} as Business));
  const businessId = str(v._id);

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white">
              {getVendorName(vendor ?? ({} as Business))}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Joined {formatJoined(vendor?.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200">
            <span className="font-semibold">{rating ?? '—'}</span>
            <Star className="size-4 fill-[#FFB020] text-[#FFB020]" />
            <span className="text-gray-500 dark:text-gray-400">
              ({formatCount(reviews)})
            </span>
          </div>
        </div>

        {/*
          Six inline buttons wrapped onto a second line on anything narrower
          than a desktop and gave equal weight to the rare actions. Only the
          approve/reject decision stays inline; the rest — the two secondary
          status moves (POST /admin/{id}/verify | in-review), Edit vendor over
          PATCH /admin/businesses/:id, and Escalate to support, which raises a
          ticket — collapse behind the stacked-dots trigger.

          Notes and Flag vendor are in their own section further down rather
          than here: both need a body, and a button that only opens a prompt
          for one is a worse version of the panel.
        */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onReject}
            disabled={isUpdatingStatus || status === 'rejected'}
            className="h-10 cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/5"
          >
            {status === 'rejected' ? 'Rejected' : 'Reject'}
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
          <RowActionsMenu
            title="Vendor actions"
            className="size-10 shrink-0 rounded-lg border border-border-input"
            actions={[
              {
                label: vendor?.isVerified ? 'Verified' : 'Verify',
                icon: <ShieldCheck className="size-4" />,
                onSelect: () => onVerify?.(),
                disabled: isUpdatingStatus || Boolean(vendor?.isVerified),
              },
              {
                label: 'Mark in review',
                icon: <ClipboardList className="size-4" />,
                onSelect: () => onSetInReview?.(),
                disabled: isUpdatingStatus || status === 'in_review',
              },
              {
                label: 'Edit vendor',
                icon: <Pencil className="size-4" />,
                onSelect: () =>
                  vendor && NiceModal.show(EditVendorDrawer, { vendor }),
                disabled: !vendor,
              },
              {
                label: 'Escalate to support',
                icon: <LifeBuoy className="size-4" />,
                onSelect: () =>
                  vendor?._id &&
                  NiceModal.show(EscalateVendorModal, {
                    businessId: vendor._id,
                    vendorName: v.business_name as string | undefined,
                  }),
                disabled: !vendor?._id,
              },
            ]}
          />
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
          value={formatCount(num(m.total_products) ?? num(v.total_products))}
          linkLabel="View all"
          onLinkClick={onViewProducts}
        />
        <VendorInfoCard
          label="Total orders"
          value={formatCount(num(m.total_orders) ?? num(v.total_orders))}
          linkLabel="View all"
          onLinkClick={onViewOrders}
        />
        <VendorInfoCard
          label="Total customers"
          value={formatCount(num(m.total_customers))}
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
          value={str(owner.full_name) ?? str(createdBy.name)}
        />
        <VendorInfoCard
          label="Admin phone number"
          value={str(owner.phone_number)}
        />
        <VendorInfoCard
          label="Principal's email address"
          value={str(owner.email) ?? str(createdBy.email)}
        />

        {/* The count opens the list, now that GET
            /admin/businesses/:id/warehouses exists — the caller-scoped route
            could never resolve for an admin. */}
        <VendorInfoCard
          label="Warehouses"
          value={formatCount(num(v.total_warehouses))}
          linkLabel={vendor?._id ? 'View warehouses' : undefined}
          onLinkClick={
            vendor?._id
              ? () =>
                  NiceModal.show(VendorWarehousesModal, {
                    businessId: vendor._id,
                  })
              : undefined
          }
        />
        <VendorInfoCard
          label="Achieved custom orders / day"
          value={formatCount(num(v.custom_orders_per_day))}
        />
        <VendorInfoCard
          label="ID Check"
          value={
            idVerified
              ? `Verified · ${identityCheck?.verified_name ?? 'vNIN'}${identityCheck?.masked_id ? ` (${identityCheck.masked_id})` : ''}`
              : identityCheck?.status === 'failed'
                ? 'Failed — name mismatch'
                : 'Unverified'
          }
          valueClassName={
            idVerified
              ? 'text-[#0F973D] dark:text-green-400'
              : 'text-destructive'
          }
        />
        <VendorInfoCard
          label="Payout Account Check"
          value={
            bankCheck?.status === 'verified'
              ? `Matched · ${bankCheck?.account_name ?? 'account holder'}`
              : bankCheck?.status === 'failed'
                ? 'Failed — name mismatch'
                : 'Not checked'
          }
          valueClassName={
            bankCheck?.status === 'verified'
              ? 'text-[#0F973D] dark:text-green-400'
              : bankCheck?.status === 'failed'
                ? 'text-destructive'
                : undefined
          }
        />
        <VendorInfoCard
          label="CAC Registry"
          value={
            cacCheck?.status === 'verified'
              ? `${str(cacCheck?.company_name) ?? 'Confirmed'}${formatRcNumber(cacCheck?.rc_number)}`
              : cacCheck?.status === 'failed'
                ? 'Not found in registry'
                : 'Not checked'
          }
          valueClassName={
            cacCheck?.status === 'verified'
              ? 'text-[#0F973D] dark:text-green-400'
              : cacCheck?.status === 'failed'
                ? 'text-destructive'
                : undefined
          }
        />
        {/* The value is the affordance: "View document" when a file is on
            record, "Not uploaded" otherwise. Both open the same modal — with a
            file it previews and downloads, without one it opens on the
            dropzone, which now has somewhere to save to. */}
        <VendorInfoCard
          label="CAC Document"
          value={cacUrl ? 'View document' : 'Not uploaded'}
          valueClassName={cacUrl ? undefined : 'text-destructive'}
          onValueClick={
            businessId
              ? () =>
                  NiceModal.show(VendorDocumentModal, {
                    kind: 'CAC Document',
                    vendorName,
                    url: cacUrl,
                    downloadLabel: 'Download Document',
                    businessId,
                    field: 'cac_document_url',
                    uploadLabel: 'Upload CAC Document',
                    accept: 'image/*,application/pdf',
                  })
              : undefined
          }
        />
        <VendorInfoCard
          label="Company PNG logo"
          value={logoUrl ? 'View logo' : 'Not uploaded'}
          valueClassName={logoUrl ? undefined : 'text-destructive'}
          onValueClick={
            businessId
              ? () =>
                  NiceModal.show(VendorDocumentModal, {
                    kind: 'PNG Logo',
                    vendorName,
                    url: logoUrl,
                    downloadLabel: 'Download Logo',
                    businessId,
                    // Written separately from business_logo_url so saving here
                    // never overwrites the header avatar, which has its own
                    // control — and this card already reads the SVG first.
                    field: 'business_logo_svg_url',
                    uploadLabel: 'Upload PNG Image',
                  })
              : undefined
          }
        />
      </div>
    </div>
  );
};
