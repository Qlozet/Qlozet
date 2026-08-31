'use client';

// Order Details Drawer — Organism
//
// Read-only slide-over for a single order. Admin oversight only: there is no
// admin order-detail endpoint, so the order is passed in from the cached list
// query, and none of the vendor-side workflow (confirm / reject / fulfil /
// shipping labels) belongs here.

import React, { useEffect, useMemo, useState } from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import { ChevronRight, Package, Printer } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { printOrderInvoice } from '@/lib/order-invoice';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { OrderMediaPanel } from '../molecules/order-media-panel';
import {
  allProductImages,
  bespokeDesignImages,
  hasItemDetails,
} from '../lib/item-resolvers';
import { OrderItemDetailModal } from './order-item-detail-modal';
import {
  formatNaira,
  formatOrderDate,
  orderStatusBadge,
  readAmountPaid,
  readCustomerName,
  readItemImage,
  readItemName,
  readItemPricing,
  readOrderId,
  readPaymentStatus,
  readRefundStatus,
  readStatus,
} from '@/lib/orders';
import type {
  AdminOrder,
  AdminOrderItem,
} from '@/redux/services/orders/orders.api-slice';
import { useGetOrderMeasurementsQuery } from '@/redux/services/orders/orders.api-slice';

interface OrderDetailsDrawerProps {
  order: AdminOrder;
}

/* ── Shared layout atoms ── */

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
      !isLast && 'border-b border-[#DDE2E5] dark:border-white/10'
    )}
  >
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
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
  <div className="flex items-center justify-between gap-3">
    <h3 className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
      {children}
    </h3>
    {trailing}
  </div>
);

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-muted">
    {children}
  </div>
);

/* ── Order item row ── */

const OrderItemRow = ({
  item,
  isLast = false,
  interactive = true,
  onOpen,
}: {
  item: AdminOrderItem;
  isLast?: boolean;
  /** False when the item has nothing beyond what this row already shows. */
  interactive?: boolean;
  onOpen: () => void;
}) => {
  const name = readItemName(item);
  const imageUrl = readItemImage(item);
  const { final, original, discount, quantity } = readItemPricing(item);

  return (
    <button
      type="button"
      onClick={interactive ? onOpen : undefined}
      disabled={!interactive}
      className={cn(
        'group flex w-full items-start gap-3 px-5 py-4 text-left transition-colors',
        interactive &&
          'hover:bg-black/[0.03] dark:hover:bg-white/[0.06] cursor-pointer',
        !isLast && 'border-b border-[#DDE2E5] dark:border-white/10'
      )}
    >
      {/* Thumbnail */}
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-200 dark:bg-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <Package className="size-5 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      {/* Name, price, quantity */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#333333] dark:text-white group-hover:text-primary transition-colors">
          {name}
        </p>

        <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
            {formatNaira(final)}
          </span>
          {original !== undefined && (
            <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
              {formatNaira(original)}
            </span>
          )}
        </div>

        {quantity > 0 && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            QTY: {quantity}
          </p>
        )}

        {/* The backend records a single discount amount per item, so one badge
            is all we can honestly show. */}
        {discount !== undefined && (
          <span className="mt-2 inline-flex items-center rounded-md bg-[#D42620] px-2 py-0.5 text-[11px] font-semibold text-white">
            {formatNaira(discount)} off
          </span>
        )}
      </div>

      {interactive && (
        <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-muted text-gray-400 dark:text-gray-500 transition-colors group-hover:text-primary">
          <ChevronRight className="size-4" />
        </span>
      )}
    </button>
  );
};

/* ── Drawer ── */

