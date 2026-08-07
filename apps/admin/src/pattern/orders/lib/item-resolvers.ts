// Order item / product image resolvers.
//
// The Order schema is empty in Swagger, so these helpers read the product
// defensively: images live either on a kind-specific sub-document (clothing /
// fabric / accessory) or on the product's own `images` array, and each entry is
// either a URL string or an `{ url }` object.
//
// The resolvers below the image helpers turn an item's selection arrays — which
// reference catalogue entries by id — into the names, thumbnails and swatches
// the item detail modal renders.

import type {
  AdminOrderItem,
  PopulatedProduct,
  ProductImage,
} from '@/redux/services/orders/orders.api-slice';

type ImageEntry = string | { url?: string } | null | undefined;

const toUrls = (images: unknown): string[] =>
  Array.isArray(images)
    ? images
        .map((img: ImageEntry) => {
          if (typeof img === 'string') return img.trim();
          if (img && typeof img === 'object' && typeof img.url === 'string')
            return img.url.trim();
          return '';
        })
        .filter(Boolean)
    : [];

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

/** Every image URL on a product, kind-specific images first, de-duplicated. */
export const allProductImages = (product: unknown): string[] => {
  const p = asRecord(product);
  const kindImages =
    asRecord(p.clothing).images ??
    asRecord(p.fabric).images ??
    asRecord(p.accessory).images;

  return Array.from(new Set([...toUrls(kindImages), ...toUrls(p.images)]));
};

/** First usable URL out of an images array. */
export const firstImg = (
  images?: (string | ProductImage)[] | null
): string | null => toUrls(images)[0] ?? null;

/** The item's product when it came back populated, else null. */
export const asProduct = (
  product: AdminOrderItem['product']
): PopulatedProduct | null =>
  product && typeof product === 'object' ? (product as PopulatedProduct) : null;

/** Look a catalogue sub-document up by the id a selection references. */
export const byId = <T extends { _id?: string }>(
  items: T[] | undefined,
  id?: string
): T | undefined =>
  id ? items?.find((entry) => String(entry._id) === String(id)) : undefined;

/**
 * Product descriptions are stored as HTML (e.g. "<p>A Classic</p>"), so they
 * have to be reduced to text before rendering — otherwise the tags show up
 * literally.
 */
export const htmlToText = (html?: string): string =>
  (html ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/**
 * True when an item has anything worth opening a detail view for. A plain
 * off-the-rack product with no selections and no description has nothing more
 * to show than the row already does, so its row shouldn't look clickable.
 */
export const hasItemDetails = (item: AdminOrderItem): boolean => {
  const product = asProduct(item.product);
  return Boolean(
    item.color_variant_selections?.length ||
    item.style_selections?.length ||
    item.fabric_selections?.length ||
    item.accessory_selections?.length ||
    item.addon_selections?.length ||
    item.note ||
    item.applied_fabric ||
    item.applied_fabric_yards ||
    item.pricing ||
    htmlToText(product?.clothing?.description)
  );
};

/** Design images on a bespoke order, tolerating both field names. */
export const bespokeDesignImages = (order: unknown): string[] => {
  const design = asRecord(asRecord(order).bespoke_design);
  return Array.from(
    new Set([
      ...toUrls(design.design_images),
      ...toUrls(design.reference_images),
    ])
  );
};
