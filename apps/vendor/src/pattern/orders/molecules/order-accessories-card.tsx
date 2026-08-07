'use client';

// Accessories & add-ons — bespoke order drawer.
//
// Reuses the same resolvers and row atoms as the item detail modal; this is a
// flatter, drawer-level presentation of the selections across every item.

import React from 'react';
import { Gem, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  ClothingAccessoryDoc,
  ClothingAddonDoc,
  Order,
  ProductImage,
} from '@/redux/services/orders/orders.api-slice';
import { asProduct, byId, firstImg } from '../lib/item-resolvers';
import { SelectionRow } from './selection-row';

const IncludedBadge = () => (
  <span className="inline-flex h-[26px] items-center rounded-lg bg-[#EAECF0] px-3 text-xs font-medium text-[#475467]">
    Included
  </span>
);

interface ResolvedSelection {
  key: string;
  title: string;
  subtitle?: string;
  url?: string | null;
  swatch?: string | null;
  price?: number;
  qty?: number;
}

interface OrderAccessoriesCardProps {
  order: Order;
  onViewAll?: () => void;
}

export const OrderAccessoriesCard = ({
  order,
  onViewAll,
}: OrderAccessoriesCardProps) => {
  const accessories: ResolvedSelection[] = [];
  const addons: ResolvedSelection[] = [];

  (order.items ?? []).forEach((item, itemIndex) => {
    const clothing = asProduct(item.product)?.clothing;

    item.accessory_selections?.forEach((a, i) => {
      const acc = byId<ClothingAccessoryDoc>(
        clothing?.accessories,
        a.accessory_id
      );
      const variant = byId(
        acc?.variants as { _id?: string }[],
        a.variant_id
      ) as { name?: string; images?: ProductImage[] } | undefined;
      accessories.push({
        key: `${itemIndex}-acc-${i}`,
        title: acc?.name ?? 'Accessory',
        subtitle: variant?.name,
        url: firstImg(variant?.images) ?? firstImg(acc?.images),
        price: a.total_amount,
        qty: a.quantity,
      });
    });

    item.addon_selections?.forEach((ad, i) => {
      const addon = byId<ClothingAddonDoc>(clothing?.addons, ad.addon_id);
      const variant = byId(
        addon?.variants as { _id?: string }[],
        ad.variant_id
      ) as
        | { name?: string; color_hex?: string; image_url?: string }
        | undefined;
      addons.push({
        key: `${itemIndex}-addon-${i}`,
        title: addon?.name ?? 'Add-on',
        subtitle: variant?.name,
        url: variant?.image_url ?? null,
        swatch: variant?.color_hex ?? null,
        price: ad.total_amount,
        qty: ad.quantity,
      });
    });
  });

  // Nothing selected — the section has no place in the drawer at all.
  if (accessories.length === 0 && addons.length === 0) return null;

  const renderGroup = (
    label: string,
    rows: ResolvedSelection[],
    icon: React.ReactNode
  ) =>
    rows.length > 0 && (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-grey-black dark:text-white">
          {label}
        </h4>
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.key}
              className="rounded-xl border border-[#E5E7EB] dark:border-border bg-white dark:bg-[#404040]"
            >
              <SelectionRow
                url={row.url}
                swatch={row.swatch}
                icon={icon}
                title={row.title}
                subtitle={row.subtitle}
                price={row.price}
                qty={row.qty}
                priceBelow
                badge={<IncludedBadge />}
              />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <section className="space-y-4 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-grey-black dark:text-white">
          Accessories &amp; add-ons
        </h3>
        {onViewAll && (
          <Button
            type="button"
            variant="outline"
            onClick={onViewAll}
            className="h-8 rounded-full px-3 text-xs font-normal"
          >
            View ›
          </Button>
        )}
      </div>

      {renderGroup(
        'Accessories',
        accessories,
        <Gem className="size-4 text-gray-400" />
      )}
      {renderGroup(
        'Add-ons',
        addons,
        <PlusCircle className="size-4 text-gray-400" />
      )}
    </section>
  );
};
