// Resolvers for order-item sub-documents.
//
// The backend returns order items with kind-specific sub-docs (clothing /
// fabric / accessory) and selection arrays that reference those sub-docs by id.
// These helpers turn that into display values. Shared by the item detail modal
// and the bespoke drawer's Fabric / Accessories sections.

import type {
  Order,
  OrderItem,
  PopulatedProduct,
  ProductImage,
  AppliedFabricRef,
  ClothingFabricDoc,
} from '@/redux/services/orders/orders.api-slice';

export const firstImg = (images?: (string | ProductImage)[]): string | null => {
  if (!images?.length) return null;
  const first = images[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && first.url) return first.url;
  return null;
};

export const asProduct = (p: OrderItem['product']): PopulatedProduct | null =>
  typeof p === 'object' && p !== null ? (p as PopulatedProduct) : null;

export const getProductName = (product: PopulatedProduct | null): string => {
  if (!product) return 'Product';
  return (
    product.clothing?.name ??
    product.fabric?.name ??
    product.accessory?.name ??
    product.name ??
    'Product'
  );
};

export const getProductImageUrl = (
  product: PopulatedProduct | null
): string | null => {
  if (!product) return null;
  const kindImages =
    product.clothing?.images ??
    product.fabric?.images ??
    product.accessory?.images;
  return firstImg(kindImages) ?? firstImg(product.images);
};

/** Every image URL on a product, kind-specific images first. */
export const allProductImages = (
  product: PopulatedProduct | null
): string[] => {
  if (!product) return [];
  const kindImages =
    product.clothing?.images ??
    product.fabric?.images ??
    product.accessory?.images;

  const toUrls = (images?: (string | ProductImage)[]): string[] =>
    (images ?? [])
      .map((img) =>
        typeof img === 'string' ? img : img && img.url ? img.url : null
      )
      .filter((url): url is string => Boolean(url));

  // De-duplicate — the same asset can appear on both the kind sub-doc and the
  // top-level images array.
  return Array.from(
    new Set([...toUrls(kindImages), ...toUrls(product.images)])
  );
};

export const byId = <T extends { _id?: string }>(
  arr: T[] | undefined,
  id?: string
): T | undefined =>
  id ? arr?.find((x) => String(x._id) === String(id)) : undefined;

/* ── Fabric ── */

const YARDS_TO_METRES = 0.9144;

export const yardsToMetres = (yards: number): number =>
  Math.round(yards * YARDS_TO_METRES * 100) / 100;

export interface OrderFabricSummary {
  name?: string;
  imageUrl?: string | null;
  yards?: number;
  pricePerYard?: number;
  /** Business the fabric is bought from — absent when the vendor supplies it. */
  sourceBusiness?: string;
  /**
   * True when the vendor has to buy the fabric themselves (so its cost belongs
   * in their quote) rather than receiving it from another vendor.
   */
  vendorSources: boolean;
}

const extractBusinessName = (
  business: AppliedFabricRef['business']
): string | undefined => {
  if (!business) return undefined;
  if (typeof business === 'string') return undefined;
  return business.business_name;
};

/**
 * Summarise the fabric on an order item.
 *
 * Two cases the design distinguishes:
 *  - `applied_fabric` — a cross-vendor fabric the customer picked from another
 *    vendor. It ships to this vendor, so it has a source business and a status.
 *  - `fabric_selections` — fabric from the vendor's own catalogue, which they
 *    supply themselves and must price into the quote.
 */
export const readOrderFabric = (
  item: OrderItem,
  product = asProduct(item.product)
): OrderFabricSummary | null => {
  const applied =
    item.applied_fabric && typeof item.applied_fabric === 'object'
      ? (item.applied_fabric as AppliedFabricRef)
      : null;

  if (applied || item.applied_fabric_yards) {
    return {
      name: applied?.fabric?.name,
      imageUrl: firstImg(applied?.fabric?.images),
      yards: item.applied_fabric_yards,
      pricePerYard: applied?.base_price,
      sourceBusiness: extractBusinessName(applied?.business),
      vendorSources: false,
    };
  }

  const selection = item.fabric_selections?.[0];
  if (!selection) return null;

  const fabricDoc =
    byId<ClothingFabricDoc>(product?.clothing?.fabrics, selection.fabric_id) ??
    (product?.fabric as ClothingFabricDoc | undefined);

  return {
    name: fabricDoc?.name,
    imageUrl: firstImg(fabricDoc?.images),
    yards: selection.yardage ?? selection.yards,
    pricePerYard: fabricDoc?.price_per_yard,
    vendorSources: true,
  };
};

/** The first item on an order that carries fabric information. */
export const findFabricItem = (order: Order): OrderItem | undefined =>
  (order.items ?? []).find(
    (item) =>
      item.applied_fabric ||
      item.applied_fabric_yards ||
      item.fabric_selections?.length
  );
