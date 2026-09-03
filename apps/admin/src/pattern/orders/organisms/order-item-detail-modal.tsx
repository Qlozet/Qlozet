'use client';

// Order Item Detail Modal — Organism
//
// Full breakdown of a single order item: the product, everything the customer
// selected (colour/size, styles, fabric, accessories, add-ons), any cross-vendor
// fabric applied to a custom outfit, the frozen pricing ladder and the customer
// note. Opened from the order drawer's item row.
//
// Ported from the vendor app's equivalent so an order reads the same in both
// consoles — the payloads are identical, since GET /admin/vendor/orders returns
// the same populated item structure the vendor endpoint does. The admin app has
// no shared Dialog primitive, so this uses the same fixed-overlay pattern as the
// other admin modals.

import React, { useCallback, useState } from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import {
  Gem,
  Layers,
  Lock,
  Maximize2,
  Package,
  Palette,
  PlusCircle,
  Ruler,
  Scissors,
  X,
} from 'lucide-react';
import { formatNaira } from '@/lib/orders';
import {
  NESTED_MODAL_LAYER,
  useNestedModalDismiss,
} from '@/lib/hooks/useNestedModalDismiss';
import type {
  AdminOrder,
  AdminOrderItem,
  AppliedFabricRef,
  ClothingAccessoryDoc,
  ClothingAddonDoc,
  ClothingColorVariantDoc,
  ClothingFabricDoc,
  ClothingStyleDoc,
} from '@/redux/services/orders/orders.api-slice';
import {
  allProductImages,
  asProduct,
  byId,
  firstImg,
  htmlToText,
} from '../lib/item-resolvers';
import { SelectionRow, Section, Thumb } from '../molecules/selection-row';
import { OrderMediaPreviewModal } from './order-media-preview-modal';

const KIND_LABEL: Record<string, string> = {
  clothing: 'Clothing',
  fabric: 'Fabric',
  accessory: 'Accessory',
};

/* ── Per-item body measurements ──
   The garment's ORDER-TIME snapshot, straight off the item's embedded
   body_profile — admin sees every body on the order (dispute evidence),
   and each grid lives with its garment so a family order (Dad, Mum,
   Sister) is never ambiguous about which measurements are whose. */
