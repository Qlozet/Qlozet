'use client';

import { Star, Flag, ClipboardList, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import type { VendorDashboardMetrics } from '@/redux/services/dashboard/dashboard.api-slice';
import { getVendorName, formatCount } from '@/lib/vendors';
import { VendorInfoCard } from '../molecules/vendor-info-card';

interface VendorInfoGridProps {
  vendor?: Business;
  metrics?: VendorDashboardMetrics;
  onEscalate?: () => void;
  onEdit?: () => void;
  onViewOrders?: () => void;
  onViewCustomers?: () => void;
  onViewWarehouses?: () => void;
  onViewDocument?: () => void;
  onViewLogo?: () => void;
}

const num = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

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
  onEscalate,
  onEdit,
  onViewOrders,
  onViewCustomers,
  onViewWarehouses,
  onViewDocument,
  onViewLogo,
}: VendorInfoGridProps) => {
  const m = (metrics ?? {}) as Record<string, unknown>;
  const v = (vendor ?? {}) as Record<string, unknown>;

  const rating = num(v.rating) ?? num(v.averageRating);
  const reviews = num(v.reviewsCount) ?? num(v.totalReviews);

  const idVerified = Boolean(v.id_verified ?? v.isVerified ?? v.kyc_verified);

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
            <span className="font-semibold">{rating ?? '4.4'}</span>
            <Star className="size-4 fill-[#FFB020] text-[#FFB020]" />
            <span className="text-gray-500">({formatCount(reviews) === '—' ? '500' : formatCount(reviews)})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notes"
            className="flex size-10 items-center justify-center rounded-lg border border-border text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            <ClipboardList className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Flag vendor"
            className="flex size-10 items-center justify-center rounded-lg border border-border text-destructive hover:bg-gray-50 cursor-pointer"
          >
            <Flag className="size-5" />
          </button>
          <Button
            type="button"
            variant="outline"
            onClick={onEscalate}
            className="h-10 border-destructive/40 text-destructive hover:bg-destructive/5"
          >
            Escalate to support
          </Button>
          <Button type="button" onClick={onEdit} className="h-10 gap-2">
            Edit Information
            <Pencil className="size-4" />
          </Button>
        </div>
      </div>

      {/* Info card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <VendorInfoCard label="Vendor name" value={getVendorName(vendor ?? ({} as Business))} />
        <VendorInfoCard label="Address" value={str(v.address) ?? str(v.business_address)} />
        <VendorInfoCard
          label="Total products"
          value={formatCount(num(m.totalProducts) ?? num(v.productsCount))}
          linkLabel="View all"
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
          value={str(v.business_phone_number) ?? str(v.phone_number) ?? str(v.phone)}
        />
        <VendorInfoCard
          label="Official email address"
          value={str(v.business_email) ?? str(v.email)}
        />
        <VendorInfoCard label="Admin" value={str(v.personal_name) ?? str(v.full_name)} />
        <VendorInfoCard label="Admin phone number" value={str(v.personal_phone_number)} />
        <VendorInfoCard
          label="Principal's email address"
          value={str(v.principal_email) ?? str(v.email)}
        />

        <VendorInfoCard
          label="Warehouses"
          value={formatCount(num(m.warehouses) ?? num(v.warehousesCount))}
          linkLabel="View all"
          onLinkClick={onViewWarehouses}
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
        <VendorInfoCard
          label="CAC Document"
          value=" "
          linkLabel="View document"
          onLinkClick={onViewDocument}
        />
        <VendorInfoCard
          label="Company PNG logo"
          value=" "
          linkLabel="View logo"
          onLinkClick={onViewLogo}
        />
      </div>
    </div>
  );
};
