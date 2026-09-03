'use client';

// Order Item Detail Modal — Organism
// Rich, image-forward breakdown of a single order item: the product, the chosen
// styles / fabric / accessories / add-ons (each with a thumbnail, name + price),
// the cross-vendor "external fabric" applied to a custom outfit, the pricing
// ladder and the customer note. Opened from the order drawer's item row.
//
// Responsive by construction: the shared Dialog renders a centered modal on
// desktop and a bottom sheet on mobile.

import React from 'react';
import Image from 'next/image';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import {
  Package,
  Scissors,
  Layers,
  Gem,
  PlusCircle,
  Palette,
  Maximize2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ItemBodyMeasurements } from '../molecules/order-measurements-card';
import type {
  Order,
  OrderItem,
  ProductImage,
  ClothingStyleDoc,
  ClothingFabricDoc,
  ClothingAccessoryDoc,
  ClothingAddonDoc,
  ClothingColorVariantDoc,
  AppliedFabricRef,
} from '@/redux/services/orders/orders.api-slice';
import { formatNaira } from '../lib/order-fields';
import {
  allProductImages,
  asProduct,
  byId,
  firstImg,
  getProductImageUrl,
  getProductName,
} from '../lib/item-resolvers';
import { SelectionRow, Section, Thumb } from '../molecules/selection-row';
import { MediaPreviewModal } from './media-preview-modal';
import { OverlayScroll } from '@/components/OverlayScroll';

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const ItemDetailContent: React.FC<{ item: OrderItem }> = ({ item }) => {
  const product = asProduct(item.product);
  const clothing = product?.clothing;
  const name = getProductName(product);
  const heroUrl = getProductImageUrl(product);
  const gallery = allProductImages(product);
  const kind = product?.kind;
  const total = item.total_price ?? item.pricing?.final ?? 0;

  const KIND_LABEL: Record<string, string> = {
    clothing: 'Clothing',
    fabric: 'Fabric',
    accessory: 'Accessory',
  };

  // ── Applied (external) fabric ──
  const appliedFabric =
    item.applied_fabric && typeof item.applied_fabric === 'object'
      ? (item.applied_fabric as AppliedFabricRef)
      : null;
  const appliedFabricVendor =
    appliedFabric?.business && typeof appliedFabric.business === 'object'
      ? appliedFabric.business.business_name
      : undefined;
  // Cost of the customer's external fabric. Billed to the customer and paid to
  // the fabric vendor — NOT part of this item's `final` (the tailor's earnings).
  const externalFabricCost = item.pricing?.external_fabric ?? 0;

  return (
    <div className="space-y-5">
      {/* Hero — tapping the image opens the full-size lightbox. */}
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={() =>
            NiceModal.show(MediaPreviewModal, {
              images: gallery.length > 0 ? gallery : heroUrl ? [heroUrl] : [],
              title: name,
            })
          }
          aria-label={`View ${name} media`}
          className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-700 cursor-pointer"
        >
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="80px"
            />
          ) : (
            <Package className="size-7 text-gray-400" />
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
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {KIND_LABEL[kind] ?? kind}
              </span>
            )}
            {typeof product?.base_price === 'number' && (
              <span className="text-[11px] text-grey3 dark:text-gray-400">
                Base: {formatNaira(product.base_price)}
              </span>
            )}
          </div>
          {clothing?.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-grey3 dark:text-gray-400">
              {clothing.description}
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

      {/* External fabric (cross-vendor) — most important "what am I working
          with" fact for a tailor, so it sits up top and is highlighted. */}
      {(appliedFabric || item.applied_fabric_yards) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 p-3">
          <div className="flex items-center gap-1.5">
            <Scissors className="size-3.5 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
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
            {externalFabricCost > 0 && (
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {formatNaira(externalFabricCost)}
                </p>
                <p className="text-[10px] text-amber-700/70 dark:text-amber-300/70">
                  paid to fabric vendor
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body measurements THIS garment is sewn to — the item's order-time
          snapshot. Lives here (not just order-level) so an order carrying
          garments for different bodies is never ambiguous. */}
      {(item as any).body_profile?.measurements && (
        <ItemBodyMeasurements profile={(item as any).body_profile} />
      )}

      {/* Colour / size variants */}
      {!!item.color_variant_selections?.length && (
        <Section
          title="Colour & Size"
          icon={<Palette className="size-3.5 text-grey3" />}
        >
          {item.color_variant_selections.map((v, i) => {
            // `variant_id` is the INNER size-variant id, so first find the colour
            // variant that CONTAINS it; fall back to the (legacy) direct match.
            const cv =
              (
                clothing?.color_variants as
                  | ClothingColorVariantDoc[]
                  | undefined
              )?.find((c) =>
                ((c as any).variants ?? []).some(
                  (iv: any) => String(iv._id) === String(v.variant_id)
                )
              ) ??
              byId<ClothingColorVariantDoc>(
                clothing?.color_variants,
                v.variant_id
              );
            // Prefer the snapshot stored on the order item (new orders); fall
            // back to the resolved product colour variant (older orders).
            const swatch = v.hex ?? cv?.hex ?? cv?.hex_code;
            const colourName =
              v.color ?? cv?.color_name ?? cv?.name ?? 'Standard';
            return (
              <SelectionRow
                key={i}
                url={firstImg(cv?.images)}
                swatch={swatch ?? null}
                title={colourName}
                subtitle={v.size ? `Size ${v.size}` : undefined}
                price={v.total_amount}
                qty={v.quantity}
              />
            );
          })}
        </Section>
      )}

      {/* Styles */}
      {!!item.style_selections?.length && (
        <Section
          title="Styles"
          icon={<Layers className="size-3.5 text-grey3" />}
        >
          {item.style_selections.map((s, i) => {
            const st = byId<ClothingStyleDoc>(clothing?.styles, s.style_id);
            return (
              <SelectionRow
                key={i}
                url={firstImg(st?.images)}
                icon={<Layers className="size-4 text-gray-400" />}
                title={st?.name ?? 'Style'}
                subtitle={st?.type}
                price={s.total_amount}
                qty={s.quantity}
              />
            );
          })}
        </Section>
      )}

      {/* Fabric (embedded / same-vendor) */}
      {!!item.fabric_selections?.length && (
        <Section
          title="Fabric"
          icon={<Scissors className="size-3.5 text-grey3" />}
        >
          {item.fabric_selections.map((f, i) => {
            const fab =
              byId<ClothingFabricDoc>(clothing?.fabrics, f.fabric_id) ??
              (product?.fabric as ClothingFabricDoc | undefined);
            const swatch = fab?.colors?.[0]?.hex;
            const yards = f.yardage ?? f.yards;
            return (
              <SelectionRow
                key={i}
                url={firstImg(fab?.images)}
                swatch={swatch ?? null}
                title={fab?.name ?? 'Fabric'}
                subtitle={`${yards ?? '—'} yd${
                  fab?.price_per_yard
                    ? ` · ${formatNaira(fab.price_per_yard)}/yd`
                    : ''
                }`}
                price={f.total_amount}
              />
            );
          })}
        </Section>
      )}

      {/* Accessories */}
      {!!item.accessory_selections?.length && (
        <Section
          title="Accessories"
          icon={<Gem className="size-3.5 text-grey3" />}
        >
          {item.accessory_selections.map((a, i) => {
            const acc = byId<ClothingAccessoryDoc>(
              clothing?.accessories,
              a.accessory_id
            );
            const variant = byId(acc?.variants as any, a.variant_id) as
              | { name?: string; images?: ProductImage[] }
              | undefined;
            // Prefer the snapshots stored on the order item (accessory name +
            // chosen colour), falling back to the resolved product.
            return (
              <SelectionRow
                key={i}
                url={firstImg(variant?.images) ?? firstImg(acc?.images)}
                swatch={a.hex ?? null}
                icon={<Gem className="size-4 text-gray-400" />}
                title={a.name ?? acc?.name ?? 'Accessory'}
                subtitle={a.color ?? variant?.name}
                price={a.total_amount}
                qty={a.quantity}
              />
            );
          })}
        </Section>
      )}

      {/* Add-ons */}
      {!!item.addon_selections?.length && (
        <Section
          title="Add-ons"
          icon={<PlusCircle className="size-3.5 text-grey3" />}
        >
          {item.addon_selections.map((ad, i) => {
            const addon = byId<ClothingAddonDoc>(clothing?.addons, ad.addon_id);
            const variant = byId(addon?.variants as any, ad.variant_id) as
              | {
                  name?: string;
                  price?: number;
                  color_hex?: string;
                  image_url?: string;
                }
              | undefined;
            return (
              <SelectionRow
                key={i}
                url={variant?.image_url ?? null}
                swatch={variant?.color_hex ?? null}
                icon={<PlusCircle className="size-4 text-gray-400" />}
                title={addon?.name ?? 'Add-on'}
                subtitle={variant?.name}
                price={ad.total_amount}
                qty={ad.quantity}
              />
            );
          })}
        </Section>
      )}

      {/* Pricing ladder — drawer Card idiom */}
      {item.pricing && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
            Pricing
          </h3>
          <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] dark:border dark:border-border px-4 py-3.5 space-y-1.5">
            {(
              [
                ['Base', item.pricing.base],
                ['Styles', item.pricing.styles_total],
                ['Fabric', item.pricing.fabric_total],
                ['Variant', item.pricing.variant_total],
                ['Accessories', item.pricing.accessories_total],
                ['Add-ons', item.pricing.addons_total],
              ] as [string, number][]
            )
              .filter(([label, v]) => label === 'Base' || v > 0)
              .map(([label, v]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-grey3 dark:text-gray-400">{label}</span>
                  <span className="text-[#333333] dark:text-gray-200">
                    {formatNaira(v)}
                  </span>
                </div>
              ))}
            <div className="flex items-center justify-between border-t border-[#DDE2E5] dark:border-border pt-1.5 text-xs">
              <span className="font-medium text-[#333333] dark:text-gray-200">
                Before discount
              </span>
              <span className="font-medium text-[#333333] dark:text-gray-200">
                {formatNaira(item.pricing.before_discount)}
              </span>
            </div>
            {item.pricing.discount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-grey3 dark:text-gray-400">Discount</span>
                <span className="font-semibold text-red-600">
                  -{formatNaira(item.pricing.discount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-[#DDE2E5] dark:border-border pt-1.5">
              <span className="text-xs font-semibold text-[#333333] dark:text-gray-200">
                Final item total
              </span>
              <span className="text-sm font-bold text-[#0C0C0D] dark:text-white">
                {formatNaira(item.pricing.final)}
              </span>
            </div>
            {/* External fabric is the customer's "use my own fabric" charge — the
              fabric vendor's revenue, not part of the tailor's item total above.
              Shown here so the amount the customer actually paid reconciles. */}
            {externalFabricCost > 0 && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-grey3 dark:text-gray-400">
                    External fabric
                    <span className="text-[10px] text-grey3/70 dark:text-gray-500">
                      {' '}
                      (to fabric vendor)
                    </span>
                  </span>
                  <span className="text-[#333333] dark:text-gray-200">
                    {formatNaira(externalFabricCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#DDE2E5] dark:border-border pt-1.5">
                  <span className="text-xs font-semibold text-[#333333] dark:text-gray-200">
                    Customer paid
                  </span>
                  <span className="text-sm font-bold text-[#0C0C0D] dark:text-white">
                    {formatNaira(item.pricing.final + externalFabricCost)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Customer note */}
      {item.note && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
            Customer note
          </h3>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-900/20">
            <p className="text-xs italic leading-relaxed text-amber-800 dark:text-amber-200">
              &ldquo;{item.note}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

interface OrderItemDetailModalProps {
  item: OrderItem;
  order?: Order;
}

export const OrderItemDetailModal = create<OrderItemDetailModalProps>(
  ({ item }) => {
    const { visible, hide, remove } = useModal();

    const onOpenChange = (open: boolean) => {
      if (!open) {
        hide();
        setTimeout(() => remove(), 300);
      }
    };

    const itemName = getProductName(asProduct(item.product));

    // Same shell + geometry as the order details drawer it opens from, stacked
    // one layer above it — the item view reads as a deeper page of the same
    // surface, not a different kind of window.
    return (
      <Sheet open={visible} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            'flex sm:flex w-full flex-col !overflow-hidden p-0 sm:max-w-[440px] !top-6 !bottom-6 !right-6 rounded-2xl custom-card-shadow bg-white dark:bg-card',
            // Above the order drawer sheet it opens from.
            'z-[60]'
          )}
          style={{
            height: 'calc(100vh - 3rem)',
            maxHeight: 'calc(100vh - 3rem)',
          }}
        >
          {/* pr-12 reserves room for the Sheet's built-in close (X). */}
          <SheetHeader className="shrink-0 border-b border-border py-5 pl-4 pr-12 sm:pl-6">
            <SheetTitle className="text-lg font-semibold text-[#0C0C0D] dark:text-white">
              Item details
            </SheetTitle>
            {itemName && (
              <p className="truncate text-sm text-grey3 dark:text-gray-400">
                {itemName}
              </p>
            )}
          </SheetHeader>
          <OverlayScroll className="flex-1 px-4 py-5 sm:px-6">
            <ItemDetailContent item={item} />
          </OverlayScroll>
        </SheetContent>
      </Sheet>
    );
  }
);