const ItemBodyMeasurements = ({
  profile,
}: {
  profile: {
    set_name?: string | null;
    unit?: string;
    measurements?: Record<string, number>;
  };
}) => {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const rows = Object.entries(profile?.measurements ?? {})
    .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v) && v > 0)
    .map(([key, v]) => ({
      key,
      label: key
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      value: v,
    }));
  if (rows.length === 0) return null;

  const fromInch = profile.unit === 'inch' || profile.unit === 'in';
  const show = (v: number) => {
    const cm = fromInch ? v * 2.54 : v;
    const out = unit === 'in' ? cm / 2.54 : cm;
    return Number.isInteger(out) ? `${out}` : out.toFixed(1);
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-400/30 dark:bg-emerald-400/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Ruler className="size-3.5" />
            Sewn to
            {profile.set_name ? `: ${profile.set_name}` : ' these measurements'}
          </h4>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-400/20 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            <Lock className="size-3" /> Locked at order time
          </span>
        </div>
        <div className="inline-flex items-center rounded-full bg-white dark:bg-muted p-0.5 text-xs font-semibold">
          {(['cm', 'in'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={
                unit === u
                  ? 'cursor-pointer rounded-full bg-gray-100 dark:bg-white/10 px-2.5 py-0.5 uppercase text-gray-900 dark:text-white shadow-sm'
                  : 'cursor-pointer rounded-full px-2.5 py-0.5 uppercase text-gray-500'
              }
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-muted px-3.5 py-2.5"
          >
            <span className="truncate text-sm text-gray-600 dark:text-gray-300">
              {row.label}
            </span>
            <span className="shrink-0 text-sm font-semibold text-grey-black dark:text-white">
              {show(row.value)}
              <span className="ml-0.5 text-xs font-normal text-grey3">
                {unit}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ItemDetailContent = ({ item }: { item: AdminOrderItem }) => {
  const product = asProduct(item.product);
  const clothing = product?.clothing;
  const name =
    clothing?.name ??
    product?.fabric?.name ??
    product?.accessory?.name ??
    product?.name ??
    'Product';
  const gallery = allProductImages(product);
  const heroUrl = gallery[0] ?? null;
  const kind = product?.kind;
  const total = item.total_price ?? item.pricing?.final ?? 0;
  const description = htmlToText(clothing?.description);

  const appliedFabric =
    item.applied_fabric && typeof item.applied_fabric === 'object'
      ? (item.applied_fabric as AppliedFabricRef)
      : null;
  const appliedFabricVendor =
    appliedFabric?.business && typeof appliedFabric.business === 'object'
      ? appliedFabric.business.business_name
      : undefined;

  return (
    <div className="space-y-5">
      {/* Hero — tapping the image opens the full-size preview. */}
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={() =>
            NiceModal.show(OrderMediaPreviewModal, {
              images: gallery,
              title: name,
            })
          }
          aria-label={`View ${name} media`}
          className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-muted cursor-pointer"
        >
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroUrl}
              alt={name}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <Package className="size-7 text-gray-400 dark:text-gray-500" />
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
            {kind && (
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                {KIND_LABEL[kind] ?? kind}
              </span>
            )}
            {typeof product?.base_price === 'number' && (
              <span className="text-[11px] text-grey3 dark:text-gray-400">
                Base: {formatNaira(product.base_price)}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-grey3 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] text-grey3 dark:text-gray-400">Total</p>
          <p className="text-base font-bold text-[#0C0C0D] dark:text-white">
            {formatNaira(total)}
          </p>
        </div>
      </div>

      {/* Cross-vendor fabric — the key "what is this made of" fact, so it leads. */}
      {(appliedFabric || item.applied_fabric_yards) && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 p-3">
          <div className="flex items-center gap-1.5">
            <Scissors className="size-3.5 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              External fabric
            </h4>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Thumb
              url={firstImg(appliedFabric?.fabric?.images)}
              alt={appliedFabric?.fabric?.name ?? 'Fabric'}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#333333] dark:text-white">
                {appliedFabric?.fabric?.name ?? 'Applied fabric'}
              </p>
              <p className="text-xs text-grey3 dark:text-gray-400">
                {item.applied_fabric_yards ?? '—'} yards
                {appliedFabricVendor ? ` · from ${appliedFabricVendor}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Body measurements THIS garment is sewn to — the item's order-time
          snapshot (admin sees every body; key dispute evidence). */}
      {(item as any).body_profile?.measurements && (
        <ItemBodyMeasurements profile={(item as any).body_profile} />
      )}

      {/* Colour & size */}
      {!!item.color_variant_selections?.length && (
        <Section
          title="Colour & Size"
          icon={<Palette className="size-3.5 text-grey3 dark:text-gray-400" />}
        >
          {item.color_variant_selections.map((selection, index) => {
            const variant = byId<ClothingColorVariantDoc>(
              clothing?.color_variants,
              selection.variant_id
            );
            return (
              <SelectionRow
                key={index}
                url={firstImg(variant?.images)}
                swatch={variant?.hex ?? variant?.hex_code ?? null}
                title={
                  selection.color ??
                  variant?.color_name ??
                  variant?.name ??
                  'Standard'
                }
                subtitle={selection.size ? `Size ${selection.size}` : undefined}
                price={selection.total_amount}
                qty={selection.quantity}
              />
            );
          })}
        </Section>
      )}

      {/* Styles */}
      {!!item.style_selections?.length && (
        <Section
          title="Styles"
          icon={<Layers className="size-3.5 text-grey3 dark:text-gray-400" />}
        >
          {item.style_selections.map((selection, index) => {
            const style = byId<ClothingStyleDoc>(
              clothing?.styles,
              selection.style_id
            );
            return (
              <SelectionRow
                key={index}
                url={firstImg(style?.images)}
                icon={
                  <Layers className="size-4 text-gray-400 dark:text-gray-500" />
                }
                title={style?.name ?? 'Style'}
                subtitle={style?.type}
                price={selection.total_amount}
                qty={selection.quantity}
              />
            );
          })}
        </Section>
      )}

      {/* Fabric from the vendor's own catalogue */}
      {!!item.fabric_selections?.length && (
        <Section
          title="Fabric"
          icon={<Scissors className="size-3.5 text-grey3 dark:text-gray-400" />}
        >
          {item.fabric_selections.map((selection, index) => {
            const fabric =
              byId<ClothingFabricDoc>(clothing?.fabrics, selection.fabric_id) ??
              (product?.fabric as ClothingFabricDoc | undefined);
            const yards = selection.yardage ?? selection.yards;
            return (
              <SelectionRow
                key={index}
                url={firstImg(fabric?.images)}
                swatch={fabric?.colors?.[0]?.hex ?? null}
                title={fabric?.name ?? 'Fabric'}
                subtitle={`${yards ?? '—'} yd${
                  fabric?.price_per_yard
                    ? ` · ${formatNaira(fabric.price_per_yard)}/yd`
                    : ''
                }`}
                price={selection.total_amount}
              />
            );
          })}
        </Section>
      )}

      {/* Accessories */}
      {!!item.accessory_selections?.length && (
        <Section
          title="Accessories"
          icon={<Gem className="size-3.5 text-grey3 dark:text-gray-400" />}
        >
          {item.accessory_selections.map((selection, index) => {
            const accessory = byId<ClothingAccessoryDoc>(
              clothing?.accessories,
              selection.accessory_id
            );
            const variant = byId(accessory?.variants, selection.variant_id);
            return (
              <SelectionRow
                key={index}
                url={firstImg(variant?.images) ?? firstImg(accessory?.images)}
                icon={
                  <Gem className="size-4 text-gray-400 dark:text-gray-500" />
                }
                title={accessory?.name ?? 'Accessory'}
                subtitle={variant?.name}
                price={selection.total_amount}
                qty={selection.quantity}
              />
            );
          })}
        </Section>
      )}

      {/* Add-ons */}
      {!!item.addon_selections?.length && (
        <Section
          title="Add-ons"
          icon={
            <PlusCircle className="size-3.5 text-grey3 dark:text-gray-400" />
          }
        >
          {item.addon_selections.map((selection, index) => {
            const addon = byId<ClothingAddonDoc>(
              clothing?.addons,
              selection.addon_id
            );
            const variant = byId(addon?.variants, selection.variant_id);
            return (
              <SelectionRow
                key={index}
                url={variant?.image_url ?? null}
                swatch={variant?.color_hex ?? null}
                icon={
                  <PlusCircle className="size-4 text-gray-400 dark:text-gray-500" />
                }
                title={addon?.name ?? 'Add-on'}
                subtitle={variant?.name}
                price={selection.total_amount}
                qty={selection.quantity}
              />
            );
          })}
        </Section>
      )}

      {/* Pricing ladder — the snapshot frozen at order time. */}
      {item.pricing && (
        <div className="space-y-1.5 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-muted px-3.5 py-3">
          {(
            [
              ['Base', item.pricing.base],
              ['Styles', item.pricing.styles_total],
              ['Fabric', item.pricing.fabric_total],
              ['Variant', item.pricing.variant_total],
              ['Accessories', item.pricing.accessories_total],
              ['Add-ons', item.pricing.addons_total],
            ] as [string, number | undefined][]
          )
            .filter(([label, value]) => label === 'Base' || (value ?? 0) > 0)
            .map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-grey3 dark:text-gray-400">{label}</span>
                <span className="text-[#333333] dark:text-white">
                  {formatNaira(value ?? 0)}
                </span>
              </div>
            ))}

          <div className="flex items-center justify-between border-t border-[#DDE2E5] dark:border-white/10 pt-1.5 text-xs">
            <span className="font-medium text-[#333333] dark:text-white">
              Before discount
            </span>
            <span className="font-medium text-[#333333] dark:text-white">
              {formatNaira(item.pricing.before_discount ?? 0)}
            </span>
          </div>

          {(item.pricing.discount ?? 0) > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-grey3 dark:text-gray-400">Discount</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                -{formatNaira(item.pricing.discount ?? 0)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#DDE2E5] dark:border-white/10 pt-1.5">
            <span className="text-xs font-semibold text-[#333333] dark:text-white">
              Final item total
            </span>
            <span className="text-sm font-bold text-[#0C0C0D] dark:text-white">
              {formatNaira(item.pricing.final ?? 0)}
            </span>
          </div>
        </div>
      )}

      {/* Customer note */}
      {item.note && (
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-grey3 dark:text-gray-400">
            Customer note
          </h4>
          <div className="rounded-xl border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 px-3 py-2.5">
            <p className="text-xs italic leading-relaxed text-amber-800 dark:text-amber-300">
              &ldquo;{item.note}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface OrderItemDetailModalProps {
  item: AdminOrderItem;
  order?: AdminOrder;
}

export const OrderItemDetailModal = create<OrderItemDetailModalProps>(
  ({ item }) => {
    const modal = useModal();

    const close = useCallback(() => modal.remove(), [modal]);

    // Opened from inside the order drawer (a Radix Sheet), which locks pointer
    // events on <body> and owns Escape. See the hook for why both are needed.
    useNestedModalDismiss(close, modal.visible);

    if (!modal.visible) return null;

    const itemName =
      asProduct(item.product)?.clothing?.name ??
      asProduct(item.product)?.fabric?.name ??
      asProduct(item.product)?.accessory?.name ??
      asProduct(item.product)?.name;

    return (
      // z-[110] clears the order drawer sheet this opens from. Rendered as a
      // right-side SHEET with the drawer's exact geometry (inset 24px, rounded,
      // 440px), stacked one layer above it — the item view reads as a deeper
      // page of the same surface, not a different kind of window.
      <div className={`fixed inset-0 z-[110] ${NESTED_MODAL_LAYER}`}>
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Item details"
          className="absolute right-6 top-6 bottom-6 z-10 flex w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-white dark:bg-card shadow-2xl"
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border py-5 pl-6 pr-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[#0C0C0D] dark:text-white">
                Item details
              </h2>
              {itemName && (
                <p className="truncate text-sm text-grey3 dark:text-gray-400">
                  {itemName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-grey-black dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-muted/80"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <ItemDetailContent item={item} />
          </div>
        </div>
      </div>
    );
  }
);
