import { describe, expect, it } from 'vitest';
import type { Order } from '@/redux/services/orders/orders.api-slice';
import {
  deliveryBadge,
  formatDate,
  formatLongDate,
  formatNaira,
  isCustomOrder,
  orderStatusBadge,
  readAmountPaid,
  readCustomerHandle,
  readCustomerName,
  readItemsCount,
  readOrderId,
  readOrderImage,
  readOrderItemImages,
  readOrderTitle,
  readQuoteId,
  readStatus,
  shipmentStatusBadge,
} from '../order-fields';

// The API returns partially-populated orders, so every helper is exercised with
// the holes it actually has to survive in production.
const order = (patch: Record<string, unknown> = {}): Order =>
  ({ _id: 'o1', status: 'pending', ...patch }) as unknown as Order;

describe('formatNaira', () => {
  it('formats a number with thousands separators', () => {
    expect(formatNaira(1234567)).toBe('NGN 1,234,567');
  });

  it('formats zero rather than treating it as missing', () => {
    expect(formatNaira(0)).toBe('NGN 0');
  });

  it('falls back to a dash for undefined and NaN', () => {
    expect(formatNaira(undefined)).toBe('—');
    expect(formatNaira(Number.NaN)).toBe('—');
  });
});

describe('formatDate', () => {
  it('renders DD/MM/YYYY, zero-padded', () => {
    expect(formatDate('2026-03-09T10:00:00.000Z')).toBe('09/03/2026');
  });

  it('falls back to a dash for empty/missing values', () => {
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('   ')).toBe('—');
    expect(formatDate(12345)).toBe('—');
  });

  it('echoes an unparseable string rather than printing "Invalid Date"', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatLongDate', () => {
  it('renders a human date', () => {
    expect(formatLongDate('2023-10-12T00:00:00.000Z')).toBe('12 Oct 2023');
  });

  it('falls back to a dash when missing', () => {
    expect(formatLongDate(undefined)).toBe('—');
  });
});

describe('order field readers', () => {
  it('prefers the human reference over the mongo id', () => {
    expect(readOrderId(order({ reference: 'QLZ-001' }))).toBe('QLZ-001');
    expect(readOrderId(order())).toBe('o1');
  });

  it('resolves a customer name from username, then names, then email', () => {
    expect(readCustomerName(order({ customer: { username: 'ada' } }))).toBe(
      'ada'
    );
    expect(
      readCustomerName(
        order({ customer: { firstName: 'Ada', lastName: 'Obi' } })
      )
    ).toBe('Ada Obi');
    expect(readCustomerName(order({ customer: { email: 'a@b.co' } }))).toBe(
      'a@b.co'
    );
    expect(readCustomerName(order())).toBe('—');
  });

  it('prefixes the handle with @ exactly once', () => {
    expect(readCustomerHandle(order({ customer: { username: 'ada' } }))).toBe(
      '@ada'
    );
    expect(readCustomerHandle(order({ customer: { username: '@ada' } }))).toBe(
      '@ada'
    );
  });

  it('counts items defensively when the array is missing', () => {
    expect(readItemsCount(order({ items: [{}, {}] }))).toBe(2);
    expect(readItemsCount(order())).toBe(0);
  });

  it('reads the paid total and defaults an absent status to pending', () => {
    expect(readAmountPaid(order({ total: 9000 }))).toBe(9000);
    expect(readStatus(order({ status: undefined }))).toBe('pending');
  });
});

describe('isCustomOrder', () => {
  it('is true for any of the three bespoke signals', () => {
    expect(isCustomOrder(order({ type: 'bespoke' }))).toBe(true);
    expect(isCustomOrder(order({ bespoke_design: { name: 'Agbada' } }))).toBe(
      true
    );
    expect(isCustomOrder(order({ bespoke_quote: 'q1' }))).toBe(true);
  });

  it('is false for a standard catalogue order', () => {
    expect(isCustomOrder(order({ type: 'standard', items: [{}] }))).toBe(false);
  });

  it('reads the quote id, falling back to the order id', () => {
    expect(readQuoteId(order({ bespoke_quote: 'q1' }))).toBe('q1');
    expect(readQuoteId(order())).toBe('o1');
  });
});

