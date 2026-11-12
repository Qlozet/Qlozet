import { SHOP_URL } from './shop-url';

/**
 * A store's shop address: shop.qlozet.app/s/<slug>. The backend has the full
 * rules (reserved names, who has what); this mirrors the format part so the
 * field can answer as the vendor types. Keep in step with
 * backend src/modules/business/store-slug.ts.
 */

export const STORE_SLUG_MIN = 3;
export const STORE_SLUG_MAX = 40;

/** The shop address for a slug, e.g. https://shop.qlozet.app/s/adaeze-couture */
export const storeAddressUrl = (slug: string) =>
  `${SHOP_URL}/s/${encodeURIComponent(slug)}`;

/** "shop.qlozet.app/s/" - what the vendor sees in front of the field. */
export const storeAddressPrefix = () =>
  `${SHOP_URL.replace(/^https?:\/\//, '')}/s/`;

/**
 * What the vendor typed, turned into an address as they go: lowercase, spaces
 * and underscores become hyphens, anything else is dropped. A trailing hyphen
 * is kept while typing so "kemi-" can become "kemi-lagos".
 */
export function tidyStoreSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, STORE_SLUG_MAX);
}

/** Format problem to show straight away, or null to ask the backend. */
export function storeSlugFormatProblem(slug: string): string | null {
  if (slug.length < STORE_SLUG_MIN) {
    return `Use at least ${STORE_SLUG_MIN} characters.`;
  }
  if (slug.endsWith('-')) return "The address can't end with a hyphen.";
  return null;
}
