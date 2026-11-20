// Print invoice: this store's part of an order as a printable page (the
// browser's Print dialog also offers "Save as PDF"). Only what the drawer
// already shows the vendor goes on it: their own items (rejected ones left
// out), the delivery the customer paid, and the customer's short name and
// area. Never the full address or contact details (customer-privacy rule).

import type {
  Order,
  OrderItem,
} from '@/redux/services/orders/orders.api-slice';
import { asProduct, getProductName } from './item-resolvers';
import {
  formatLongDate,
  formatNaira,
  readCustomerName,
  readOrderId,
} from './order-fields';

const esc = (s: unknown): string =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!
  );

/** One line per item: what it is, how many, what was charged. */
function invoiceLine(item: OrderItem, fallbackTitle: string) {
  const product = asProduct(item.product);
  const name = product ? getProductName(product) : fallbackTitle;
  const kind = product?.kind;
  const units =
    kind === 'fabric'
      ? item.fabric_selections
      : kind === 'accessory'
        ? item.accessory_selections
        : item.color_variant_selections;
  const qty =
    (units ?? []).reduce(
      (s, u: { quantity?: number }) => s + (u.quantity ?? 0),
      0
    ) || 1;
  const size = item.color_variant_selections?.[0] as
    | { size?: string; color?: string }
    | undefined;
  const detail = [
    size?.color,
    size?.size ??
      (item as { applied_fabric_size?: string }).applied_fabric_size,
  ]
    .filter(Boolean)
    .join(' · ');
  const amount = item.total_price ?? item.pricing?.final ?? 0;
  return { name, detail, qty, amount };
}

export interface InvoiceInput {
  order: Order;
  items: OrderItem[];
  storeName: string;
  /** Title for items with no catalogue product (a bespoke order's design). */
  fallbackTitle: string;
  subtotal: number;
  delivery: number;
  area?: string;
}

export function buildInvoiceHtml({
  order,
  items,
  storeName,
  fallbackTitle,
  subtotal,
  delivery,
  area,
}: InvoiceInput): string {
  const lines = items
    .filter((i) => !i.rejected)
    .map((i) => invoiceLine(i, fallbackTitle));
  const ref = readOrderId(order);
  const rows = lines
    .map(
      (l) =>
        `<tr><td>${esc(l.name)}${l.detail ? `<div class="muted">${esc(l.detail)}</div>` : ''}</td>` +
        `<td class="num">${l.qty}</td><td class="num">${esc(formatNaira(l.amount))}</td></tr>`
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${esc(ref)}</title>
<style>
  *{box-sizing:border-box} body{font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#1b1714;margin:0;padding:40px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:32px}
  h1{font-size:28px;margin:0 0 4px} .muted{color:#6b625c;font-size:12px}
  .store{font-size:18px;font-weight:600;text-align:right}
  .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:16px 0;border-top:1px solid #e7e1dc;border-bottom:1px solid #e7e1dc;margin-bottom:24px}
  .meta b{display:block;font-size:12px;color:#6b625c;font-weight:500}
  table{width:100%;border-collapse:collapse} th{text-align:left;font-size:12px;color:#6b625c;font-weight:500;border-bottom:1px solid #e7e1dc;padding:8px 0}
  td{padding:10px 0;border-bottom:1px solid #f1ece8;vertical-align:top} .num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px}
  .totals{margin-left:auto;width:280px;margin-top:16px} .totals div{display:flex;justify-content:space-between;padding:4px 0}
  .totals .grand{border-top:1px solid #1b1714;margin-top:6px;padding-top:8px;font-weight:600;font-size:16px}
  .foot{margin-top:40px} @media print{body{padding:0} @page{margin:18mm}}
</style></head><body>
<div class="head"><div><h1>Invoice</h1><div class="muted">Order ${esc(ref)}</div></div>
<div><div class="store">${esc(storeName)}</div><div class="muted" style="text-align:right">Sold on Qlozet</div></div></div>
<div class="meta">
  <div><b>Date</b>${esc(formatLongDate(order.createdAt))}</div>
  <div><b>Customer</b>${esc(readCustomerName(order))}</div>
  <div><b>Delivering to</b>${esc(area || '—')}</div>
</div>
<table><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<div class="totals">
  <div><span>Items</span><span>${esc(formatNaira(subtotal))}</span></div>
  <div><span>Delivery</span><span>${esc(formatNaira(delivery))}</span></div>
  <div class="grand"><span>Total</span><span>${esc(formatNaira(subtotal + delivery))}</span></div>
</div>
<p class="foot muted">Paid through Qlozet. Thank you for shopping with ${esc(storeName)}.</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}

/** Opens the invoice in a new tab and starts printing. False if the browser blocked the tab. */
export function printInvoice(input: InvoiceInput): boolean {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(buildInvoiceHtml(input));
  w.document.close();
  return true;
}
