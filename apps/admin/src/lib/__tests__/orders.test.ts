import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AdminOrder,
  AdminOrderItem,
} from '@/redux/services/orders/orders.api-slice';
import {
  ORDER_PERIOD_OPTIONS,
  ORDER_STATUS_OPTIONS,
  computeOrderMetrics,
  filterOrdersByPeriod,
  formatItemsCount,
  formatNaira,
  formatOrderDate,
  orderStatusBadge,
  periodStartDate,
  readAmountPaid,
  readCustomerName,
  readFirstProductName,
  readItemImage,
  readItemName,
  readItemPricing,
  readItemsCount,
  readOrderId,
  readPaymentStatus,
  readProductPrice,
  readRefundStatus,
  readStatus,
  searchOrders,
} from '../orders';

const order = (patch: Record<string, unknown> = {}): AdminOrder =>
  ({ _id: 'o1', ...patch }) as unknown as AdminOrder;

const item = (patch: Record<string, unknown> = {}): AdminOrderItem =>
  patch as unknown as AdminOrderItem;

afterEach(() => {
  vi.useRealTimers();
});

describe('formatters', () => {
  it('formats money, including zero', () => {
    expect(formatNaira(180000)).toBe('NGN 180,000');
    expect(formatNaira(0)).toBe('NGN 0');
  });

  it('dashes non-numeric money rather than printing NaN', () => {
    expect(formatNaira(undefined)).toBe('—');
    expect(formatNaira('180000')).toBe('—');
    expect(formatNaira(Number.NaN)).toBe('—');
  });

  it('formats an order date as zero-padded DD/MM/YYYY', () => {
    expect(formatOrderDate('2026-03-09T10:00:00.000Z')).toBe('09/03/2026');
  });

  it('echoes an unparseable date and dashes a missing one', () => {
    expect(formatOrderDate('soon')).toBe('soon');
    expect(formatOrderDate(undefined)).toBe('—');
    expect(formatOrderDate('  ')).toBe('—');
  });

  it('pluralises the item count', () => {
    expect(formatItemsCount(1)).toBe('1 item');
    expect(formatItemsCount(0)).toBe('0 items');
    expect(formatItemsCount(3)).toBe('3 items');
  });
});

describe('field readers', () => {
  it('prefers the reference over the id', () => {
    expect(readOrderId(order({ reference: 'QLZ-9' }))).toBe('QLZ-9');
    expect(readOrderId(order())).toBe('o1');
  });

  it('resolves the customer name across the shapes the API sends', () => {
    expect(readCustomerName(order({ customer: { username: 'ada' } }))).toBe('ada');
    expect(
      readCustomerName(order({ customer: { firstName: 'Ada', lastName: 'Obi' } }))
    ).toBe('Ada Obi');
    expect(readCustomerName(order({ customer: { email: 'a@b.co' } }))).toBe('a@b.co');
  });

  it('dashes an unpopulated customer reference', () => {
    expect(readCustomerName(order({ customer: 'cust-1' }))).toBe('—');
    expect(readCustomerName(order())).toBe('—');
  });

  it('reads counts and money defensively', () => {
    expect(readItemsCount(order({ items: [{}, {}] }))).toBe(2);
    expect(readItemsCount(order())).toBe(0);
    expect(readProductPrice(order({ subtotal: 100 }))).toBe(100);
    expect(readProductPrice(order({ subtotal: '100' }))).toBeUndefined();
    expect(readAmountPaid(order({ total: 120 }))).toBe(120);
    expect(readAmountPaid(order())).toBeUndefined();
  });

  it('defaults a blank status to pending', () => {
    expect(readStatus(order({ status: 'completed' }))).toBe('completed');
    expect(readStatus(order({ status: '   ' }))).toBe('pending');
    expect(readStatus(order())).toBe('pending');
  });

  it('reads the first product name from the kind sub-doc', () => {
    expect(
      readFirstProductName(
        order({ items: [{ product: { clothing: { name: 'Kaftan' } } }] })
      )
    ).toBe('Kaftan');
    expect(
      readFirstProductName(order({ items: [{ product: 'prod-1' }] }))
    ).toBeUndefined();
    expect(readFirstProductName(order())).toBeUndefined();
  });

  it('returns undefined for an absent payment status instead of a guess', () => {
    expect(readPaymentStatus(order({ payment_status: 'paid' }))).toBe('paid');
    expect(readPaymentStatus(order({ payment_status: ' ' }))).toBeUndefined();
    expect(readPaymentStatus(order())).toBeUndefined();
  });

  it('derives a refund status from the boolean when the string is absent', () => {
    expect(readRefundStatus(order({ refund_status: 'partial' }))).toBe('partial');
    expect(readRefundStatus(order({ refunded: true }))).toBe('Refunded');
    expect(readRefundStatus(order({ refunded: false }))).toBe('Not refunded');
    expect(readRefundStatus(order())).toBeUndefined();
  });
});