export const OrderDetailsDrawer = create<OrderDetailsDrawerProps>(
  ({ order }) => {
    const { visible, resolve, hide, remove } = useModal();

    const handleClose = (open?: boolean | React.MouseEvent) => {
      if (typeof open !== 'boolean' || !open) {
        resolve({ resolved: true });
        hide();
        setTimeout(() => remove(), 300);
      }
    };

    // No invoice endpoint exists, so the invoice is composed from this order and
    // handed to the browser's print dialog (which covers "Save as PDF" too).
    const handlePrintInvoice = () => {
      if (!printOrderInvoice(order)) {
        toast.error(
          'Your browser blocked the invoice window. Allow pop-ups for this site and try again.'
        );
      }
    };

    const items = Array.isArray(order.items) ? order.items : [];
    const paymentStatus = readPaymentStatus(order);
    const refundStatus = readRefundStatus(order);

    // Body measurements for THIS order — the order-time snapshot when present
    // (what the tailor sews to), or the live active set for legacy orders.
    // Key evidence when arbitrating measurement disputes.
    const { data: bodyMeasurements } = useGetOrderMeasurementsQuery(
      (order as { reference?: string }).reference ?? '',
      { skip: !(order as { reference?: string }).reference || !visible }
    );
    const toMeasurementRows = (m?: Record<string, number>) =>
      Object.entries(m ?? {})
        .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v) && v > 0)
        .map(([key, v]) => ({
          key,
          label: key
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          value: v,
        }));
    const measurementRows = useMemo(
      () => toMeasurementRows(bodyMeasurements?.measurements),

      [bodyMeasurements]
    );
    // Per-garment profiles: one order can carry items for different bodies.
    const measurementItemGroups = useMemo(() => {
      const groups = (bodyMeasurements?.items ?? [])
        .map((i) => ({
          set_name: i.set_name ?? null,
          product_name: i.product_name ?? null,
          unit: i.unit === 'inch' ? 'in' : 'cm',
          rows: toMeasurementRows(i.measurements),
        }))
        .filter((g) => g.rows.length > 0);
      const distinct = new Set(groups.map((g) => g.set_name ?? ''));
      return distinct.size > 1 ? groups : [];
    }, [bodyMeasurements]);

    // Companion media panel — mirrors the vendor drawer: it opens alongside the
    // drawer showing the order's garments, and the handle closes both.
    // Below `sm` there's no room beside a full-width drawer.
    const canShowPanel = useMediaQuery('(min-width: 640px)', false);
    const [panelOpen, setPanelOpen] = useState(false);

    const media = useMemo(() => {
      const fromDesign = bespokeDesignImages(order);
      const fromItems = items.flatMap((item) => allProductImages(item.product));
      return Array.from(new Set([...fromDesign, ...fromItems]));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order]);

    useEffect(() => {
      setPanelOpen(canShowPanel && media.length > 0);
    }, [order, canShowPanel, media.length]);

    return (
      <Sheet open={visible} onOpenChange={handleClose}>
        {panelOpen && (
          <OrderMediaPanel
            images={media}
            title={`Order ${readOrderId(order)}`}
            drawerOpen={visible}
            onClose={handleClose}
          />
        )}
        <SheetContent
          side="right"
          // The drawer closes only when the user closes it — its own X, or the
          // media panel handle. Radix otherwise dismisses a Dialog on any
          // pointer interaction outside its Content, and the drawer's own
          // companion surfaces all render outside it: the media panel, the item
          // detail modal, and the media preview above that. Clicking any of
          // them — including the item modal's close button — took the drawer
          // down with it. Escape still closes it, after any nested modal on top
          // has had its turn (see `useNestedModalDismiss`).
          onInteractOutside={(event) => event.preventDefault()}
          className="flex sm:flex w-full flex-col !overflow-hidden p-0 sm:max-w-[440px] !top-6 !bottom-6 !right-6 rounded-2xl custom-card-shadow bg-white dark:bg-card"
          style={{
            height: 'calc(100vh - 3rem)',
            maxHeight: 'calc(100vh - 3rem)',
          }}
        >
          {/* pr-12 keeps the title clear of the Sheet's built-in close button. */}
          <SheetHeader className="shrink-0 py-5 pl-6 pr-12">
            <SheetTitle className="text-xl font-semibold text-[#0C0C0D] dark:text-white">
              Order details
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-6 px-6 pb-6">
              {/* ── Order Summary ── */}
              <section className="space-y-3">
                <SectionTitle>Order Summary</SectionTitle>
                <Panel>
                  <DetailRow label="Order ID:" value={readOrderId(order)} />
                  <DetailRow
                    label="Order date:"
                    value={formatOrderDate(order.createdAt)}
                  />
                  <DetailRow
                    label="Status:"
                    value={orderStatusBadge(readStatus(order)).label}
                  />
                  <DetailRow
                    label="Customer:"
                    value={
                      <span className="text-[#3387CC] underline underline-offset-2">
                        {readCustomerName(order)}
                      </span>
                    }
                    isLast
                  />
                </Panel>
              </section>

              {/* ── Order items ── */}
              <section className="space-y-3">
                <SectionTitle>Order items ({items.length})</SectionTitle>
                <Panel>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <OrderItemRow
                        key={index}
                        item={item}
                        isLast={index === items.length - 1}
                        interactive={hasItemDetails(item)}
                        onOpen={() =>
                          NiceModal.show(OrderItemDetailModal, { item, order })
                        }
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
                      <Package className="size-8 text-gray-400 dark:text-gray-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This order has no items.
                      </p>
                    </div>
                  )}
                </Panel>
              </section>

              {/* ── Body Measurement (custom/bespoke orders) ── */}
              {(measurementRows.length > 0 ||
                measurementItemGroups.length > 0) && (
                <section className="space-y-3">
                  <SectionTitle
                    trailing={
                      bodyMeasurements?.snapshot ||
                      measurementItemGroups.length > 0 ? (
                        <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                          Locked at order time
                        </span>
                      ) : (
                        <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                          Live profile
                        </span>
                      )
                    }
                  >
                    Body Measurement
                  </SectionTitle>
                  {measurementItemGroups.length > 0 ? (
                    /* Different bodies in one order — one panel per garment. */
                    measurementItemGroups.map((group, gi) => (
                      <Panel key={gi}>
                        <DetailRow
                          label="Set:"
                          value={
                            <>
                              {group.set_name || '—'}
                              {group.product_name && (
                                <span className="ml-1 text-gray-400">
                                  · {group.product_name}
                                </span>
                              )}
                            </>
                          }
                        />
                        {group.rows.map((row, index) => (
                          <DetailRow
                            key={row.key}
                            label={`${row.label}:`}
                            value={`${
                              Number.isInteger(row.value)
                                ? row.value
                                : row.value.toFixed(1)
                            } ${group.unit}`}
                            isLast={index === group.rows.length - 1}
                          />
                        ))}
                      </Panel>
                    ))
                  ) : (
                    <Panel>
                      <DetailRow
                        label="Set:"
                        value={bodyMeasurements?.name || '—'}
                      />
                      {measurementRows.map((row, index) => (
                        <DetailRow
                          key={row.key}
                          label={`${row.label}:`}
                          value={`${
                            Number.isInteger(row.value)
                              ? row.value
                              : row.value.toFixed(1)
                          } ${bodyMeasurements?.unit === 'inch' ? 'in' : 'cm'}`}
                          isLast={index === measurementRows.length - 1}
                        />
                      ))}
                    </Panel>
                  )}
                </section>
              )}

              {/* ── Payment and Invoice ── */}
              <section className="space-y-3">
                <SectionTitle
                  trailing={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrintInvoice}
                      className="h-8 gap-1.5 rounded-lg px-3 text-xs font-normal text-gray-700 dark:text-gray-200"
                    >
                      <Printer className="size-3.5" />
                      Print invoice
                    </Button>
                  }
                >
                  Payment and Invoice
                </SectionTitle>
                <Panel>
                  <DetailRow
                    label="Total"
                    value={formatNaira(readAmountPaid(order))}
                  />
                  <DetailRow
                    label="Payment Status:"
                    value={
                      paymentStatus ? (
                        <span className="capitalize text-[#0F973D] dark:text-green-400">
                          {paymentStatus}
                        </span>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <DetailRow
                    label="Refund Status:"
                    value={
                      refundStatus ? (
                        <span className="capitalize text-[#0F973D] dark:text-green-400">
                          {refundStatus}
                        </span>
                      ) : (
                        '—'
                      )
                    }
                    isLast
                  />
                </Panel>
              </section>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);
