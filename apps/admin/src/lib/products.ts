import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/redux/services/products/products.api-slice';

export type ProductStatusKey =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'scheduled'
  | 'archived';

export interface ProductStatusInfo {
  key: ProductStatusKey;
  label: string;
}

// Maps the raw backend status onto the states the Figma shows: Active (green),
// Inactive (red), Draft (amber), Scheduled (blue), Archived (grey). The badge
// styling for each key lives in <ProductStatusBadge>.
export const getProductStatus = (product: Product): ProductStatusInfo => {
  const raw = (product.status ?? '').toString().toLowerCase();

  if (['archived'].includes(raw)) {
    return { key: 'archived', label: 'Archived' };
  }
  if (['inactive', 'disabled', 'suspended'].includes(raw)) {
    return { key: 'inactive', label: 'Inactive' };
  }
  if (['draft', 'pending'].includes(raw)) {
    return { key: 'draft', label: 'Draft' };
  }
  if (['scheduled', 'upcoming'].includes(raw)) {
    return { key: 'scheduled', label: 'Scheduled' };
  }
  return { key: 'active', label: 'Active' };
};

// Reads a loose string field off the product, falling back across a few
// likely keys the backend might use, then to an em dash.
const readString = (
  product: Product,
  keys: string[],
  fallback = '—'
): string => {
  for (const key of keys) {
    const value = product[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return fallback;
};

export const getProductName = (product: Product): string =>
  readString(product, ['name', 'title'], 'Unnamed product');

export const getProductCategory = (product: Product): string =>
  readString(product, ['category', 'productCategory']);

// Whether the item can be customised — shown verbatim in the "Product type"
// column ("Customisable" / "Non Customisable").
export const getProductType = (product: Product): string => {
  const explicit = readString(
    product,
    ['productType', 'type', 'customisationType'],
    ''
  );
  if (explicit) return explicit;

  const flag = product.customisable ?? product.isCustomisable;
  if (typeof flag === 'boolean') {
    return flag ? 'Customisable' : 'Non Customisable';
  }
  return '—';
};

export const getProductTag = (product: Product): string => {
  const tag = readString(product, ['tag'], '');
  if (tag) return tag;
  const tags = product.tags;
  if (Array.isArray(tags) && typeof tags[0] === 'string') return tags[0];
  return '—';
};

export const getProductImage = (product: Product): string | undefined =>
  product.images?.[0]?.url;

export const formatProductPrice = (product: Product): string =>
  typeof product.price === 'number' ? formatCurrency(product.price, 'NGN') : '—';

export interface ProductQuantityInfo {
  stock: number;
  variantCount: number;
}

export const getProductQuantity = (product: Product): ProductQuantityInfo => {
  const stock =
    typeof product.stock === 'number'
      ? product.stock
      : typeof product.quantity === 'number'
        ? product.quantity
        : 0;
  const variantCount = Array.isArray(product.variants)
    ? product.variants.length || 1
    : 1;
  return { stock, variantCount };
};

export const stockBadgeVariant = (
  stock: number
): 'success' | 'warning' | 'error' =>
  stock <= 0 ? 'error' : stock <= 5 ? 'warning' : 'success';

/* -------------------------------------------------------------------------- */
/* Fabric-specific helpers                                                    */
/* -------------------------------------------------------------------------- */

export const formatPricePerYard = (product: Product): string => {
  const value =
    typeof product.price_per_yard === 'number'
      ? product.price_per_yard
      : typeof product.pricePerYard === 'number'
        ? product.pricePerYard
        : typeof product.price === 'number'
          ? product.price
          : undefined;
  return typeof value === 'number' ? formatCurrency(value, 'NGN') : '—';
};

export const getFabricPattern = (product: Product): string =>
  readString(product, ['pattern']);

export const getFabricSubCategory = (product: Product): string =>
  readString(product, ['sub_category', 'subCategory', 'subcategory']);

export const getFabricColour = (product: Product): string =>
  readString(product, ['colour', 'color']);

// Length of fabric available, shown as "<n> Yards" in the Quantity column.
export const getFabricYards = (product: Product): number => {
  const value =
    typeof product.yard_length === 'number'
      ? product.yard_length
      : typeof product.yardLength === 'number'
        ? product.yardLength
        : typeof product.stock === 'number'
          ? product.stock
          : typeof product.quantity === 'number'
            ? product.quantity
            : 0;
  return value;
};
