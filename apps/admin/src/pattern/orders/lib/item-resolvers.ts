// Order item / product image resolvers.
//
// `AdminOrderItem.product` is typed `unknown` because the Order schema is empty
// in Swagger. These helpers read it defensively: images live either on a
// kind-specific sub-document (clothing / fabric / accessory) or on the product's
// own `images` array, and each entry is either a URL string or an `{ url }`
// object.

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