describe('readItemPricing', () => {
  it('prefers the frozen pricing snapshot over total_price', () => {
    const pricing = readItemPricing(
      item({ total_price: 999, pricing: { final: 1200 } })
    );
    expect(pricing.final).toBe(1200);
  });

  it('falls back to total_price on orders that predate the snapshot', () => {
    expect(readItemPricing(item({ total_price: 999 })).final).toBe(999);
  });

  it('exposes a discount and the struck-through original', () => {
    const pricing = readItemPricing(
      item({ pricing: { final: 800, discount: 200, before_discount: 1000 } })
    );
    expect(pricing).toMatchObject({ final: 800, discount: 200, original: 1000 });
  });

  // A "discount" that leaves the price unchanged would render a struck-through
  // price identical to the charged one, implying a saving that never happened.
  it('hides the original when it equals what was charged', () => {
    const pricing = readItemPricing(
      item({ pricing: { final: 1000, discount: 200, before_discount: 1000 } })
    );
    expect(pricing.original).toBeUndefined();
  });

  it('ignores a zero or negative discount', () => {
    expect(
      readItemPricing(item({ pricing: { final: 1000, discount: 0, before_discount: 1200 } }))
    ).toMatchObject({ discount: undefined, original: undefined });
  });

  it('sums quantities across every selection array', () => {
    const pricing = readItemPricing(
      item({
        color_variant_selections: [{ quantity: 1 }],
        fabric_selections: [{ quantity: 2 }],
        style_selections: [{ quantity: 3 }],
        accessory_selections: [{ quantity: 4 }],
        addon_selections: [{ quantity: 5 }],
      })
    );
    expect(pricing.quantity).toBe(15);
  });

  it('falls back to the item quantity when no selections carry one', () => {
    expect(readItemPricing(item({ quantity: 7 })).quantity).toBe(7);
    expect(readItemPricing(item({})).quantity).toBe(0);
  });
});

describe('item name + image', () => {
  it('names an item from its kind sub-doc, then the product, then a default', () => {
    expect(readItemName(item({ product: { fabric: { name: 'Ankara' } } }))).toBe('Ankara');
    expect(readItemName(item({ product: { name: 'Thing' } }))).toBe('Thing');
    expect(readItemName(item({ product: 'prod-1' }))).toBe('Product');
    expect(readItemName(item({}))).toBe('Product');
  });

  it('prefers the kind image, then top-level images, in either shape', () => {
    expect(
      readItemImage(
        item({
          product: { clothing: { images: [{ url: 'kind.png' }] }, images: ['top.png'] },
        })
      )
    ).toBe('kind.png');
    expect(readItemImage(item({ product: { images: ['top.png'] } }))).toBe('top.png');
    expect(readItemImage(item({ product: { images: [{ url: 'top.png' }] } }))).toBe(
      'top.png'
    );
    expect(readItemImage(item({ product: {} }))).toBeNull();
    expect(readItemImage(item({}))).toBeNull();
  });
});

describe('orderStatusBadge', () => {
  it('maps the known statuses', () => {
    expect(orderStatusBadge('completed').label).toBe('Successful');
    expect(orderStatusBadge('in_transit').label).toBe('Out for delivery');
    expect(orderStatusBadge('cancelled').label).toBe('Rejected');
  });

  it('humanises an unknown status rather than rendering the raw key', () => {
    const badge = orderStatusBadge('awaiting_pickup');
    expect(badge.label).toBe('Awaiting Pickup');
    expect(badge.className).toBeTruthy();
  });

  it('exposes filter options that all carry a label', () => {
    expect(ORDER_STATUS_OPTIONS.length).toBeGreaterThan(0);
    for (const option of ORDER_STATUS_OPTIONS) {
      expect(option.label).toBeTruthy();
      expect(option.value).toBeTruthy();
    }
  });
});