describe('readOrderImage', () => {
  it('prefers the kind sub-doc image over the top-level images array', () => {
    const o = order({
      items: [
        {
          product: {
            clothing: { images: [{ url: 'kind.png' }] },
            images: ['top.png'],
          },
        },
      ],
    });
    expect(readOrderImage(o)).toBe('kind.png');
  });

  it('accepts plain-string image entries', () => {
    const o = order({ items: [{ product: { images: ['top.png'] } }] });
    expect(readOrderImage(o)).toBe('top.png');
  });

  it('falls back to the bespoke design image when there is no product', () => {
    const o = order({
      type: 'bespoke',
      items: [],
      bespoke_design: { design_images: ['design.png'] },
    });
    expect(readOrderImage(o)).toBe('design.png');
  });

  it('falls back to reference images when the design has no generated images', () => {
    const o = order({
      type: 'bespoke',
      bespoke_design: { reference_images: ['ref.png'] },
    });
    expect(readOrderImage(o)).toBe('ref.png');
  });

  it('returns null when nothing is available', () => {
    expect(readOrderImage(order())).toBeNull();
  });
});

describe('readOrderItemImages', () => {
  it('collects one image per item, capped at max', () => {
    const o = order({
      items: [
        { product: { images: ['a.png'] } },
        { product: { images: ['b.png'] } },
        { product: { images: ['c.png'] } },
        { product: { images: ['d.png'] } },
      ],
    });
    expect(readOrderItemImages(o)).toEqual(['a.png', 'b.png', 'c.png']);
    expect(readOrderItemImages(o, 2)).toEqual(['a.png', 'b.png']);
  });

  it('skips items with no image at all', () => {
    const o = order({
      items: [{ product: {} }, { product: { images: ['b.png'] } }],
    });
    expect(readOrderItemImages(o)).toEqual(['b.png']);
  });

  it('falls back to the bespoke design when no item has an image', () => {
    const o = order({
      type: 'bespoke',
      items: [],
      bespoke_design: { design_images: ['design.png'] },
    });
    expect(readOrderItemImages(o)).toEqual(['design.png']);
  });

  it('returns an empty list rather than throwing when items are missing', () => {
    expect(readOrderItemImages(order())).toEqual([]);
  });
});

describe('readOrderTitle', () => {
  it('uses the kind-specific product name first', () => {
    const o = order({
      items: [{ product: { clothing: { name: 'Kaftan' }, name: 'Generic' } }],
    });
    expect(readOrderTitle(o)).toBe('Kaftan');
  });

  it('uses the bespoke design name for custom orders', () => {
    const o = order({ type: 'bespoke', bespoke_design: { name: 'Agbada' } });
    expect(readOrderTitle(o)).toBe('Agbada');
  });

  it('names an unnamed bespoke design rather than showing "Order"', () => {
    const o = order({ type: 'bespoke', bespoke_design: { design_images: [] } });
    expect(readOrderTitle(o)).toBe('Custom design');
  });

  it('falls back to "Order"', () => {
    expect(readOrderTitle(order())).toBe('Order');
  });
});

describe('status badges', () => {
  it('maps every known order status to a label', () => {
    const statuses = [
      'pending',
      'in_review',
      'processing',
      'in_transit',
      'completed',
      'cancelled',
      'returned',
    ] as const;
    for (const status of statuses) {
      const badge = orderStatusBadge(status);
      expect(badge.label).toBeTruthy();
      expect(badge.className).toBeTruthy();
    }
  });

  it('title-cases an unknown status instead of rendering undefined', () => {
    const badge = orderStatusBadge('refunded' as never);
    expect(badge.label).toBe('Refunded');
    expect(badge.className).toBeTruthy();
  });

  it('keeps deliveryBadge as an alias of orderStatusBadge', () => {
    expect(deliveryBadge('completed')).toEqual(orderStatusBadge('completed'));
  });

  it('maps every known shipment status to a label', () => {
    const statuses = [
      'pending',
      'ready_to_ship',
      'shipped',
      'in_transit',
      'delivered',
      'failed',
    ] as const;
    for (const status of statuses) {
      expect(shipmentStatusBadge(status).label).toBeTruthy();
    }
  });

  it('title-cases an unknown shipment status', () => {
    expect(shipmentStatusBadge('lost' as never).label).toBe('Lost');
  });
});
