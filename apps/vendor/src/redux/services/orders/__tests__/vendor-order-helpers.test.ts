// GET /orders/vendor returns the WHOLE order — including other vendors' items
// and shipments. Every figure a vendor sees is filtered client-side by these
// helpers, so a mistake here shows one vendor another vendor's money.

import { describe, expect, it } from 'vitest';
import type { Order } from '../orders.api-slice';
import {
  extractBizName,
  extractFabricName,
  getFabricTransferShipments,
  getIncomingFabricTransfers,
  getOrderGoodsSubtotal,
  getPendingIncomingFabricTransfers,
  getVendorItems,
  getVendorShipment,
  getVendorSubtotal,
} from '../orders.api-slice';

const ME = 'biz-me';
const THEM = 'biz-them';

const order = (patch: Record<string, unknown> = {}): Order =>
  ({ _id: 'o1', items: [], shipments: [], ...patch }) as unknown as Order;

describe('getVendorItems', () => {
  it('keeps only this vendor’s items', () => {
    const o = order({
      items: [
        { business: ME, total_price: 100 },
        { business: THEM, total_price: 900 },
      ],
    });
    expect(getVendorItems(o, ME)).toHaveLength(1);
    expect(getVendorItems(o, ME)[0].total_price).toBe(100);
  });

  it('matches a populated business object by _id', () => {
    const o = order({ items: [{ business: { _id: ME, business_name: 'Mine' } }] });
    expect(getVendorItems(o, ME)).toHaveLength(1);
  });

  it('returns nothing when none of the items are this vendor’s', () => {
    expect(getVendorItems(order({ items: [{ business: THEM }] }), ME)).toHaveLength(0);
    expect(getVendorItems(order({ items: [{}] }), ME)).toHaveLength(0);
  });
});

describe('getVendorShipment', () => {
  it('finds this vendor’s shipment among several', () => {
    const o = order({
      shipments: [
        { _id: 's1', business: THEM },
        { _id: 's2', business: ME },
      ],
    });
    expect(getVendorShipment(o, ME)?._id).toBe('s2');
  });

  it('matches a populated business object', () => {
    const o = order({ shipments: [{ _id: 's1', business: { _id: ME } }] });
    expect(getVendorShipment(o, ME)?._id).toBe('s1');
  });

  it('returns undefined when there is none, or no shipments at all', () => {
    expect(getVendorShipment(order({ shipments: [{ business: THEM }] }), ME)).toBeUndefined();
    expect(getVendorShipment(order({ shipments: undefined }), ME)).toBeUndefined();
  });
});

describe('subtotals', () => {
  it('sums only this vendor’s items', () => {
    const o = order({
      items: [
        { business: ME, total_price: 1000 },
        { business: ME, total_price: 500 },
        { business: THEM, total_price: 9000 },
      ],
    });
    expect(getVendorSubtotal(o, ME)).toBe(1500);
  });

  it('falls back to summing selections when total_price is missing', () => {
    const o = order({
      items: [
        {
          business: ME,
          fabric_selections: [{ total_amount: 300, quantity: 1 }],
          style_selections: [{ total_amount: 200, quantity: 1 }],
          accessory_selections: [{ total_amount: 100, quantity: 1 }],
          addon_selections: [{ total_amount: 50, quantity: 1 }],
          color_variant_selections: [{ total_amount: 25, quantity: 1 }],
        },
      ],
    });
    expect(getVendorSubtotal(o, ME)).toBe(675);
  });

  it('prefers total_price over the selection sum when both are present', () => {
    const o = order({
      items: [
        {
          business: ME,
          total_price: 1000,
          fabric_selections: [{ total_amount: 300, quantity: 1 }],
        },
      ],
    });
    expect(getVendorSubtotal(o, ME)).toBe(1000);
  });

  it('is zero when the vendor has no items on the order', () => {
    expect(getVendorSubtotal(order({ items: [{ business: THEM, total_price: 9000 }] }), ME)).toBe(0);
  });

  // This is the denominator used to allocate order-wide earnings to one vendor,
  // so it must span every vendor's items — not just the caller's.
  it('sums across all vendors for the order-wide goods subtotal', () => {
    const o = order({
      items: [
        { business: ME, total_price: 1000 },
        { business: THEM, total_price: 9000 },
      ],
    });
    expect(getOrderGoodsSubtotal(o)).toBe(10000);
    expect(getOrderGoodsSubtotal(order({ items: undefined }))).toBe(0);
  });
});

describe('fabric transfers', () => {
  const withTransfers = () =>
    order({
      shipments: [
        // Ordinary vendor shipment — never a fabric transfer.
        { _id: 'ship', business: ME, status: 'pending' },
        // I am the fabric vendor sending to a tailor.
        {
          _id: 'out',
          shipment_type: 'fabric_transfer',
          business: ME,
          destination_business: THEM,
          status: 'shipped',
        },
        // A tailor's transfer that has nothing to do with me.
        {
          _id: 'other',
          shipment_type: 'fabric_transfer',
          business: THEM,
          destination_business: 'biz-third',
          status: 'shipped',
        },
        // Incoming, still on its way.
        {
          _id: 'in-pending',
          shipment_type: 'fabric_transfer',
          business: THEM,
          destination_business: ME,
          status: 'in_transit',
        },
        // Incoming and already received.
        {
          _id: 'in-delivered',
          shipment_type: 'fabric_transfer',
          business: THEM,
          destination_business: ME,
          status: 'delivered',
        },
      ],
    });

  it('lists only the transfers this vendor is sending', () => {
    expect(getFabricTransferShipments(withTransfers(), ME).map((s) => s._id)).toEqual([
      'out',
    ]);
  });

  it('lists every incoming transfer regardless of status', () => {
    expect(getIncomingFabricTransfers(withTransfers(), ME).map((s) => s._id)).toEqual([
      'in-pending',
      'in-delivered',
    ]);
  });

  // Fulfillment is blocked while any of these are outstanding, so a delivered
  // transfer must drop out or the vendor is stuck.
  it('counts only undelivered transfers as pending', () => {
    expect(
      getPendingIncomingFabricTransfers(withTransfers(), ME).map((s) => s._id)
    ).toEqual(['in-pending']);
  });

  it('returns empty lists when the order has no shipments', () => {
    const empty = order({ shipments: undefined });
    expect(getFabricTransferShipments(empty, ME)).toEqual([]);
    expect(getIncomingFabricTransfers(empty, ME)).toEqual([]);
    expect(getPendingIncomingFabricTransfers(empty, ME)).toEqual([]);
  });
});

describe('relation name extractors', () => {
  it('reads a business name when populated', () => {
    expect(extractBizName({ _id: THEM, business_name: 'Tailor Co' })).toBe('Tailor Co');
  });

  it('does not print a raw id as a business name', () => {
    expect(extractBizName(THEM)).not.toBe(THEM);
    expect(extractBizName(undefined)).toBeTruthy();
  });

  it('reads a fabric name when populated, and stays neutral otherwise', () => {
    expect(extractFabricName({ fabric: { name: 'Ankara' } } as never)).toBe('Ankara');
    expect(extractFabricName('fabric-1')).not.toBe('fabric-1');
    expect(extractFabricName(undefined)).toBeTruthy();
  });
});
