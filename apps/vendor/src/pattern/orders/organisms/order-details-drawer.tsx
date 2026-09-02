'use client';

// Order Details Drawer — Organism
// Slide-over sheet showing a single order's summary, vendor-filtered items,
// payment, shipment status, and fulfillment workflow.
// There is NO single-order detail endpoint — the order data is passed from the
// cached list query.

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import {
  Printer,
  Package,
  Copy,
  Check,
  ExternalLink,
  Truck,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  type Order,
  type OrderItem,
  type VendorShipment,
  type ShipmentBusinessRef,
  type PopulatedProduct,
  getVendorItems,
  getVendorShipment,
  getVendorSubtotal,
  getOrderGoodsSubtotal,
  getFabricTransferShipments,
  getIncomingFabricTransfers,
  getPendingIncomingFabricTransfers,
  extractBizName,
  extractFabricName,
  useFulfillOrderMutation,
  useConfirmOrderMutation,
  useHandoverClaimMutation,
  useRejectOrderMutation,
  useRejectOrderItemMutation,
} from '@/redux/services/orders/orders.api-slice';
import {
  useGetOrderEarningsQuery,
  type OrderEarningRecord,
} from '@/redux/services/business/business.api-slice';
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { CustomerDetailsModal } from '../../customers/organisms/customer-details-modal';
import { CustomerChatSheet } from './customer-chat-sheet';
import { OrderItemDetailModal } from './order-item-detail-modal';
import {
  FabricTransferDetailModal,
  fabricImageUrl,
} from './fabric-transfer-detail-modal';
import { DesignDetailModal } from './design-detail-modal';
import { MediaPreviewModal } from './media-preview-modal';
import { OrderFabricCard } from '../molecules/order-fabric-card';
import { OverlayScroll } from '@/components/OverlayScroll';
import {
  allProductImages,
  asProduct,
  findFabricItem,
  readOrderFabric,
} from '../lib/item-resolvers';
import { readBespokeDesign } from '../lib/bespoke-design';
import {
  OrderMediaPanel,
  ignoreMediaPanelInteraction,
} from '../molecules/order-media-panel';
import {
  deliveryBadge,
  formatDate,
  formatNaira,
  readCustomerHandle,
  readCustomerName,
  readOrderId,
  readStatus,
  shipmentStatusBadge,
} from '../lib/order-fields';
import { isEarningsFrozen } from '../lib/dispute-fields';
import { readApiError } from '@/redux/services/types';

interface OrderDetailsDrawerProps {
  order: Order;
}

/* ------------------------------------------------------------------ */
/*  Shared layout atoms                                                */
/* ------------------------------------------------------------------ */

