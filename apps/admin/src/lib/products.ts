import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/redux/services/products/products.api-slice';

/* -------------------------------------------------------------------------- */
/* Reading the product payload                                                */
/*                                                                            */
/* GET /products returns a *discriminated* document: the sellable detail lives */
/* under `clothing`, `accessory` or `fabric` depending on `kind`, and only the */
/* envelope (base_price, status, tags, business, availability) is top-level.   */
/* These readers used to look for flat `name` / `price` / `stock` / `variants` */
/* keys, none of which the API sends — which is why every clothing row on the  */
/* admin catalogue rendered "Unnamed product" and a column of em dashes.       */
/* -------------------------------------------------------------------------- */

interface Taxonomy {
  product_type?: string;
  categories?: string[];
  attributes?: string[];
  audience?: string;
}

interface ProductImage {
  url?: string;
  public_id?: string;
}

interface ProductTag {
  name?: string;
  slug?: string;
  type?: string;
}

interface Variant {
  size?: string;
  stock?: number;
  price?: number;
  sku?: string;
}

interface ColorVariant {
  name?: string;
  hex?: string;
  images?: ProductImage[];
  variants?: Variant[];
}

/** The `clothing` / `accessory` / `fabric` sub-document, whichever is set. */
interface KindDetail {
  name?: string;
  type?: string;
  description?: string;
  taxonomy?: Taxonomy;
  images?: ProductImage[];
  color_variants?: ColorVariant[];
  variants?: Variant[];
  // Fabric-only
  price_per_yard?: number;
  yard_length?: number;
  min_cut?: number;
  width?: number;
  pattern?: string;
  colour?: string;
  color?: string;
  material?: string;
  sub_category?: string;
  category?: string;
}

interface Availability {
  state?: string;
  in_stock?: boolean;
  low_stock?: boolean;
  total_stock?: number;
  variants?: { _id?: string; label?: string; stock?: number }[];
}

const DASH = '—';

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;

/** The kind sub-document for this product, whichever of the three is present. */
export const getKindDetail = (product: Product): KindDetail => {
  const byKind = product[(product.kind ?? '') as string];
  return (asRecord(byKind) ??
    asRecord(product.clothing) ??
    asRecord(product.accessory) ??
    asRecord(product.fabric) ??
    {}) as KindDetail;
};

const getAvailability = (product: Product): Availability =>
  (asRecord(product.availability) ?? {}) as Availability;

const getTaxonomy = (product: Product): Taxonomy =>
  getKindDetail(product).taxonomy ?? {};

const firstNonEmpty = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

export type ProductStatusKey =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'scheduled'
  | 'archived'
  | 'rejected';

export interface ProductStatusInfo {
  key: ProductStatusKey;
  label: string;
}

export type ModerationKey = 'pending' | 'approved' | 'rejected';

/** Platform moderation verdict; absent on products that predate moderation. */
export const getProductModeration = (product: Product): ModerationKey => {
  const raw = asRecord(product.moderation)?.status;
  return raw === 'approved' || raw === 'rejected' ? raw : 'pending';
};

/**
 * The single state to show in the table.
 *
 * Two independent flags decide it: the vendor's `status` (their publish switch)
 * and the platform's `moderation.status` (ours). A rejection outranks whatever
 * the vendor set, and a pending scheduled activation outranks a plain draft —
 * "Scheduled" tells the admin something is going to happen on its own.
 */
export const getProductStatus = (product: Product): ProductStatusInfo => {
  if (getProductModeration(product) === 'rejected') {
    return { key: 'rejected', label: 'Rejected' };
  }

  const raw = (product.status ?? '').toString().toLowerCase();

  if (raw === 'scheduled' || product.scheduled_activation_date) {
    return { key: 'scheduled', label: 'Scheduled' };
  }
  if (raw === 'archived') return { key: 'archived', label: 'Archived' };
  if (['inactive', 'disabled', 'suspended'].includes(raw)) {
    return { key: 'inactive', label: 'Inactive' };
  }
  if (['draft', 'pending'].includes(raw))
    return { key: 'draft', label: 'Draft' };
  return { key: 'active', label: 'Active' };
};

/* -------------------------------------------------------------------------- */
/* Storefront visibility                                                      */
/* -------------------------------------------------------------------------- */

export interface StorefrontVisibility {
  visible: boolean;
  /** Why a customer can't see it — one line per failing gate, in plain words. */
  reasons: string[];
}

/**
 * Whether a customer would find this listing in the shop.
 *
 * Mirrors the gate the API applies in `findAll` and on the PDP, which is three
 * independent conditions: the product is ACTIVE, the platform has not rejected
 * it, and its vendor is approved and not deactivated. A moderator opening the
 * preview needs all three — "it looks fine but nobody can see it" is the
 * question the preview exists to answer.
 */
