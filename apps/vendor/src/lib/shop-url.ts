/** The shop's address, for links that open a listing or storefront there. */
export const SHOP_URL = (
  process.env.NEXT_PUBLIC_SHOP_URL || 'https://shop.qlozet.app'
).replace(/\/+$/, '');

/** The shop page for a listing, opened through a vendor's preview token. */
export const shopPreviewUrl = (productId: string, token: string) =>
  `${SHOP_URL}/products/${encodeURIComponent(productId)}?preview=${encodeURIComponent(token)}`;
