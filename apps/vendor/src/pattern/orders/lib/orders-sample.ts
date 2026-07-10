// Mockup sample data for the parts of the Orders feature with no backend
// endpoint (stats, "most purchased"). Uses the real Order schema so the table
// renders correctly whether real data or fallback is shown.

import type { Order, OrderStatus } from '@/redux/services/orders/orders.api-slice';

// ---- Headline stats (no /orders/stats endpoint — use /orders/chart) ----
export const SAMPLE_ORDER_STATS = {
  totalOrders: 1000,
  ordersDelivered: 900,
  ordersInTransit: 3,
  mostPurchased: 'Amasi Dress',
  trend: '2.5%',
};

// ---- Helper to create a sample order matching the real schema ----
const sample = (
  id: string,
  ref: string,
  name: string,
  status: OrderStatus,
  total: number,
  opts?: { type?: 'bespoke'; bespoke_quote?: string }
): Order => ({
  _id: id,
  reference: ref,
  customer: {
    _id: `cust-${id}`,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
    firstName: name.split(' ')[0],
    lastName: name.split(' ').slice(1).join(' ') || undefined,
  },
  items: [],
  address: {},
  subtotal: total,
  shipping_fee: 0,
  total,
  status,
  type: opts?.type,
  bespoke_quote: opts?.bespoke_quote,
  shipments: [],
  createdAt: '2023-09-23T00:00:00.000Z',
  updatedAt: '2023-09-23T00:00:00.000Z',
});

// ---- Fallback rows so the table matches the populated mockup when the real
// /orders/vendor list is empty in this environment. ----
export const SAMPLE_ORDERS: Order[] = [
  sample('s1', 'ORD-123455', 'Omoniyi Precious', 'in_transit', 120000),
  sample('s2', 'ORD-123456', 'Kennedy James', 'pending', 120000),
  sample('s3', 'ORD-123457', 'Toyosi Adeyemi', 'returned', 120000),
  sample('s4', 'ORD-123458', 'Kunle Remi', 'completed', 120000),
  sample('s5', 'ORD-123459', 'Kiki Mordi', 'cancelled', 120000),
  sample('s6', 'ORD-123460', 'Erica Queen', 'in_review', 120000),
  sample('s7', 'ORD-123461', 'David Olumide', 'processing', 120000),
  // A bespoke order so the quote-builder drawer is reachable from the demo.
  sample('s8', 'ORD-256038', 'Erica Queen', 'pending', 250000, {
    type: 'bespoke',
    bespoke_quote: 's8-quote',
  }),
];

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