export const getStorefrontVisibility = (
  product: Product
): StorefrontVisibility => {
  const reasons: string[] = [];

  const status = (product.status ?? '').toString().toLowerCase();
  if (status !== 'active') {
    reasons.push(
      product.scheduled_activation_date
        ? 'It is scheduled to go live, and is not active yet.'
        : `The vendor has it set to "${status || 'draft'}", not active.`
    );
  }

  if (getProductModeration(product) === 'rejected') {
    reasons.push('The platform rejected this listing.');
  }

  const business = asRecord(product.business);
  if (business) {
    const vendorStatus = (business.status ?? '').toString().toLowerCase();
    // Only approved/verified vendors reach customers. A missing status on a
    // populated business means the field wasn't selected, not that it failed.
    if (vendorStatus && !['approved', 'verified'].includes(vendorStatus)) {
      reasons.push(`Its vendor is "${vendorStatus}", not approved to sell.`);
    }
    if (business.is_active === false) {
      reasons.push('Its vendor is deactivated.');
    }
  }

  return { visible: reasons.length === 0, reasons };
};

/* -------------------------------------------------------------------------- */
/* Columns                                                                    */
/* -------------------------------------------------------------------------- */

export const getProductName = (product: Product): string =>
  firstNonEmpty(
    getKindDetail(product).name,
    asRecord(product.seo)?.title,
    product.name,
    product.title
  ) ?? 'Unnamed product';

/** Taxonomy category, e.g. "T-Shirt". Fabrics carry a flat category instead. */
export const getProductCategory = (product: Product): string => {
  const detail = getKindDetail(product);
  const taxonomy = detail.taxonomy ?? {};
  return (
    firstNonEmpty(
      taxonomy.categories?.[0],
      detail.category,
      detail.sub_category,
      product.category
    ) ?? DASH
  );
};

/**
 * Taxonomy product type, e.g. "Top". Clothing that carries no taxonomy still
 * has a customisation flag worth showing, so fall back to that.
 */
export const getProductType = (product: Product): string => {
  const detail = getKindDetail(product);
  const explicit = firstNonEmpty(detail.taxonomy?.product_type);
  if (explicit) return explicit;

  const kindType = firstNonEmpty(detail.type);
  if (kindType) {
    return kindType === 'customize'
      ? 'Customisable'
      : kindType === 'non_customize'
        ? 'Non Customisable'
        : kindType;
  }
  return DASH;
};

/** Whether this clothing item is made to order. */
export const isCustomisable = (product: Product): boolean =>
  getKindDetail(product).type === 'customize';

export const getProductTags = (product: Product): string[] => {
  const collect = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((tag) => (typeof tag === 'string' ? tag : (tag as ProductTag)?.name))
      .filter((name): name is string => Boolean(name && name.trim()));
  };

  // Tags live in two places: system tags the API stamps onto `metafields`, and
  // whatever the vendor added at the top level.
  return [
    ...new Set([
      ...collect(asRecord(product.metafields)?.tags),
      ...collect(product.tags),
    ]),
  ];
};

export const getProductTag = (product: Product): string =>
  getProductTags(product)[0] ?? DASH;

/**
 * Every image on the listing, product-level shots first then each colour's —
 * the order a customer scrolls them in. De-duplicated: a colour whose swatch
 * repeats a product shot shouldn't appear twice in the gallery.
 */
export const getProductImages = (product: Product): string[] => {
  const detail = getKindDetail(product);
  const urls = [
    ...(detail.images ?? []),
    ...(detail.color_variants ?? []).flatMap((colour) => colour.images ?? []),
    ...(product.images ?? []),
  ]
    .map((image) => image?.url)
    .filter((url): url is string => Boolean(url));

  return [...new Set(urls)];
};

/** The colours a customer can pick, with the sizes in stock for each. */
export interface ColourOption {
  name: string;
  hex: string;
  sizes: { size: string; stock: number }[];
}

export const getColourOptions = (product: Product): ColourOption[] =>
  (getKindDetail(product).color_variants ?? []).map((colour) => ({
    name: colour.name ?? colour.hex ?? 'Colour',
    hex: colour.hex ?? '#e5e7eb',
    sizes: (colour.variants ?? [])
      .filter((variant) => variant.size)
      .map((variant) => ({
        size: variant.size as string,
        stock: Number(variant.stock) || 0,
      })),
  }));

export const getProductDescription = (product: Product): string | undefined =>
  firstNonEmpty(getKindDetail(product).description, product.description);

/** Made-to-order lead time, in days, when the vendor set one. */
export const getTurnaroundDays = (product: Product): number | undefined => {
  const value = (getKindDetail(product) as { turnaround_days?: unknown })
    .turnaround_days;
  return typeof value === 'number' && value > 0 ? value : undefined;
};