describe('period filter', () => {
  // Wednesday 11 March 2026, 15:30 local time.
  const now = new Date(2026, 2, 11, 15, 30);

  it('starts the week on Monday', () => {
    const start = periodStartDate('week', now)!;
    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(9);
    expect(start.getHours()).toBe(0);
  });

  it('rolls a Sunday back to the previous Monday', () => {
    const sunday = new Date(2026, 2, 15, 12, 0);
    expect(periodStartDate('week', sunday)!.getDate()).toBe(9);
  });

  it('starts the month and the year on their first day', () => {
    expect(periodStartDate('month', now)!.getDate()).toBe(1);
    const year = periodStartDate('year', now)!;
    expect(year.getMonth()).toBe(0);
    expect(year.getDate()).toBe(1);
  });

  it('has no lower bound for all time', () => {
    expect(periodStartDate('all', now)).toBeUndefined();
  });

  it('offers every period as a labelled option', () => {
    expect(ORDER_PERIOD_OPTIONS.map((o) => o.value)).toEqual([
      'week',
      'month',
      'year',
      'all',
    ]);
  });

  it('filters orders to the period', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const orders = [
      order({ _id: 'this-month', createdAt: new Date(2026, 2, 10).toISOString() }),
      order({ _id: 'last-month', createdAt: new Date(2026, 1, 10).toISOString() }),
    ];

    expect(filterOrdersByPeriod(orders, 'month').map((o) => o._id)).toEqual([
      'this-month',
    ]);
    expect(filterOrdersByPeriod(orders, 'all')).toHaveLength(2);
  });

  it('drops orders with a missing or unparseable date when a period is set', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const orders = [order({ createdAt: undefined }), order({ createdAt: 'soon' })];
    expect(filterOrdersByPeriod(orders, 'year')).toHaveLength(0);
  });
});

describe('searchOrders', () => {
  const orders = [
    order({
      reference: 'QLZ-001',
      customer: { username: 'ada' },
      status: 'completed',
      items: [{ product: { clothing: { name: 'Kaftan' } } }],
    }),
    order({
      reference: 'QLZ-002',
      customer: { username: 'bola' },
      status: 'pending',
      items: [{ product: { clothing: { name: 'Ankara Gown' } } }],
    }),
  ];

  it('returns everything for a blank term', () => {
    expect(searchOrders(orders, '')).toHaveLength(2);
    expect(searchOrders(orders, '   ')).toHaveLength(2);
  });

  it('matches on reference, customer, product and status label — case-insensitively', () => {
    expect(searchOrders(orders, 'qlz-002')).toHaveLength(1);
    expect(searchOrders(orders, 'ADA')).toHaveLength(1);
    expect(searchOrders(orders, 'ankara')).toHaveLength(1);
    // "completed" renders as "Successful", so that's what a user would type.
    expect(searchOrders(orders, 'successful')).toHaveLength(1);
  });

  it('returns nothing when there is no match', () => {
    expect(searchOrders(orders, 'zzz')).toHaveLength(0);
  });
});

describe('computeOrderMetrics', () => {
  it('counts totals, delivered and in-transit orders', () => {
    const metrics = computeOrderMetrics([
      order({ status: 'completed' }),
      order({ status: 'completed' }),
      order({ status: 'in_transit' }),
      order({ status: 'pending' }),
    ]);
    expect(metrics).toMatchObject({ total: 4, delivered: 2, inTransit: 1 });
  });

  it('picks the most frequently ordered product', () => {
    const withProduct = (name: string) =>
      order({ items: [{ product: { clothing: { name } } }] });
    const metrics = computeOrderMetrics([
      withProduct('Kaftan'),
      withProduct('Kaftan'),
      withProduct('Cap'),
    ]);
    expect(metrics.mostPurchased).toBe('Kaftan');
  });

  it('leaves mostPurchased undefined when no product is populated', () => {
    expect(computeOrderMetrics([order({ items: [] })]).mostPurchased).toBeUndefined();
  });

  it('handles an empty list', () => {
    expect(computeOrderMetrics([])).toEqual({
      total: 0,
      delivered: 0,
      inTransit: 0,
      mostPurchased: undefined,
    });
  });
});
