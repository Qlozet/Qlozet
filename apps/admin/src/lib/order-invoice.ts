// Printable invoice for an order.
//
// There is no invoice endpoint on the backend — no PDF is generated server-side
// and no document is stored — so the invoice is composed client-side from the
// order the drawer already holds and handed to the browser's print dialog
// (which also covers "Save as PDF"). Every figure comes from the order record;
// nothing here is filled in with a placeholder.

import type {
  AdminOrder,
  AdminOrderItem,
} from '@/redux/services/orders/orders.api-slice';
import {
  formatNaira,
  formatOrderDate,
  readAmountPaid,
  readCustomerName,
  readItemName,
  readItemPricing,
  readOrderId,
  readPaymentStatus,
  readStatus,
} from './orders';

/** Escape order-supplied text before it goes into the print document. */
const esc = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const row = (label: string, value: string, strong = false): string =>
  `<tr><td class="label">${esc(label)}</td><td class="value${
    strong ? ' strong' : ''
  }">${esc(value)}</td></tr>`;

const itemRow = (item: AdminOrderItem): string => {
  const { final, quantity } = readItemPricing(item);
  return `<tr>
    <td>${esc(readItemName(item))}</td>
    <td class="num">${quantity > 0 ? esc(quantity) : '—'}</td>
    <td class="num">${esc(formatNaira(final))}</td>
  </tr>`;
};

export const buildInvoiceHtml = (order: AdminOrder): string => {
  const items = Array.isArray(order.items) ? order.items : [];
  const amountPaid = readAmountPaid(order);
  const paymentStatus = readPaymentStatus(order);
  const reference = readOrderId(order);

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Invoice ${esc(reference)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
         color: #0C0C0D; margin: 0; padding: 40px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .muted { color: #6B7280; font-size: 12px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 2px solid #0C0C0D; padding-bottom: 16px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase;
       letter-spacing: .05em; color: #6B7280; border-bottom: 1px solid #DDE2E5;
       padding: 8px 0; }
  td { padding: 10px 0; font-size: 13px; border-bottom: 1px solid #F1F3F5; }
  td.num, th.num { text-align: right; }
  .totals td { border: none; padding: 6px 0; }
  .totals td.label { color: #6B7280; font-size: 13px; }
  .totals td.value { text-align: right; font-size: 13px; }
  .totals td.strong { font-weight: 700; font-size: 15px; }
  .empty { color: #6B7280; font-size: 13px; font-style: italic; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <div class="head">
    <div>
      <h1>Invoice</h1>
      <p class="muted">Order ${esc(reference)}</p>
    </div>
    <div style="text-align:right">
      <p class="muted">Date: ${esc(formatOrderDate(order.createdAt))}</p>
      <p class="muted">Status: ${esc(readStatus(order))}</p>
      ${paymentStatus ? `<p class="muted">Payment: ${esc(paymentStatus)}</p>` : ''}
    </div>
  </div>

  <table>
    <tbody>
      ${row('Customer', readCustomerName(order))}
    </tbody>
  </table>

  <table>
    <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Amount</th></tr></thead>
    <tbody>
      ${
        items.length > 0
          ? items.map(itemRow).join('')
          : '<tr><td colspan="3" class="empty">This order has no items.</td></tr>'
      }
    </tbody>
  </table>

  <table class="totals">
    <tbody>
      ${typeof order.subtotal === 'number' ? row('Subtotal', formatNaira(order.subtotal)) : ''}
      ${typeof order.shipping_fee === 'number' ? row('Shipping', formatNaira(order.shipping_fee)) : ''}
      ${typeof order.total === 'number' ? row('Total', formatNaira(order.total), true) : ''}
      ${amountPaid !== undefined ? row('Amount paid', formatNaira(amountPaid)) : ''}
    </tbody>
  </table>
</body></html>`;
};

/**
 * Open the order's invoice in the browser's print dialog.
 *
 * Returns false when the browser blocked the popup, so the caller can tell the
 * user why nothing happened instead of leaving the click silent.
 */
export const printOrderInvoice = (order: AdminOrder): boolean => {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) return false;

  printWindow.document.write(buildInvoiceHtml(order));
  printWindow.document.close();
  printWindow.focus();

  // Let the document lay out before printing, otherwise Safari prints a blank page.
  printWindow.onload = () => printWindow.print();
  setTimeout(() => {
    try {
      printWindow.print();
    } catch {
      // The onload handler already fired; nothing more to do.
    }
  }, 300);

  return true;
};
