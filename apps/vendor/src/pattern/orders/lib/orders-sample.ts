// Mockup sample data for the parts of the Orders feature with no backend
// endpoint (stats, "most purchased", order-detail item visuals, quote
// defaults, garment specs). Per the agreed approach, these mirror the design
// mockups; replace with real queries when endpoints exist.

import type { OrderRow } from './order-fields';

// ---- Headline stats (no /orders/stats endpoint) ----
export const SAMPLE_ORDER_STATS = {
  totalOrders: 1000,
  ordersDelivered: 900,
  ordersInTransit: 3,
  mostPurchased: 'Amasi Dress',
  trend: '2.5%',
};

// ---- Fallback rows so the table matches the populated mockup when the real
// /orders/vendor list is empty in this environment. ----
export const SAMPLE_ORDERS: OrderRow[] = [
  { _id: 's1', reference: '123455ASDF', createdAt: '2023-09-23', customerName: 'Omoniyi Precious', product_price: 120000, amount_paid: 120000, total_items: 1, status: 'out_for_delivery' },
  { _id: 's2', reference: '123455ASDF', createdAt: '2023-09-23', customerName: 'Kennedy James', product_price: 120000, amount_paid: 120000, total_items: 1, status: 'pending' },
  { _id: 's3', reference: '123455ASDF', createdAt: '2023-09-24', customerName: 'Toyosi Adeyemi', product_price: 120000, amount_paid: 120000, total_items: 1, status: 'return' },
  { _id: 's4', reference: '123455ASDF', createdAt: '2023-09-24', customerName: 'Kunle Remi', product_price: 120000, amount_paid: 120000, total_items: 1, status: 'successful' },
  { _id: 's5', reference: '123455ASDF', createdAt: '2023-09-24', customerName: 'Kiki Mordi', product_price: 120000, amount_paid: 120000, total_items: 1, status: 'failed' },
  { _id: 's6', reference: '123455ASDF', createdAt: '2023-09-24', customerName: 'Erica Queen', product_price: 120000, amount_paid: 120000, total_items: 1, status: 'rejected' },
  { _id: 's7', reference: '123455ASDF', createdAt: '2023-09-24', customerName: 'Erica Queen', product_price: 120000, amount_paid: 120000, total_items: 1, status: 'ready_to_ship' },
  // A custom/bespoke order so the quote-builder drawer is reachable from the demo.
  { _id: 's8', reference: '256038', createdAt: '2023-10-12', customerName: 'Erica Queen', product_price: 250000, amount_paid: 250000, total_items: 1, status: 'pending', order_type: 'custom', quote_id: 's8-quote' },
];

// ---- Standard order detail: items + payment (no order-detail endpoint) ----
export interface SampleOrderItem {
  image: string;
  name: string;
  price: number;
  oldPrice?: number;
  qty: number;
  discounts?: string[];
}

export const SAMPLE_ORDER_ITEMS: SampleOrderItem[] = [
  { image: '', name: 'Poofie dress', price: 28000, oldPrice: 35000, qty: 2 },
  { image: '', name: 'Double breasted c...', price: 105000, qty: 2, discounts: ['$10,000 off'] },
  { image: '', name: 'Garm Island Maiso...', price: 33750, oldPrice: 67500, qty: 2, discounts: ['20% off', '30% off', '$10,000 off'] },
];

export const SAMPLE_ORDER_PAYMENT = {
  total: 25000,
  paymentStatus: 'Paid',
  refundStatus: 'Not Refunded',
};

// ---- Quote builder defaults (prefill before a real quote is loaded) ----
export const SAMPLE_QUOTE = {
  status: 'Draft',
  line_items: [
    { label: 'Base Tailoring', amount: 25000 },
    { label: 'Fabric', amount: 18500 },
    { label: 'Accessories', amount: 3500 },
    { label: 'Add-ons', amount: 3500 },
  ],
  required_fabric_yards: 7,
  estimated_completion_days: 14,
  vendor_notes: '',
};

export const SAMPLE_GARMENT_SPEC = {
  name: 'Poofie dress',
  image: '',
  tags: ['Senator', 'Minimal', 'Pocket detail'],
};