/** Product-level image, falling back to the first colour variant's own shots. */
export const getProductImage = (product: Product): string | undefined => {
  const detail = getKindDetail(product);
  const fromDetail = detail.images?.find((image) => image?.url)?.url;
  if (fromDetail) return fromDetail;

  for (const colour of detail.color_variants ?? []) {
    const url = colour.images?.find((image) => image?.url)?.url;
    if (url) return url;
  }
  return product.images?.[0]?.url;
};

/* -------------------------------------------------------------------------- */
/* Price                                                                      */
/* -------------------------------------------------------------------------- */

/** Effective price: the discounted one when it undercuts base, else base. */
export const getProductPrice = (product: Product): number | undefined => {
  const base =
    typeof product.base_price === 'number'
      ? product.base_price
      : typeof asRecord(product.metafields)?.base_price === 'number'
        ? (asRecord(product.metafields)!.base_price as number)
        : typeof product.price === 'number'
          ? product.price
          : getKindDetail(product).price_per_yard;

  const discounted = product.discounted_price;
  if (
    typeof discounted === 'number' &&
    discounted > 0 &&
    (base === undefined || discounted < base)
  ) {
    return discounted;
  }
  return base;
};

export const formatProductPrice = (product: Product): string => {
  const price = getProductPrice(product);
  return typeof price === 'number' ? formatCurrency(price, 'NGN') : DASH;
};

export const getDiscountPercentage = (product: Product): number | undefined =>
  typeof product.discount_percentage === 'number' &&
  product.discount_percentage > 0
    ? product.discount_percentage
    : undefined;

/* -------------------------------------------------------------------------- */
/* Stock                                                                      */
/* -------------------------------------------------------------------------- */

export interface ProductQuantityInfo {
  stock: number;
  variantCount: number;
}

/**
 * Units in stock and how many variants hold them.
 *
 * The API computes an `availability` block per row (total_stock + a flattened
 * variant list), so prefer that; the manual walk covers rows fetched from an
 * endpoint that doesn't attach it.
 */
export const getProductQuantity = (product: Product): ProductQuantityInfo => {
  const availability = getAvailability(product);
  if (typeof availability.total_stock === 'number') {
    return {
      stock: availability.total_stock,
      variantCount: availability.variants?.length ?? 1,
    };
  }

  const detail = getKindDetail(product);
  const sized = [
    ...(detail.color_variants ?? []).flatMap((colour) => colour.variants ?? []),
    ...(detail.variants ?? []),
  ];

  if (sized.length) {
    return {
      stock: sized.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
      variantCount: sized.length,
    };
  }

  // Fabric has no variants — its "stock" is remaining yardage.
  if (typeof detail.yard_length === 'number') {
    return { stock: detail.yard_length, variantCount: 1 };
  }
  return { stock: 0, variantCount: 1 };
};

export const stockBadgeVariant = (
  stock: number
): 'success' | 'warning' | 'error' =>
  stock <= 0 ? 'error' : stock <= 5 ? 'warning' : 'success';

/* -------------------------------------------------------------------------- */
/* Vendor                                                                     */
/* -------------------------------------------------------------------------- */

export const getProductVendorName = (product: Product): string =>
  firstNonEmpty(asRecord(product.business)?.business_name) ?? DASH;

export const getProductVendorId = (product: Product): string | undefined => {
  const business = product.business;
  if (typeof business === 'string') return business;
  const id = asRecord(business)?._id;
  return typeof id === 'string' ? id : undefined;
};

/* -------------------------------------------------------------------------- */
/* Fabric-specific helpers                                                    */
/* -------------------------------------------------------------------------- */

export const formatPricePerYard = (product: Product): string => {
  const detail = getKindDetail(product);
  const value =
    typeof detail.price_per_yard === 'number'
      ? detail.price_per_yard
      : getProductPrice(product);
  return typeof value === 'number' ? formatCurrency(value, 'NGN') : DASH;
};

export const getFabricPattern = (product: Product): string =>
  firstNonEmpty(getKindDetail(product).pattern) ?? DASH;

export const getFabricSubCategory = (product: Product): string =>
  firstNonEmpty(
    getKindDetail(product).sub_category,
    getTaxonomy(product).categories?.[0]
  ) ?? DASH;

export const getFabricColour = (product: Product): string =>
  firstNonEmpty(
    getKindDetail(product).colour,
    getKindDetail(product).color,
    getKindDetail(product).color_variants?.[0]?.name
  ) ?? DASH;

/** Length of fabric available, shown as "<n> Yards" in the Quantity column. */
export const getFabricYards = (product: Product): number => {
  const detail = getKindDetail(product);
  if (typeof detail.yard_length === 'number') return detail.yard_length;
  return getProductQuantity(product).stock;
};
