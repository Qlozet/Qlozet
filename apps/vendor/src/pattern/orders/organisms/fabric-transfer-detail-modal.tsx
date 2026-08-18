'use client';

// Fabric Transfer Detail Modal — Organism
// The fabric vendor's counterpart to the garment item-detail modal: an
// image-forward breakdown of the ONE thing they're sending — the customer's
// chosen fabric — plus who it ships to and its value. No customer or garment
// data (this vendor only sees their transfer).

import React from 'react';
import Image from 'next/image';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import { Scissors, Maximize2, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  extractBizName,
  extractFabricName,
  type VendorShipment,
} from '@/redux/services/orders/orders.api-slice';
import { formatNaira, shipmentStatusBadge } from '../lib/order-fields';
import { MediaPreviewModal } from './media-preview-modal';
import { OverlayScroll } from '@/components/OverlayScroll';

/** First usable image URL from a fabric product's images (strings or {url}). */
export function fabricImageUrl(transfer: VendorShipment): string | null {
  const fp = transfer.fabric_product;
  if (!fp || typeof fp === 'string') return null;
  const imgs = fp.fabric?.images;
  if (Array.isArray(imgs) && imgs.length) {
    const first = imgs[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && first.url) return first.url;
  }
  return null;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-grey3 dark:text-gray-400">{label}</span>
    <span className="text-right font-medium text-[#333333] dark:text-gray-200">
      {value}
    </span>
  </div>
);

interface FabricTransferDetailModalProps {
  transfer: VendorShipment;
  fabricValue?: number;
}

export const FabricTransferDetailModal = create<FabricTransferDetailModalProps>(
  ({ transfer, fabricValue }) => {
    const { visible, hide, remove } = useModal();

    const onOpenChange = (open: boolean) => {
      if (!open) {
        hide();
        setTimeout(() => remove(), 300);
      }
    };

    const name = extractFabricName(transfer.fabric_product);
    const img = fabricImageUrl(transfer);
    const destName = extractBizName(transfer.destination_business);
    const sBadge = shipmentStatusBadge(transfer.status);
    const basePrice =
      transfer.fabric_product && typeof transfer.fabric_product !== 'string'
        ? transfer.fabric_product.base_price
        : undefined;

    return (
      <Dialog open={visible} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            'sm:max-w-[520px] p-0 gap-0 bg-white dark:bg-card',
            // Above the order drawer sheet it opens from.
            'z-[60]'
          )}
        >
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-[#0C0C0D] dark:text-white">
              Fabric details
            </DialogTitle>
          </DialogHeader>
          <OverlayScroll className="max-h-[70vh] px-5 py-5 sm:max-h-[65vh]">
            <div className="space-y-5">
              {/* Hero */}
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  onClick={() =>
                    NiceModal.show(MediaPreviewModal, {
                      images: img ? [img] : [],
                      title: name,
                    })
                  }
                  aria-label={`View ${name} media`}
                  className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-700 cursor-pointer"
                >
                  {img ? (
                    <Image
                      src={img}
                      alt={name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="80px"
                    />
                  ) : (
                    <Scissors className="size-7 text-gray-400" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white/0 transition-colors group-hover:bg-black/30 group-hover:text-white">
                    <Maximize2 className="size-4" />
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-[#0C0C0D] dark:text-white">
                    {name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      Fabric
                    </span>
                    {typeof basePrice === 'number' && (
                      <span className="text-[11px] text-grey3 dark:text-gray-400">
                        {formatNaira(basePrice)}/yd
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-grey3 dark:text-gray-400">
                    {transfer.fabric_yards ?? '—'} yards for {destName}
                  </p>
                </div>
                {typeof fabricValue === 'number' && fabricValue > 0 && (
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-grey3 dark:text-gray-400">
                      Value
                    </p>
                    <p className="text-base font-bold text-[#0F973D]">
                      {formatNaira(fabricValue)}
                    </p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] px-3.5 py-3 space-y-1.5">
                <Row
                  label="Quantity"
                  value={`${transfer.fabric_yards ?? '—'} yards`}
                />
                <Row
                  label="Ship to"
                  value={
                    <>
                      {destName}{' '}
                      <span className="text-[10px] text-muted-foreground">
                        (Tailor)
                      </span>
                    </>
                  }
                />
                {transfer.courier_name && (
                  <Row label="Courier" value={transfer.courier_name} />
                )}
                {transfer.tracking_number && (
                  <Row label="Tracking #" value={transfer.tracking_number} />
                )}
                <Row
                  label="Shipping fee"
                  value={
                    <>
                      {formatNaira(transfer.shipping_fee)}{' '}
                      <span className="text-[10px] text-muted-foreground">
                        (customer)
                      </span>
                    </>
                  }
                />
                <div className="flex items-center justify-between border-t border-[#DDE2E5] dark:border-border pt-1.5 text-xs">
                  <span className="font-medium text-[#333333] dark:text-gray-200">
                    Status
                  </span>
                  <span
                    className={cn(
                      'inline-flex h-[24px] items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-[11px] font-medium',
                      sBadge.className
                    )}
                  >
                    {sBadge.label}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-900/20">
                <Package className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                  This is the customer&apos;s chosen fabric for another
                  vendor&apos;s order. Ship it to the tailor — they handle the
                  rest of the order.
                </p>
              </div>
            </div>
          </OverlayScroll>
        </DialogContent>
      </Dialog>
    );
  }
);