const DetailRow = ({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) => (
  <div
    className={cn(
      'flex items-center justify-between gap-4 px-5 py-3.5',
      !isLast && 'border-b border-[#DDE2E5] dark:border-border'
    )}
  >
    <span className="text-sm text-grey3 dark:text-gray-400">{label}</span>
    <span className="text-right text-sm font-medium text-[#333333] dark:text-white">
      {value}
    </span>
  </div>
);

const SectionTitle = ({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
      {children}
    </h3>
    {trailing}
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] dark:border dark:border-border overflow-hidden">
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Earnings milestones (custom-clothing orders)                        */
/* ------------------------------------------------------------------ */

// Map a milestone key to a friendly label, tolerating unknown values.
const milestoneLabel = (rec: OrderEarningRecord): string => {
  const m = String(rec.milestone ?? '').toLowerCase();
  if (m.includes('upfront') || m.includes('deposit')) return 'Upfront Payment';
  if (m.includes('completion') || m.includes('final') || m.includes('balance'))
    return 'Completion Payment';
  if (rec.milestone) {
    // Title-case an unknown key, e.g. "on_shipment" -> "On Shipment".
    return String(rec.milestone)
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
  }
  return 'Earnings';
};

// Describe when this portion is (or was) released, from status/dates or, as a
// fallback, the milestone's known release rule.
const readReleaseText = (rec: OrderEarningRecord): string => {
  const status = String(rec.status ?? '').toLowerCase();
  const date = rec.released_at ?? rec.eligible_at;
  if (status.includes('paid') || status.includes('released'))
    return date ? `Released ${formatDate(date)}` : 'Released';
  if (status.includes('eligible')) return 'Eligible for payout';
  if (rec.description) return String(rec.description);
  const m = String(rec.milestone ?? '').toLowerCase();
  if (m.includes('upfront') || m.includes('deposit'))
    return 'Releases on shipment';
  if (m.includes('completion') || m.includes('final') || m.includes('balance'))
    return 'Releases after delivery';
  return 'Pending';
};

// Per-order earnings breakdown. Only custom-clothing orders return milestone
// records, so this renders nothing (no heading) for simple orders or while the
// request is in flight — the single "Your earnings" line in Payment still
// covers those.
const EarningsMilestones = ({ orderId }: { orderId: string }) => {
  // TODO(api): GET /business/earnings?order_id= is not implemented on the
  // backend yet (it 404s). Skip the request so we don't spam the console — the
  // section simply renders nothing. Flip `skip` back to `!orderId` once the
  // endpoint is live.
  const { data, isLoading } = useGetOrderEarningsQuery(orderId, {
    skip: true,
  });
  const records = Array.isArray(data?.data) ? data.data : [];
  if (isLoading || records.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionTitle>Earnings Breakdown</SectionTitle>
      <Card>
        {records.map((rec, i) => {
          const pct =
            typeof rec.percentage === 'number' ? ` (${rec.percentage}%)` : '';
          return (
            <DetailRow
              key={rec._id ?? i}
              label={`${milestoneLabel(rec)}${pct}`}
              isLast={i === records.length - 1}
              value={
                <div className="flex flex-col items-end">
                  <span className="text-[#0F973D] font-semibold">
                    {typeof rec.amount === 'number'
                      ? formatNaira(rec.amount)
                      : ''}
                  </span>
                  <span className="text-xs text-grey3 dark:text-gray-400">
                    {readReleaseText(rec)}
                  </span>
                </div>
              }
            />
          );
        })}
      </Card>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  Product helpers                                                     */
/* ------------------------------------------------------------------ */

/** Resolve the display name from a populated product */
function getProductName(product: PopulatedProduct | null): string {
  if (!product) return 'Product';
  // Kind-specific names take priority
  if (product.clothing?.name) return product.clothing.name;
  if (product.fabric?.name) return product.fabric.name;
  if (product.accessory?.name) return product.accessory.name;
  return product.name ?? 'Product';
}

/** Resolve the first image URL from a populated product */
function getProductImageUrl(product: PopulatedProduct | null): string | null {
  if (!product) return null;

  // Try kind-specific images first (they have the proper sub-doc structure)
  const kindImages =
    product.clothing?.images ??
    product.fabric?.images ??
    product.accessory?.images;
  if (kindImages?.length) {
    const first = kindImages[0];
    if (typeof first === 'object' && first?.url) return first.url;
  }

  // Fallback to top-level images array
  if (product.images?.length) {
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (typeof first === 'object' && first?.url) return first.url;
  }
  return null;
}

/** Kind badge config */
const KIND_BADGE: Record<string, { label: string; className: string }> = {
  clothing: {
    label: 'Clothing',
    className:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
  fabric: {
    label: 'Fabric',
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  accessory: {
    label: 'Accessory',
    className:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
};

/* ------------------------------------------------------------------ */
/*  Order item row                                                     */
/* ------------------------------------------------------------------ */

// A shipment's business id, whether it's a plain id or a populated object.
const shipmentBizId = (b: unknown): string | undefined =>
  typeof b === 'string' ? b : (b as { _id?: string })?._id;

// ── Optimistic drawer patches ──
// The drawer keeps a local copy of the order, so after a mutation we patch that
// copy to reflect the new state immediately (rather than waiting for a reopen).

/** Mark one item rejected + recompute this vendor's money from what's left. */
function rejectItemLocally(
  order: Order,
  itemId: string,
  businessId?: string
): Order {
  const items = (order.items ?? []).map((it) =>
    it._id === itemId ? { ...it, rejected: true } : it
  );
  // Reuse the effective commission rate from the current breakdown.
  const bd = order.vendor_breakdown;
  const rate = bd && bd.subtotal > 0 ? bd.commission / bd.subtotal : 0.1;
  const activeSubtotal = items
    .filter((it) => it.business === businessId && !it.rejected)
    .reduce((s, it) => s + (it.total_price ?? it.pricing?.final ?? 0), 0);
  const commission = Math.round(activeSubtotal * rate);
  const vendor_breakdown = {
    subtotal: activeSubtotal,
    commission,
    net: activeSubtotal - commission,
  };
  const stillActive = items.some(
    (it) => it.business === businessId && !it.rejected
  );
  const shipments = stillActive
    ? order.shipments
    : (order.shipments ?? []).map((s) =>
        shipmentBizId(s.business) === businessId &&
        s.shipment_type !== 'fabric_transfer'
          ? {
              ...s,
              rejected: true,
              status: 'failed' as VendorShipment['status'],
            }
          : s
      );
  const allRejected =
    (shipments ?? []).length > 0 && (shipments ?? []).every((s) => s.rejected);
  return {
    ...order,
    items,
    shipments,
    vendor_breakdown,
    status: allRejected ? ('cancelled' as Order['status']) : order.status,
  };
}

/** Fail this vendor's whole portion (all their items + their shipment). */
function rejectVendorLocally(order: Order, businessId?: string): Order {
  const items = (order.items ?? []).map((it) =>
    it.business === businessId ? { ...it, rejected: true } : it
  );
  const shipments = (order.shipments ?? []).map((s) =>
    shipmentBizId(s.business) === businessId &&
    s.shipment_type !== 'fabric_transfer'
      ? { ...s, rejected: true, status: 'failed' as VendorShipment['status'] }
      : s
  );
  const allRejected =
    shipments.length > 0 && shipments.every((s) => s.rejected);
  return {
    ...order,
    items,
    shipments,
    vendor_breakdown: { subtotal: 0, commission: 0, net: 0 },
    status: allRejected ? ('cancelled' as Order['status']) : order.status,
  };
}

const OrderItemRow: React.FC<{
  item: OrderItem;
  order?: Order;
  isLast?: boolean;
  /** Hands this item's images to the drawer's single large preview. */
  onPreview: (images: string[], title: string) => void;
  /** Whether a per-item reject control should be offered for this row. */
  canReject?: boolean;
  /** Opens the reject dialog for this item id. */
  onReject?: (itemId?: string) => void;
}> = ({
  item,
  order,
  isLast = false,
  onPreview,
  canReject = false,
  onReject,
}) => {
  const product =
    typeof item.product === 'object' && item.product !== null
      ? (item.product as PopulatedProduct)
      : null;
  const name = getProductName(product);
  const imageUrl = getProductImageUrl(product);
  const gallery = allProductImages(product);
  const kind = product?.kind;
  const kindBadge = kind ? KIND_BADGE[kind] : null;
  const basePrice = product?.base_price;

  // Sum up all selection amounts for total + item count
  let totalAmount = item.total_price ?? 0;
  let totalQty = 0;
  if (totalAmount === 0) {
    item.color_variant_selections?.forEach((v) => {
      totalAmount += v.total_amount;
      totalQty += v.quantity;
    });
    item.fabric_selections?.forEach((f) => {
      totalAmount += f.total_amount;
      totalQty += f.quantity;
    });
    item.style_selections?.forEach((s) => {
      totalAmount += s.total_amount;
      totalQty += s.quantity;
    });
    item.accessory_selections?.forEach((a) => {
      totalAmount += a.total_amount;
      totalQty += a.quantity;
    });
    item.addon_selections?.forEach((ad) => {
      totalAmount += ad.total_amount;
      totalQty += ad.quantity;
    });
  } else {
    item.color_variant_selections?.forEach((v) => (totalQty += v.quantity));
    item.fabric_selections?.forEach((f) => (totalQty += f.quantity));
    item.style_selections?.forEach((s) => (totalQty += s.quantity));
    item.accessory_selections?.forEach((a) => (totalQty += a.quantity));
    item.addon_selections?.forEach((ad) => (totalQty += ad.quantity));
  }

  // Discount taken from the frozen pricing snapshot. Only struck through when
  // the pre-discount figure actually differs from what was charged, so a row
  // never implies a discount that wasn't applied.
  const discount =
    typeof item.pricing?.discount === 'number' && item.pricing.discount > 0
      ? item.pricing.discount
      : undefined;
  const beforeDiscount =
    discount !== undefined &&
    typeof item.pricing?.before_discount === 'number' &&
    item.pricing.before_discount !== totalAmount
      ? item.pricing.before_discount
      : undefined;

  // One-line summary of what's inside (drives the "View details" affordance).
  const summaryBits: string[] = [];
  const plural = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;
  // Colour + size chosen (clothing / accessory) — snapshotted on the order item,
  // so the row hints at the colour without opening the detail modal.
  (item.color_variant_selections ?? []).forEach((v) => {
    const bit = [v.color, v.size ? `Size ${v.size}` : undefined]
      .filter(Boolean)
      .join(' · ');
    if (bit) summaryBits.push(bit);
  });
  (item.accessory_selections ?? []).forEach((a) => {
    if (a.color) summaryBits.push(a.color);
  });
  if (item.style_selections?.length)
    summaryBits.push(plural(item.style_selections.length, 'style', 'styles'));
  if (item.fabric_selections?.length) summaryBits.push('fabric');
  if (item.accessory_selections?.length)
    summaryBits.push(
      plural(item.accessory_selections.length, 'accessory', 'accessories')
    );
  if (item.addon_selections?.length)
    summaryBits.push(plural(item.addon_selections.length, 'add-on', 'add-ons'));
  if (item.applied_fabric) summaryBits.push('external fabric');

  const hasDetails = !!(
    item.color_variant_selections?.length ||
    item.style_selections?.length ||
    item.fabric_selections?.length ||
    item.accessory_selections?.length ||
    item.addon_selections?.length ||
    item.note ||
    item.applied_fabric ||
    product?.clothing?.description
  );

  const openModal = () => {
    if (hasDetails) NiceModal.show(OrderItemDetailModal, { item, order });
  };

  // Always fires — with no image the preview shows a placeholder rather than
  // the click doing nothing.
  const openMedia = () => {
    const images = gallery.length > 0 ? gallery : imageUrl ? [imageUrl] : [];
    onPreview(images, name);
  };

  // The thumbnail and the rest of the row are sibling buttons rather than one
  // nested inside the other — the image drives the large preview, the row opens
  // the item breakdown.
  return (
    <div
      className={cn(
        'group flex w-full items-start gap-3 px-5 py-4 transition-colors',
        hasDetails && 'hover:bg-gray-50/70 dark:hover:bg-white/5',
        !isLast && 'border-b border-[#DDE2E5] dark:border-border'
      )}
    >
      {/* Thumbnail — opens the media preview, with or without an image. */}
      <button
        type="button"
        onClick={openMedia}
        aria-label={`View ${name} media`}
        className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700 cursor-pointer"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <Package className="size-5 text-gray-400" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white/0 transition-colors hover:bg-black/35 hover:text-white">
          <Maximize2 className="size-3.5" />
        </span>
      </button>

      {/* Info */}
      <button
        type="button"
        onClick={openModal}
        disabled={!hasDetails}
        className={cn(
          'min-w-0 flex-1 text-left',
          hasDetails && 'cursor-pointer'
        )}
      >
        <p className="truncate text-sm font-medium text-[#333333] dark:text-white group-hover:text-primary transition-colors">
          {name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {kindBadge && (
            <span
              className={cn(
                'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                kindBadge.className
              )}
            >
              {kindBadge.label}
            </span>
          )}
          {basePrice !== undefined && (
            <span className="text-[11px] text-grey3 dark:text-gray-400">
              Base: {formatNaira(basePrice)}
            </span>
          )}
        </div>
        {summaryBits.length > 0 && (
          <p className="mt-1 truncate text-xs text-grey3 dark:text-gray-400">
            {summaryBits.join(' · ')}
          </p>
        )}
        {hasDetails && (
          <span className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
            View details
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </button>

      {/* Total */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
          {formatNaira(totalAmount)}
        </p>
        {beforeDiscount !== undefined && (
          <p className="text-[11px] text-grey3 dark:text-gray-400 line-through">
            {formatNaira(beforeDiscount)}
          </p>
        )}
        {totalQty > 0 && (
          <p className="mt-0.5 text-[11px] text-grey3 dark:text-gray-400">
            QTY: {totalQty}
          </p>
        )}
        {discount !== undefined && (
          <span className="mt-1 inline-flex items-center rounded-md bg-[#D42620] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {formatNaira(discount)} off
          </span>
        )}
        {item.rejected ? (
          <span className="mt-1.5 inline-flex items-center rounded-md bg-[#FBEAE9] dark:bg-[#D42620]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#D42620] dark:text-[#F87171]">
            Rejected
          </span>
        ) : (
          canReject &&
          item._id &&
          onReject && (
            <button
              type="button"
              onClick={() => onReject(item._id)}
              className="mt-1.5 block text-[11px] font-medium text-[#D42620] hover:underline dark:text-[#F87171]"
            >
              Reject item
            </button>
          )
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Copy-to-clipboard hook                                             */
/* ------------------------------------------------------------------ */

const useCopyId = () => {
  const [copied, setCopied] = React.useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return { copied, copy };
};

/* ------------------------------------------------------------------ */
/*  Main drawer                                                        */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Scoped fabric-transfer drawer                                      */
/* ------------------------------------------------------------------ */

/** Build the tailor's ship-to lines from a populated destination business. */
function readTailorAddress(
  dest: string | ShipmentBusinessRef | undefined
): { name: string; lines: string[]; phone?: string } | null {
  if (!dest || typeof dest === 'string') return null;
  const name = dest.business_name || 'Tailor';
  const street = dest.validated_address || dest.business_address;
  const parts = [street, dest.address_line_2, dest.city, dest.state].filter(
    (v, i, all): v is string => {
      if (typeof v !== 'string' || !v.trim()) return false;
      if (i === 0) return true;
      const first = all[0];
      // Don't repeat city/state already spelled out in the street line.
      return typeof first === 'string'
        ? !first.toLowerCase().includes(v.toLowerCase())
        : true;
    }
  );
  return { name, lines: parts, phone: dest.business_phone_number };
}

export const OrderDetailsDrawer = create<OrderDetailsDrawerProps>(
  ({ order: orderProp }) => {
    const { visible, resolve, hide, remove } = useModal();
    const { copied, copy } = useCopyId();

    // Back the passed order with local state so a successful fulfill can update
    // the drawer in place (the shipment flips to SHIPPED with tracking + Print
    // Label). Re-sync if the drawer is reopened with a different order.
    const [order, setOrder] = useState<Order>(orderProp);
    useEffect(() => {
      setOrder(orderProp);
    }, [orderProp]);

    // Vendor business ID for filtering items/shipments
    const activeBusiness = useAppSelector(selectActiveBusiness);
    const businessId = activeBusiness?._id ?? '';

    // This vendor is on the order ONLY as a fabric-transfer source (the backend
    // trimmed it to their transfer). Render it as a fabric order shipped
    // vendor→vendor: fabric + earnings + ship-to tailor + the confirm/fulfill
    // actions — while hiding the customer, the garment/design and the order
    // total, none of which are this vendor's to see.
    const isFabricTransferOnly = order.vendor_role === 'fabric_transfer';

    // Vendor-specific data
    const vendorItems = businessId
      ? getVendorItems(order, businessId)
      : order.items;
    const vendorShipment = businessId
      ? getVendorShipment(order, businessId)
      : order.shipments?.[0];
    const vendorSubtotal = businessId
      ? getVendorSubtotal(order, businessId)
      : order.subtotal;

    // This vendor's own order total: their goods + their delivery, NOT the whole
    // multi-vendor basket. (Kept in sync with the backend's per-vendor scoping;
    // computed here too so it's right even before that deploys.)
    const vendorOrderTotal =
      (vendorSubtotal ?? 0) + (vendorShipment?.shipping_fee ?? 0);

    // Prefer the backend's per-vendor breakdown (this vendor's items only, with
    // commission computed the same way as the real earning). It is reliable on
    // multi-vendor AND "use my own fabric" orders, where order.vendor_earnings
    // is order-wide and folds in other vendors'/the fabric vendor's net.
    const breakdown = order.vendor_breakdown;

    // order.vendor_earnings is ORDER-WIDE (net across ALL vendors' items), so on
    // a multi-vendor order it overstates a single vendor's share. Used only as a
    // fallback when the backend didn't send vendor_breakdown.
    const distinctBusinesses = new Set(
      (order.items ?? [])
        .map((i) => i.business)
        .filter((b): b is string => Boolean(b))
    );
    const isMultiVendor = distinctBusinesses.size > 1;

    const vendorEarnings = ((): number | undefined => {
      if (breakdown) return breakdown.net;
      if (order.vendor_earnings === undefined) return undefined;
      if (!isMultiVendor) return order.vendor_earnings;
      const orderGoods = getOrderGoodsSubtotal(order);
      if (orderGoods <= 0) return undefined;
      return Math.round(vendorSubtotal * (order.vendor_earnings / orderGoods));
    })();

    // Commission is the gap between this vendor's subtotal and their net
    // earnings — both on a per-vendor basis, so it stays non-negative.
    const vendorCommission = breakdown
      ? breakdown.commission
      : vendorEarnings !== undefined &&
          typeof vendorSubtotal === 'number' &&
          vendorSubtotal > vendorEarnings
        ? vendorSubtotal - vendorEarnings
        : undefined;

    // Fulfillment
    const [fulfillOrder, { isLoading: isFulfilling }] =
      useFulfillOrderMutation();
    const [confirmOrder, { isLoading: isConfirming }] =
      useConfirmOrderMutation();
    const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();
    const [handoverClaim, { isLoading: isHandingOver }] =
      useHandoverClaimMutation();
    const [rejectOrderItem, { isLoading: isRejectingItem }] =
      useRejectOrderItemMutation();

    // Reject dialog state. When `rejectItemId` is set, the dialog rejects that
    // single item; otherwise it rejects the vendor's whole portion.
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectItemId, setRejectItemId] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);

    // Bespoke customer chat: available on bespoke orders (not fabric transfers);
    // sending is open only while the order is in production or transit.
    const canChat = order.type === 'bespoke' && !isFabricTransferOnly;
    const chatCanSend = ['processing', 'in_transit'].includes(order.status);

    // Event fabric claims (guests buying yards from a reservation). A PICKUP
    // claim carries no shipment — the guest collects their cut, so its whole
    // lifecycle is: paid → vendor hands the yards over → completed. A claim
    // with delivery chosen DOES carry a shipment and flows through the normal
    // confirm → fulfill → courier pipeline like any fabric order.
    const isReservationClaim = (order as any).type === 'reservation_claim';
    const isPickupClaim =
      isReservationClaim && (order.shipments ?? []).length === 0;
    const claimPaid = (order as any).payment_status === 'paid';
    const canHandover =
      isPickupClaim &&
      claimPaid &&
      ['pending', 'in_review', 'processing'].includes(order.status);

    const handleHandover = async () => {
      try {
        await handoverClaim({ reference: order.reference }).unwrap();
        setOrder((prev) => ({
          ...prev,
          status: 'completed' as Order['status'],
        }));
        toast.success(
          'Marked as handed over — your earnings are scheduled for release.'
        );
      } catch (err: any) {
        toast.error(
          readApiError(
            err,
            'Could not complete the handover. Please try again.'
          )
        );
      }
    };

    // Confirmation state derived from shipment
    const isConfirmed = vendorShipment?.confirmed === true;
    const isRejected = vendorShipment?.rejected === true;
    const needsConfirmation =
      ['pending', 'in_review'].includes(order.status) &&
      vendorShipment &&
      !isConfirmed &&
      !isRejected;

    // The backend now reverts ready_to_ship -> pending when a fulfill fails, so
    // fresh failures show a normal Fulfill button. This still catches shipments
    // left in 'ready_to_ship' with no label by a PRE-FIX failed attempt (or a
    // crash mid-fulfill): the backend allows re-claiming, so offer a retry
    // rather than a dead end. Safe to keep as a defensive net.
    const isRetryFulfill =
      vendorShipment?.status === 'ready_to_ship' && !vendorShipment?.label_url;

    const canFulfillBase =
      ['pending', 'in_review', 'processing'].includes(order.status) &&
      (!vendorShipment ||
        vendorShipment.status === 'pending' ||
        vendorShipment.status === 'ready_to_ship') &&
      isConfirmed; // Must be confirmed before fulfillment

    // Fabric transfer data
    const outgoingFabricTransfers = businessId
      ? getFabricTransferShipments(order, businessId)
      : [];
    const incomingFabricTransfers = businessId
      ? getIncomingFabricTransfers(order, businessId)
      : [];
    const pendingIncomingFabric = businessId
      ? getPendingIncomingFabricTransfers(order, businessId)
      : [];

    // Block fulfillment if there are pending incoming fabric transfers
    const canFulfill = canFulfillBase && pendingIncomingFabric.length === 0;

    const hasLabel =
      vendorShipment?.label_url && vendorShipment.status !== 'pending';

    const handleFulfill = async () => {
      try {
        const res = await fulfillOrder({ reference: order.reference }).unwrap();
        // Backend returns { shipment, label_url, tracking_number, order_status }.
        // Merge it in so the drawer reflects the SHIPPED shipment (with tracking
        // number + Print Label) right away — the order-level status stays
        // PROCESSING, so the shipment is the only in-app signal fulfill worked.
        const payload: any = (res as any)?.data ?? res;
        const labelUrl = payload?.label_url ?? payload?.shipment?.label_url;
        const trackingNumber =
          payload?.tracking_number ?? payload?.shipment?.tracking_number;
        const shipmentId =
          payload?.shipment_id ?? payload?.shipment?.shipment_id;
        const orderStatus = payload?.order_status;
        setOrder((prev) => ({
          ...prev,
          status: (orderStatus as Order['status']) ?? prev.status,
          shipments: (prev.shipments ?? []).map((s) =>
            vendorShipment && s._id === vendorShipment._id
              ? {
                  ...s,
                  status: 'shipped' as VendorShipment['status'],
                  ...(labelUrl ? { label_url: labelUrl } : {}),
                  ...(trackingNumber
                    ? { tracking_number: trackingNumber }
                    : {}),
                  ...(shipmentId ? { shipment_id: shipmentId } : {}),
                  shipped_at: s.shipped_at ?? new Date().toISOString(),
                }
              : s
          ),
        }));
        toast.success('Shipping label created!');
      } catch (err: any) {
        // The backend reverts the shipment ready_to_ship -> pending when the
        // Shipbubble label call fails, then re-throws the real error. Mirror
        // that locally so the drawer keeps showing a normal Fulfill button for
        // the retry (rather than a stale ready_to_ship / retry state).
        setOrder((prev) => ({
          ...prev,
          shipments: (prev.shipments ?? []).map((s) =>
            vendorShipment &&
            s._id === vendorShipment._id &&
            (s.status === 'pending' || s.status === 'ready_to_ship')
              ? { ...s, status: 'pending' as VendorShipment['status'] }
              : s
          ),
        }));
        const errorMsg = readApiError(
          err,
          err?.error || 'Could not create shipping label. Please try again.'
        );
        toast.error(errorMsg);
      }
    };

    const handleConfirm = async () => {
      try {
        await confirmOrder({ reference: order.reference }).unwrap();
        // Optimistically reflect the confirmation so the drawer flips to the
        // fulfill state immediately (the modal keeps a local order copy, so it
        // otherwise wouldn't update until reopened).
        setOrder((prev) => {
          const shipments = (prev.shipments ?? []).map((s) =>
            vendorShipment && s._id === vendorShipment._id
              ? {
                  ...s,
                  confirmed: true,
                  confirmed_at: s.confirmed_at ?? new Date().toISOString(),
                }
              : s
          );
          const active = shipments.filter((s) => !s.rejected);
          const allConfirmed =
            active.length > 0 && active.every((s) => s.confirmed);
          return {
            ...prev,
            shipments,
            status: allConfirmed
              ? ('processing' as Order['status'])
              : prev.status,
          };
        });
        toast.success(
          'Order confirmed! You can now prepare it for fulfillment.'
        );
      } catch {
        toast.error('Could not confirm order. Please try again.');
      }
    };

    const handleReject = async () => {
      try {
        if (rejectItemId) {
          await rejectOrderItem({
            reference: order.reference,
            itemId: rejectItemId,
            reason: rejectReason.trim() || undefined,
          }).unwrap();
          // Optimistically mark the item rejected + recompute this vendor's money
          // from the remaining active items (so subtotal/earnings update now).
          setOrder((prev) => rejectItemLocally(prev, rejectItemId, businessId));
          toast.success(
            'Item rejected. The customer will be refunded for that item.'
          );
        } else {
          await rejectOrder({
            reference: order.reference,
            reason: rejectReason.trim() || undefined,
          }).unwrap();
          // Optimistically fail this vendor's shipment + items → their money
          // drops to 0 and the reject/confirm buttons disappear.
          setOrder((prev) => rejectVendorLocally(prev, businessId));
          toast.success(
            'Order rejected. The customer will be refunded for your items.'
          );
        }
        setShowRejectDialog(false);
        setRejectReason('');
        setRejectItemId(null);
      } catch (err: any) {
        toast.error(readApiError(err, 'Could not reject. Please try again.'));
      }
    };

    // Whether the vendor can still reject items (order active + not dispatched).
    const canRejectItems =
      ['pending', 'in_review', 'processing'].includes(order.status) &&
      (!vendorShipment ||
        vendorShipment.status === 'pending' ||
        vendorShipment.status === 'ready_to_ship') &&
      !vendorShipment?.rejected;

    // Open the reject dialog targeting a single item.
    const openRejectItem = (itemId?: string) => {
      if (!itemId) return;
      setRejectItemId(itemId);
      setRejectReason('');
      setShowRejectDialog(true);
    };

    const handleClose = (open?: boolean | React.MouseEvent) => {
      if (typeof open !== 'boolean' || !open) {
        resolve({ resolved: true });
        hide();
        setTimeout(() => remove(), 300);
      }
    };

    // Customer link
    const customerId = order.customer?._id ?? '';
    const openCustomer = () => {
      if (customerId) NiceModal.show(CustomerDetailsModal, { customerId });
    };

    // Badge
    const badge = deliveryBadge(readStatus(order));
    const displayOrderId = readOrderId(order);

    // Shipping address. The API returns the street line as `address` and the
    // phone as `phone_number`; `street` / `phone` are legacy fallbacks.
    const addr = order.address ?? {};
    const addressPhone = addr.phone_number ?? addr.phone;
    // The street line already includes city/state/country on most records, so
    // only append the parts it doesn't already mention.
    const streetLine = addr.address ?? addr.street;
    const addressParts = [
      streetLine,
      addr.city,
      addr.state,
      addr.country,
    ].filter((value, index, all): value is string => {
      if (typeof value !== 'string' || !value.trim()) return false;
      if (index === 0) return true;
      const street = all[0];
      return typeof street === 'string'
        ? !street.toLowerCase().includes(value.toLowerCase())
        : true;
    });

    // The companion panel opens with the drawer showing the order's garments,
    // so the vendor sees what was ordered without an extra click. Clicking a
    // thumbnail swaps the panel's contents rather than stacking a lightbox.
    const [preview, setPreview] = useState<{
      images: string[];
      title: string;
    } | null>(null);

    // Below `sm` the companion panel has nowhere to sit next to a full-width
    // drawer, so the thumbnail falls back to the lightbox modal there.
    const canShowPanel = useMediaQuery('(min-width: 640px)', false);

    const showPreview = (images: string[], title: string) => {
      if (canShowPanel) {
        setPreview({ images, title });
      } else {
        NiceModal.show(MediaPreviewModal, { images, title });
      }
    };

    // Bespoke orders have no catalogue items — the design IS the garment.
    const bespokeDesign = readBespokeDesign(order);

    // What the panel shows before any thumbnail is clicked: the design for a
    // bespoke order, otherwise every image across the vendor's own items.
    const defaultMedia = useMemo(() => {
      const fromDesign = bespokeDesign?.images ?? [];
      const fromItems = (vendorItems ?? []).flatMap((item) =>
        allProductImages(asProduct(item.product))
      );
      return Array.from(new Set([...fromDesign, ...fromItems])).filter(Boolean);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderProp]);

    // Open the panel with the drawer, and re-seed it when the drawer is
    // reopened on a different order. Below `sm` there's no room beside a
    // full-width drawer, so it stays closed until a thumbnail is tapped.
    useEffect(() => {
      setPreview(
        canShowPanel && defaultMedia.length > 0
          ? { images: defaultMedia, title: `Order ${displayOrderId}` }
          : null
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderProp, canShowPanel]);

    return (
      <Sheet open={visible} onOpenChange={handleClose}>
        {preview && (
          <OrderMediaPanel
            // Re-keying resets the panel's carousel index when a different
            // thumbnail takes it over.
            key={`${preview.title}:${preview.images[0] ?? ''}`}
            images={preview.images}
            title={preview.title}
            drawerOpen={visible}
            // The handle dismisses the whole thing — drawer and panel — which
            // is what it did before it was scoped to just the preview.
            onClose={handleClose}
            closeLabel="Close order details"
          />
        )}
        <SheetContent
          side="right"
          onInteractOutside={ignoreMediaPanelInteraction}
          className="flex sm:flex w-full flex-col !overflow-hidden p-0 sm:max-w-[440px] !top-6 !bottom-6 !right-6 rounded-2xl custom-card-shadow bg-white dark:bg-card"
          style={{
            height: 'calc(100vh - 3rem)',
            maxHeight: 'calc(100vh - 3rem)',
          }}
        >
          {/* Header */}
          {/* pr-12 reserves room on the right for the Sheet's built-in close (X)
              at right-4, so the status badge no longer sits under it. */}
          <SheetHeader className="shrink-0 border-b border-border py-5 pl-4 pr-12 sm:pl-6">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-lg font-semibold text-[#0C0C0D] dark:text-white">
                {isFabricTransferOnly ? 'Fabric transfer' : 'Order details'}
              </SheetTitle>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {canChat && (
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="inline-flex h-[26px] items-center gap-1 whitespace-nowrap rounded-lg border border-border px-3 text-xs font-medium text-grey-black transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
                  >
                    <MessageSquare className="size-3.5" />
                    Message
                  </button>
                )}
                {isEarningsFrozen(order) && (
                  <span className="inline-flex h-[26px] items-center gap-1 whitespace-nowrap rounded-lg bg-[#FEF6E7] px-3 text-xs font-medium text-[#DD900D]">
                    <ShieldAlert className="size-3.5" />
                    Earnings Frozen
                  </span>
                )}
                <span
                  className={cn(
                    'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                    badge.className
                  )}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable body */}
          <OverlayScroll className="flex-1 min-h-0">
            <div className="space-y-5 px-4 py-5 sm:px-6">
              {/* ── Order Summary ── */}
              <section className="space-y-3">
                <SectionTitle>Order Summary</SectionTitle>
                <Card>
                  <DetailRow
                    label="Order ID"
                    value={
                      <button
                        type="button"
                        onClick={() => copy(displayOrderId)}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#333333] dark:text-white hover:text-primary transition-colors"
                      >
                        {displayOrderId}
                        {copied ? (
                          <Check className="size-3.5 text-green-600" />
                        ) : (
                          <Copy className="size-3.5 text-grey3" />
                        )}
                      </button>
                    }
                  />
                  <DetailRow
                    label="Order date"
                    value={formatDate(order.createdAt)}
                    // On a fabric transfer this is the last visible row — the
                    // customer / items / total below are hidden.
                    isLast={isFabricTransferOnly}
                  />
                  {/* Customer, items and total are hidden on a fabric transfer —
                      they belong to the customer and the tailor, not this
                      fabric vendor. */}
                  {!isFabricTransferOnly && (
                    <>
                      <DetailRow
                        label="Customer"
                        value={
                          customerId ? (
                            <button
                              type="button"
                              onClick={openCustomer}
                              className="inline-flex cursor-pointer items-center gap-1 text-[#3387CC] hover:underline underline-offset-2 transition-colors"
                            >
                              {readCustomerHandle(order)}
                              <ExternalLink className="size-3" />
                            </button>
                          ) : (
                            readCustomerName(order)
                          )
                        }
                      />
                      <DetailRow
                        label="Items"
                        value={`${vendorItems.length} item${vendorItems.length === 1 ? '' : 's'}`}
                      />
                      {order.type === 'bespoke' && (
                        <DetailRow
                          label="Type"
                          value={
                            <span className="inline-flex items-center gap-1">
                              <Tag className="size-3" />
                              Bespoke
                            </span>
                          }
                        />
                      )}
                      <DetailRow
                        label="Total"
                        value={
                          <span className="text-base font-semibold text-[#0C0C0D] dark:text-white">
                            {formatNaira(vendorOrderTotal)}
                          </span>
                        }
                        isLast
                      />
                    </>
                  )}
                </Card>
              </section>

              {/* ── Fabric item (fabric transfer only) ──
                  The fabric vendor's equivalent of the tailor's "Your items"
                  card: the one thing they're sending, tappable to open the
                  fabric detail modal. */}
              {isFabricTransferOnly && outgoingFabricTransfers.length > 0 && (
                <section className="space-y-3">
                  <SectionTitle>Fabric</SectionTitle>
                  <Card>
                    {outgoingFabricTransfers.map((transfer, index) => {
                      const fName = extractFabricName(transfer.fabric_product);
                      const fImg = fabricImageUrl(transfer);
                      return (
                        <div
                          key={transfer._id}
                          className={cn(
                            'group flex w-full items-start gap-3 px-5 py-4 transition-colors hover:bg-gray-50/70 dark:hover:bg-white/5',
                            index !== outgoingFabricTransfers.length - 1 &&
                              'border-b border-[#DDE2E5] dark:border-border'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              fImg
                                ? NiceModal.show(MediaPreviewModal, {
                                    images: [fImg],
                                    title: fName,
                                  })
                                : undefined
                            }
                            aria-label={`View ${fName} media`}
                            className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700 cursor-pointer"
                          >
                            {fImg ? (
                              <Image
                                src={fImg}
                                alt={fName}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <Package className="size-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              NiceModal.show(FabricTransferDetailModal, {
                                transfer,
                                fabricValue: order.fabric_value,
                              })
                            }
                            className="min-w-0 flex-1 cursor-pointer text-left"
                          >
                            <p className="truncate text-sm font-medium text-[#333333] dark:text-white group-hover:text-primary transition-colors">
                              {fName}
                            </p>
                            <p className="mt-1 text-xs text-grey3 dark:text-gray-400">
                              {transfer.fabric_yards ?? '—'} yards
                            </p>
                            <span className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                              View details
                              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </button>
                          {typeof order.fabric_value === 'number' &&
                            order.fabric_value > 0 && (
                              <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
                                  {formatNaira(order.fabric_value)}
                                </p>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </Card>
                </section>
              )}

              {/* ── Fabric earnings (fabric transfer only) ──
                  Makes the transfer read like a real fabric order: the same
                  value − commission = earnings breakdown as any regular order,
                  for the fabric the customer chose. */}
              {isFabricTransferOnly && (
                <section className="space-y-3">
                  <SectionTitle>Your fabric sale</SectionTitle>
                  <Card>
                    <DetailRow
                      label="Fabric value"
                      value={formatNaira(order.fabric_value)}
                      isLast={
                        order.fabric_commission === undefined &&
                        order.fabric_net === undefined &&
                        !order.payout_status
                      }
                    />
                    {order.fabric_commission !== undefined && (
                      <DetailRow
                        label="Platform commission"
                        value={
                          <span className="text-[#D42620]">
                            -{formatNaira(order.fabric_commission)}
                          </span>
                        }
                      />
                    )}
                    {order.fabric_net !== undefined && (
                      <DetailRow
                        label="Your earnings"
                        value={
                          <span className="text-base font-semibold text-[#0F973D]">
                            {formatNaira(order.fabric_net)}
                          </span>
                        }
                        isLast={!order.payout_status}
                      />
                    )}
                    {order.payout_status && (
                      <DetailRow
                        label="Payout"
                        value={
                          <span className="capitalize">
                            {order.payout_status}
                          </span>
                        }
                        isLast
                      />
                    )}
                  </Card>
                  <p className="px-1 text-xs text-grey3 dark:text-gray-400">
                    Paid by the customer. Released to your wallet once the
                    fabric is delivered to the tailor.
                  </p>
                </section>
              )}

              {/* ── Bespoke design ──
                  A bespoke order has no catalogue items, so the design is the
                  only picture of what the tailor has to make. The thumbnail
                  drives the large preview; the rest of the card opens the full
                  design breakdown. */}
              {bespokeDesign && (
                <section className="space-y-3">
                  <SectionTitle>Design</SectionTitle>
                  <Card>
                    <div className="flex w-full items-center gap-3 px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          showPreview(bespokeDesign.images, bespokeDesign.name)
                        }
                        aria-label={`View ${bespokeDesign.name} media`}
                        className="relative flex size-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700"
                      >
                        {bespokeDesign.images[0] ? (
                          <Image
                            src={bespokeDesign.images[0]}
                            alt={bespokeDesign.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <Tag className="size-5 text-gray-400" />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white/0 transition-colors hover:bg-black/35 hover:text-white">
                          <Maximize2 className="size-3.5" />
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          NiceModal.show(DesignDetailModal, {
                            design: bespokeDesign.design,
                          })
                        }
                        className="min-w-0 flex-1 cursor-pointer text-left"
                      >
                        <p className="truncate text-sm font-medium text-[#333333] dark:text-white">
                          {bespokeDesign.name}
                        </p>
                        <p className="mt-1 text-xs text-grey3 dark:text-gray-400">
                          Bespoke design
                        </p>
                        <span className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                          View design
                          <ChevronRight className="size-3.5" />
                        </span>
                      </button>
                    </div>
                  </Card>
                </section>
              )}

              {/* ── Vendor Items ──
                  Sits directly under Order Summary, as in the design — the
                  item media is the first thing the vendor should see, so the
                  Confirmation block must not push it below the fold.
                  Skipped entirely on a bespoke order, where the design card
                  above is the item, and on a fabric transfer, where this vendor
                  has no items — only the fabric they're sending. */}
              {!isFabricTransferOnly &&
                !(bespokeDesign && vendorItems.length === 0) && (
                  <section className="space-y-3">
                    <SectionTitle>
                      Your items ({vendorItems.length})
                    </SectionTitle>

                    {vendorItems.length > 0 ? (
                      <Card>
                        {vendorItems.map((item, index) => (
                          <OrderItemRow
                            key={index}
                            item={item}
                            order={order}
                            isLast={index === vendorItems.length - 1}
                            onPreview={showPreview}
                            canReject={canRejectItems && vendorItems.length > 1}
                            onReject={openRejectItem}
                          />
                        ))}
                      </Card>
                    ) : (
                      <Card>
                        <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
                          <Package className="size-8 text-grey3 dark:text-gray-500" />
                          <p className="text-sm text-grey3 dark:text-gray-400">
                            No items from your store in this order.
                          </p>
                        </div>
                      </Card>
                    )}
                  </section>
                )}

              {/* ── Confirmation Status ── */}
              {vendorShipment && (
                <section className="space-y-3">
                  <SectionTitle>Confirmation</SectionTitle>
                  <Card>
                    <DetailRow
                      label="Status"
                      value={
                        isRejected ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D42620]">
                            <XCircle className="size-3.5" />
                            Rejected
                          </span>
                        ) : isConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F973D]">
                            <CheckCircle className="size-3.5" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#DD900D]">
                            <Clock className="size-3.5" />
                            Awaiting Confirmation
                          </span>
                        )
                      }
                    />
                    {isConfirmed && vendorShipment.confirmed_at && (
                      <DetailRow
                        label="Confirmed on"
                        value={formatDate(vendorShipment.confirmed_at)}
                      />
                    )}
                    {isConfirmed && vendorShipment.fulfillment_deadline && (
                      <DetailRow
                        label="Fulfill by"
                        value={
                          <span
                            className={cn(
                              'text-sm font-medium',
                              new Date(vendorShipment.fulfillment_deadline) <
                                new Date()
                                ? 'text-[#D42620]'
                                : 'text-[#333333] dark:text-white'
                            )}
                          >
                            {formatDate(vendorShipment.fulfillment_deadline)}
                          </span>
                        }
                      />
                    )}
                    {isRejected && vendorShipment.rejected_at && (
                      <DetailRow
                        label="Rejected on"
                        value={formatDate(vendorShipment.rejected_at)}
                      />
                    )}
                    {isRejected && vendorShipment.rejection_reason && (
                      <DetailRow
                        label="Reason"
                        value={
                          <span className="text-sm text-grey3 dark:text-gray-400 italic">
                            {vendorShipment.rejection_reason}
                          </span>
                        }
                        isLast
                      />
                    )}
                    {vendorShipment.late_penalty_applied && (
                      <div className="px-5 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800/50">
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="size-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-700 dark:text-red-300">
                            Late penalty applied:{' '}
                            {formatNaira(
                              vendorShipment.late_penalty_amount ?? 0
                            )}{' '}
                            ({vendorShipment.late_penalty_days ?? 0} day
                            {(vendorShipment.late_penalty_days ?? 0) !== 1
                              ? 's'
                              : ''}{' '}
                            late)
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </section>
              )}

              {/* ── Fabric Transfer (Outgoing — You are the fabric vendor) ── */}
              {outgoingFabricTransfers.length > 0 && (
                <section className="space-y-3">
                  <SectionTitle>📦 Fabric Transfer</SectionTitle>
                  {outgoingFabricTransfers.map((transfer) => {
                    const tailor = readTailorAddress(
                      transfer.destination_business
                    );
                    const destName =
                      tailor?.name ??
                      extractBizName(transfer.destination_business);
                    const fabricName = extractFabricName(
                      transfer.fabric_product
                    );
                    const sBadge = shipmentStatusBadge(transfer.status);
                    return (
                      <Card key={transfer._id}>
                        <DetailRow
                          label="Ship to"
                          value={
                            <div className="flex flex-col items-end text-right">
                              <span className="text-sm font-medium">
                                {destName}{' '}
                                <span className="text-xs text-muted-foreground">
                                  (Tailor)
                                </span>
                              </span>
                              {tailor && tailor.lines.length > 0 && (
                                <span className="mt-0.5 text-xs text-grey3 dark:text-gray-400">
                                  {tailor.lines.join(', ')}
                                </span>
                              )}
                              {tailor?.phone && (
                                <span className="text-xs text-grey3 dark:text-gray-400">
                                  {tailor.phone}
                                </span>
                              )}
                            </div>
                          }
                        />
                        <DetailRow
                          label="Item"
                          value={`${transfer.fabric_yards ?? '—'} yards of ${fabricName}`}
                        />
                        {transfer.courier_name && (
                          <DetailRow
                            label="Courier"
                            value={transfer.courier_name}
                          />
                        )}
                        {transfer.tracking_number && (
                          <DetailRow
                            label="Tracking #"
                            value={
                              <button
                                type="button"
                                onClick={() => copy(transfer.tracking_number!)}
                                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#333333] dark:text-white hover:text-primary transition-colors"
                              >
                                {transfer.tracking_number}
                                <Copy className="size-3.5 text-grey3" />
                              </button>
                            }
                          />
                        )}
                        <DetailRow
                          label="Fee"
                          value={
                            <span>
                              {formatNaira(transfer.shipping_fee)}{' '}
                              <span className="text-xs text-muted-foreground">
                                (paid by customer)
                              </span>
                            </span>
                          }
                        />
                        <DetailRow
                          label="Status"
                          value={
                            <span
                              className={cn(
                                'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                                sBadge.className
                              )}
                            >
                              {sBadge.label}
                            </span>
                          }
                          isLast
                        />
                      </Card>
                    );
                  })}
                </section>
              )}

              {/* ── Applied / external fabric (what the customer supplied) ──
                  Shows the fabric identity — name, image, source vendor, yards,
                  price — even when no transfer shipment exists yet. The card
                  self-hides when the order has no fabric item. The logistics /
                  fulfillment-gating view lives in the section below. */}
              {(() => {
                const fItem = findFabricItem(order);
                const fabric = fItem
                  ? readOrderFabric(fItem, asProduct(fItem.product))
                  : null;
                const img = fabric?.imageUrl;
                return (
                  <OrderFabricCard
                    order={order}
                    businessId={businessId}
                    onViewFabric={
                      img
                        ? () =>
                            NiceModal.show(MediaPreviewModal, {
                              images: [img],
                              title: fabric?.name ?? 'Fabric',
                            })
                        : undefined
                    }
                  />
                );
              })()}

              {/* ── Incoming Fabric (You are the tailor/receiver) ── */}
              {incomingFabricTransfers.length > 0 && (
                <section className="space-y-3">
                  <SectionTitle>
                    {pendingIncomingFabric.length > 0
                      ? '🧵 Incoming Fabric'
                      : '🧵 Fabric Received ✓'}
                  </SectionTitle>
                  {incomingFabricTransfers.map((transfer) => {
                    const sourceName = extractBizName(transfer.business);
                    const fabricName = extractFabricName(
                      transfer.fabric_product
                    );
                    const isDelivered = transfer.status === 'delivered';
                    const sBadge = shipmentStatusBadge(transfer.status);
                    return (
                      <Card key={transfer._id}>
                        <DetailRow label="From" value={sourceName} />
                        <DetailRow
                          label="Item"
                          value={`${transfer.fabric_yards ?? '—'} yards of ${fabricName}`}
                        />
                        <DetailRow
                          label="Status"
                          value={
                            <span
                              className={cn(
                                'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                                sBadge.className
                              )}
                            >
                              {sBadge.label}
                            </span>
                          }
                          isLast={isDelivered}
                        />
                        {!isDelivered && (
                          <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800/50">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                You cannot fulfill this order until the fabric
                                arrives and is marked as delivered.
                              </p>
                            </div>
                          </div>
                        )}
                        {isDelivered && (
                          <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800/50">
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                              ✓ Fabric received — you can now start working on
                              this order!
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </section>
              )}

              {/* ── Payment ── */}
              {/* The vendor's money story is the hero: items subtotal minus
                  platform commission = their net earnings. Shipping is NOT the
                  vendor's money (customer-paid, goes to logistics), so it sits
                  below as a muted footnote — never next to the payout.
                  Hidden on a fabric transfer, whose money is the "Your fabric
                  sale" card above — the order's own totals aren't this vendor's. */}
              {!isFabricTransferOnly && (
                <section className="space-y-3">
                  <SectionTitle>Payment</SectionTitle>
                  <Card>
                    <DetailRow
                      label="Items subtotal"
                      value={formatNaira(vendorSubtotal)}
                      isLast={
                        vendorEarnings === undefined && !order.payout_status
                      }
                    />
                    {vendorCommission !== undefined && (
                      <DetailRow
                        label="Platform commission"
                        value={
                          <span className="text-[#D42620]">
                            -{formatNaira(vendorCommission)}
                          </span>
                        }
                      />
                    )}
                    {vendorEarnings !== undefined && (
                      <DetailRow
                        label="Your earnings"
                        value={
                          <span className="text-base font-semibold text-[#0F973D]">
                            {formatNaira(vendorEarnings)}
                          </span>
                        }
                        isLast={!order.payout_status}
                      />
                    )}
                    {order.payout_status && (
                      <DetailRow
                        label="Payout"
                        value={
                          <span className="capitalize">
                            {order.payout_status}
                          </span>
                        }
                        isLast
                      />
                    )}
                  </Card>
                  <p className="px-1 text-xs text-grey3 dark:text-gray-400">
                    Delivery (paid by customer):{' '}
                    {formatNaira(
                      vendorShipment?.shipping_fee ?? order.shipping_fee
                    )}
                  </p>
                </section>
              )}

              {/* Earnings breakdown (milestones) — custom-clothing orders only */}
              {!isFabricTransferOnly && (
                <EarningsMilestones orderId={order._id} />
              )}

              {/* ── Shipment ── */}
              {/* Skipped on a fabric transfer — the Fabric Transfer card above
                  already carries the courier, tracking and status. */}
              {!isFabricTransferOnly &&
                vendorShipment &&
                vendorShipment.status !== 'pending' && (
                  <section className="space-y-3">
                    <SectionTitle>Shipment</SectionTitle>
                    <Card>
                      <DetailRow
                        label="Status"
                        value={(() => {
                          const sBadge = shipmentStatusBadge(
                            vendorShipment.status
                          );
                          return (
                            <span
                              className={cn(
                                'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                                sBadge.className
                              )}
                            >
                              {sBadge.label}
                            </span>
                          );
                        })()}
                      />
                      {vendorShipment.courier_name && (
                        <DetailRow
                          label="Courier"
                          value={vendorShipment.courier_name}
                        />
                      )}
                      {vendorShipment.tracking_number && (
                        <DetailRow
                          label="Tracking #"
                          value={
                            <button
                              type="button"
                              onClick={() =>
                                copy(vendorShipment.tracking_number!)
                              }
                              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#333333] dark:text-white hover:text-primary transition-colors"
                            >
                              {vendorShipment.tracking_number}
                              <Copy className="size-3.5 text-grey3" />
                            </button>
                          }
                          isLast
                        />
                      )}
                    </Card>
                  </section>
                )}

              {/* ── Delivery Address ── */}
              {addressParts.length > 0 && (
                <section className="space-y-3">
                  <SectionTitle>Delivery address</SectionTitle>
                  <Card>
                    <div className="px-5 py-4">
                      {typeof addr.full_name === 'string' && addr.full_name && (
                        <p className="text-sm font-medium text-[#333333] dark:text-white">
                          {addr.full_name}
                        </p>
                      )}
                      <p className="text-sm text-[#333333] dark:text-white leading-relaxed">
                        {addressParts.join(', ')}
                      </p>
                      {typeof addressPhone === 'string' && addressPhone && (
                        <p className="mt-1 text-xs text-grey3 dark:text-gray-400">
                          {addressPhone}
                        </p>
                      )}
                    </div>
                  </Card>
                </section>
              )}
            </div>
          </OverlayScroll>

          {/* Reject Confirmation Dialog */}
          {showRejectDialog && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-2xl">
              <div className="mx-6 w-full max-w-sm rounded-2xl bg-white dark:bg-card p-6 space-y-4 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 shrink-0">
                    <XCircle className="size-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
                      {rejectItemId
                        ? 'Reject this item?'
                        : 'Reject this order?'}
                    </h4>
                    <p className="mt-1 text-xs text-grey3 dark:text-gray-400 leading-relaxed">
                      {rejectItemId
                        ? 'The customer will be refunded for this item. The rest of the order continues. This cannot be undone.'
                        : 'The customer will be refunded for your items and shipping. This action cannot be undone.'}
                    </p>
                  </div>
                </div>
                <textarea
                  placeholder="Reason (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-[#DDE2E5] dark:border-border bg-transparent px-3 py-2 text-sm text-[#333333] dark:text-white placeholder:text-grey3 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectReason('');
                      setRejectItemId(null);
                    }}
                    className="flex-1 h-10 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleReject}
                    disabled={isRejecting || isRejectingItem}
                    className="flex-1 h-10 text-sm bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isRejecting || isRejectingItem
                      ? 'Rejecting...'
                      : rejectItemId
                        ? 'Reject Item'
                        : 'Reject Order'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="shrink-0 border-t border-border px-4 py-4 sm:px-6">
            {isReservationClaim && order.status !== 'completed' && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800/50 dark:bg-blue-900/20">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {!claimPaid
                    ? 'Event fabric claim awaiting payment — if the guest doesn’t complete payment it will be released automatically.'
                    : isPickupClaim
                      ? 'Event fabric claim — the guest collects these yards, no courier shipment is needed. Mark it handed over once the fabric is given out.'
                      : 'Event fabric claim with delivery — confirm and fulfil it like a normal fabric order; the courier ships it to the guest.'}
                </p>
              </div>
            )}
            {isRetryFulfill && canFulfill && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800/50 dark:bg-amber-900/20">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  A previous fulfillment attempt didn&apos;t complete — no
                  shipping label was created. You can retry below.
                </p>
              </div>
            )}
            <div className="flex items-center gap-3">
              {/* Confirm / Reject — shown when order needs confirmation */}
              {needsConfirmation && (
                <>
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex-1 h-11 gap-2 text-sm bg-[#0F973D] hover:bg-[#0D8534] text-white"
                  >
                    <CheckCircle className="size-4" />
                    {isConfirming ? 'Confirming...' : 'Confirm Order'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isRejecting}
                    className="flex-1 h-11 gap-2 text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </Button>
                </>
              )}
              {/* Fulfill — shown after confirmation */}
              {canFulfill && (
                <Button
                  type="button"
                  onClick={handleFulfill}
                  disabled={isFulfilling}
                  className="flex-1 h-11 gap-2 text-sm"
                >
                  <Truck className="size-4" />
                  {isFulfilling
                    ? 'Creating label...'
                    : isRetryFulfill
                      ? 'Retry Fulfillment'
                      : outgoingFabricTransfers.length > 0
                        ? 'Fulfill & Ship to Tailor'
                        : 'Fulfill Order'}
                </Button>
              )}
              {pendingIncomingFabric.length > 0 && canFulfillBase && (
                <Button
                  type="button"
                  disabled
                  variant="outline"
                  className="flex-1 h-11 gap-2 text-sm opacity-60"
                >
                  <AlertTriangle className="size-4 text-amber-500" />
                  Waiting for fabric from{' '}
                  {extractBizName(pendingIncomingFabric[0].business)}
                </Button>
              )}
              {hasLabel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    window.open(vendorShipment!.label_url!, '_blank')
                  }
                  className="flex-1 h-11 gap-2 text-sm"
                >
                  <Printer className="size-4" />
                  Print Label
                </Button>
              )}
              {/* Rejected badge — no actions available */}
              {isRejected && (
                <div className="flex-1 flex items-center justify-center h-11 gap-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <XCircle className="size-4" />
                  Order Rejected
                </div>
              )}
              {/* Handover — the entire fulfilment for an event fabric claim */}
              {canHandover && (
                <Button
                  type="button"
                  onClick={handleHandover}
                  disabled={isHandingOver}
                  className="flex-1 h-11 gap-2 text-sm bg-[#0F973D] hover:bg-[#0D8534] text-white"
                >
                  <CheckCircle className="size-4" />
                  {isHandingOver ? 'Completing...' : 'Mark Handed Over'}
                </Button>
              )}
              {/* Print invoice fallback — not shown for a fabric transfer,
                  which has no customer invoice to print. */}
              {!isFabricTransferOnly &&
                !needsConfirmation &&
                !canFulfill &&
                !canHandover &&
                !hasLabel &&
                !isRejected && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => toast.info('Print invoice is coming soon.')}
                    className="flex-1 h-11 gap-2 text-sm"
                  >
                    <Printer className="size-4" />
                    Print invoice
                  </Button>
                )}
              <Button
                type="button"
                variant={
                  needsConfirmation || canFulfill || canHandover || hasLabel
                    ? 'outline'
                    : 'default'
                }
                onClick={handleClose}
                className="flex-1 h-11 text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>

        {canChat && (
          <CustomerChatSheet
            open={chatOpen}
            onOpenChange={setChatOpen}
            reference={order.reference}
            customerName={readCustomerName(order)}
            canSend={chatCanSend}
          />
        )}
      </Sheet>
    );
  }
);
