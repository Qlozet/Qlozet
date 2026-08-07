import { describe, expect, it } from 'vitest';
import {
  cancelOrderSchema,
  fulfillOrderSchema,
  orderFilterSchema,
  orderStatusSchema,
  shipmentStatusSchema,
  validateOrderStatus,
} from '../order';

describe('status enums', () => {
  it('accepts every backend order status', () => {
    for (const status of [
      'pending',
      'in_review',
      'processing',
      'in_transit',
      'completed',
      'cancelled',
      'returned',
    ]) {
      expect(orderStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it('rejects a status the backend does not define', () => {
    expect(orderStatusSchema.safeParse('shipped').success).toBe(false);
  });

  it('accepts every backend shipment status', () => {
    for (const status of [
      'pending',
      'ready_to_ship',
      'shipped',
      'in_transit',
      'delivered',
      'failed',
    ]) {
      expect(shipmentStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(shipmentStatusSchema.safeParse('returned').success).toBe(false);
  });
});

describe('orderFilterSchema', () => {
  it('defaults to all statuses, page 1, size 10', () => {
    const result = orderFilterSchema.parse({});
    expect(result).toEqual({ status: 'all', page: 1, size: 10 });
  });

  // The values arrive from URL search params, so they're strings.
  it('coerces numeric strings from the query string', () => {
    expect(orderFilterSchema.parse({ page: '3', size: '25' })).toMatchObject({
      page: 3,
      size: 25,
    });
  });

  it('rejects a page below 1 and a size above the API cap', () => {
    expect(orderFilterSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(orderFilterSchema.safeParse({ size: 101 }).success).toBe(false);
    expect(orderFilterSchema.safeParse({ size: 100 }).success).toBe(true);
  });

  it('rejects a fractional page', () => {
    expect(orderFilterSchema.safeParse({ page: 1.5 }).success).toBe(false);
  });
});

describe('action schemas', () => {
  // The backend keys these off `reference`, not the mongo id.
  it('requires an order reference to cancel or fulfill', () => {
    expect(cancelOrderSchema.safeParse({ reference: 'QLZ-1' }).success).toBe(true);
    expect(cancelOrderSchema.safeParse({ reference: '' }).success).toBe(false);
    expect(fulfillOrderSchema.safeParse({ reference: 'QLZ-1' }).success).toBe(true);
    expect(fulfillOrderSchema.safeParse({}).success).toBe(false);
  });

  it('allows optional courier details on fulfill', () => {
    expect(
      fulfillOrderSchema.safeParse({
        reference: 'QLZ-1',
        courier_id: 'c1',
        service_code: 's1',
      }).success
    ).toBe(true);
  });
});

describe('validateOrderStatus', () => {
  it('allows the documented forward transitions', () => {
    expect(validateOrderStatus('pending', 'in_review')).toBe(true);
    expect(validateOrderStatus('in_review', 'processing')).toBe(true);
    expect(validateOrderStatus('processing', 'in_transit')).toBe(true);
    expect(validateOrderStatus('in_transit', 'completed')).toBe(true);
  });

  it('allows cancelling up to dispatch, but not after', () => {
    expect(validateOrderStatus('pending', 'cancelled')).toBe(true);
    expect(validateOrderStatus('processing', 'cancelled')).toBe(true);
    expect(validateOrderStatus('in_transit', 'cancelled')).toBe(false);
  });

  it('refuses to skip a step or move backwards', () => {
    expect(validateOrderStatus('pending', 'completed')).toBe(false);
    expect(validateOrderStatus('completed', 'processing')).toBe(false);
  });

  it('treats cancelled and returned as terminal', () => {
    expect(validateOrderStatus('cancelled', 'pending')).toBe(false);
    expect(validateOrderStatus('returned', 'completed')).toBe(false);
  });

  it('returns false rather than throwing for an unknown status', () => {
    expect(validateOrderStatus('nonsense', 'pending')).toBe(false);
  });
});
