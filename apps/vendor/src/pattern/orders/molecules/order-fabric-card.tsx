'use client';

// Fabric card — bespoke order drawer.
//
// Two variants, driven by who supplies the fabric:
//  - cross-vendor fabric the customer picked: shows the source vendor, the
//    transfer status and a "View fabric" action.
//  - the vendor's own fabric: shows a reminder to price it into the quote.

import React from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getIncomingFabricTransfers,
  type Order,
} from '@/redux/services/orders/orders.api-slice';
import {
  asProduct,
  findFabricItem,
  readOrderFabric,
  yardsToMetres,
} from '../lib/item-resolvers';
import { formatNaira, shipmentStatusBadge } from '../lib/order-fields';

const Row = ({
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
      'flex items-center justify-between gap-4 px-4 py-3',
      !isLast && 'border-b border-[#E5E7EB] dark:border-border'
    )}
  >
    <span className="text-sm text-grey3 dark:text-gray-400">{label}</span>
    <span className="text-right text-sm font-semibold text-grey-black dark:text-white">
      {value}
    </span>
  </div>
);

interface OrderFabricCardProps {
  order: Order;
  /** Active vendor business — used to find the transfer shipping fabric to them. */
  businessId?: string;
  onViewFabric?: () => void;
}

export const OrderFabricCard = ({
  order,
  businessId,
  onViewFabric,
}: OrderFabricCardProps) => {
  const item = findFabricItem(order);
  if (!item) return null;

  const fabric = readOrderFabric(item, asProduct(item.product));
  if (!fabric) return null;

  // Status comes from the transfer shipping the fabric to this vendor, which
  // only exists when another vendor supplies it.
  const transfer = businessId
    ? getIncomingFabricTransfers(order, businessId)[0]
    : undefined;
  const statusBadge = transfer ? shipmentStatusBadge(transfer.status) : null;

  const metres =
    typeof fabric.yards === 'number' ? yardsToMetres(fabric.yards) : undefined;

  return (
    <section className="space-y-3 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-grey-black dark:text-white">
        Fabric
      </h3>

      {/* Yardage header */}
      <div className="flex items-center gap-3">
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
          {fabric.imageUrl ? (
            <Image
              src={fabric.imageUrl}
              alt={fabric.name ?? 'Fabric'}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <ImageIcon className="size-5 text-gray-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-grey-black dark:text-white">
            {fabric.yards ?? '—'} yards{' '}
            {metres !== undefined && (
              <span className="text-sm font-normal text-grey3 dark:text-gray-400">
                ({metres}m)
              </span>
            )}
          </p>
          <p className="text-xs text-grey3 dark:text-gray-400">
            Includes shrinkage &amp; cutting allowances
          </p>
        </div>
      </div>

      {/* Detail rows. Material and ETA are omitted — the backend has no field
          for either (see TODO(api) below), and inventing them would misstate a
          delivery promise. */}
      <div className="rounded-xl border border-border bg-white dark:bg-[#404040]">
        <Row label="Name:" value={fabric.name ?? '—'} />
        <Row
          label="Source:"
          value={
            fabric.vendorSources ? (
              'Your catalogue'
            ) : (
              <>
                <span className="text-grey-black dark:text-white">
                  Marketplace
                </span>
                {fabric.sourceBusiness ? (
                  <span className="font-normal text-grey3 dark:text-gray-400">
                    {' '}
                    - {fabric.sourceBusiness}
                  </span>
                ) : null}
              </>
            )
          }
        />
        <Row
          label="Price per yard:"
          value={
            typeof fabric.pricePerYard === 'number'
              ? formatNaira(fabric.pricePerYard)
              : '—'
          }
          isLast={!statusBadge}
        />
        {/* TODO(api): Material and ETA rows need `material` on the fabric
            product and `eta_days` on the transfer shipment. The ETA-vs-promised
            -turnaround warning banner also depends on ETA. */}
        {statusBadge && (
          <Row
            label="Status:"
            value={
              <span
                className={cn(
                  'inline-flex h-[26px] items-center justify-center rounded-lg px-3 text-xs font-medium',
                  statusBadge.className
                )}
              >
                {statusBadge.label}
              </span>
            }
            isLast
          />
        )}
      </div>

      {fabric.vendorSources ? (
        <p className="text-xs text-grey3 dark:text-gray-400">
          You are sourcing this fabric — include cost in your quote.
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={onViewFabric}
          className="w-full text-xs font-semibold uppercase tracking-wide"
        >
          View fabric
        </Button>
      )}
    </section>
  );
};
