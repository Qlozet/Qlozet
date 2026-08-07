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

import React from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import {
  Gem,
  Layers,
  Maximize2,
  Package,
  Palette,
  PlusCircle,
  Scissors,
  X,
} from 'lucide-react';
import { formatNaira } from '@/lib/orders';
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
          className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 cursor-pointer"
        >
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroUrl}
              alt={name}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <Package className="size-7 text-gray-400" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white/0 transition-colors group-hover:bg-black/30 group-hover:text-white">
            <Maximize2 className="size-4" />
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-[#0C0C0D]">{name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {kind && (
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                {KIND_LABEL[kind] ?? kind}
              </span>
            )}
            {typeof product?.base_price === 'number' && (
              <span className="text-[11px] text-grey3">
                Base: {formatNaira(product.base_price)}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-grey3">
              {description}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] text-grey3">Total</p>
          <p className="text-base font-bold text-[#0C0C0D]">
            {formatNaira(total)}
          </p>
        </div>
      </div>

      {/* Cross-vendor fabric — the key "what is this made of" fact, so it leads. */}
      {(appliedFabric || item.applied_fabric_yards) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-1.5">
            <Scissors className="size-3.5 text-amber-600" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              External fabric
            </h4>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Thumb
              url={firstImg(appliedFabric?.fabric?.images)}
              alt={appliedFabric?.fabric?.name ?? 'Fabric'}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#333333]">
                {appliedFabric?.fabric?.name ?? 'Applied fabric'}
              </p>
              <p className="text-xs text-grey3">
                {item.applied_fabric_yards ?? '—'} yards
                {appliedFabricVendor ? ` · from ${appliedFabricVendor}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Colour & size */}
      {!!item.color_variant_selections?.length && (
        <Section
          title="Colour & Size"
          icon={<Palette className="size-3.5 text-grey3" />}
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
          icon={<Layers className="size-3.5 text-grey3" />}
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
                icon={<Layers className="size-4 text-gray-400" />}
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
          icon={<Scissors className="size-3.5 text-grey3" />}
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
          icon={<Gem className="size-3.5 text-grey3" />}
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
                icon={<Gem className="size-4 text-gray-400" />}
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
          icon={<PlusCircle className="size-3.5 text-grey3" />}
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
                icon={<PlusCircle className="size-4 text-gray-400" />}
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
        <div className="space-y-1.5 rounded-xl bg-[hsla(0,0%,96%,1)] px-3.5 py-3">
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
                <span className="text-grey3">{label}</span>
                <span className="text-[#333333]">
                  {formatNaira(value ?? 0)}
                </span>
              </div>
            ))}

          <div className="flex items-center justify-between border-t border-[#DDE2E5] pt-1.5 text-xs">
            <span className="font-medium text-[#333333]">Before discount</span>
            <span className="font-medium text-[#333333]">
              {formatNaira(item.pricing.before_discount ?? 0)}
            </span>
          </div>

          {(item.pricing.discount ?? 0) > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-grey3">Discount</span>
              <span className="font-semibold text-red-600">
                -{formatNaira(item.pricing.discount ?? 0)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#DDE2E5] pt-1.5">
            <span className="text-xs font-semibold text-[#333333]">
              Final item total
            </span>
            <span className="text-sm font-bold text-[#0C0C0D]">
              {formatNaira(item.pricing.final ?? 0)}
            </span>
          </div>
        </div>
      )}

      {/* Customer note */}
      {item.note && (
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-grey3">
            Customer note
          </h4>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-xs italic leading-relaxed text-amber-800">
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

    if (!modal.visible) return null;

    const close = () => modal.remove();

    return (
      // z-[110] clears the order drawer sheet this opens from.
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Item details"
          className="relative z-10 flex max-h-[85vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-[#0C0C0D]">
              Item details
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-grey-black transition-colors hover:bg-gray-100"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <ItemDetailContent item={item} />
          </div>
        </div>
      </div>
    );
  }
);
