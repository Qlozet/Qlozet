// Order Validation Schemas - Zod (Reconciled with Qlozet Backend)
// Only schemas needed for vendor operations are kept.

import { z } from 'zod';

// Order Status Schema — matches backend OrderStatus enum
export const orderStatusSchema = z.enum([
  'pending',
  'in_review',
  'processing',
  'in_transit',
  'completed',
  'cancelled',
  'returned',
]);

// Shipment Status Schema — matches backend ShipmentStatus enum
export const shipmentStatusSchema = z.enum([
  'pending',
  'ready_to_ship',
  'shipped',
  'in_transit',
  'delivered',
  'failed',
]);

// Order Filter/Search Schema — the vendor list supports page/size/status
export const orderFilterSchema = z.object({
  status: orderStatusSchema.or(z.literal('all')).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

// Cancel Order Schema — uses `reference` not `orderId`
export const cancelOrderSchema = z.object({
  reference: z.string().min(1, 'Order reference is required'),
});

// Fulfill Order Schema
export const fulfillOrderSchema = z.object({
  reference: z.string().min(1, 'Order reference is required'),
  courier_id: z.string().optional(),
  service_code: z.string().optional(),
});

// Type exports
export type OrderFilterData = z.infer<typeof orderFilterSchema>;
export type CancelOrderData = z.infer<typeof cancelOrderSchema>;
export type FulfillOrderData = z.infer<typeof fulfillOrderSchema>;

// Validation helpers
export const validateOrderStatus = (
  currentStatus: string,
  newStatus: string
): boolean => {
  // Vendors cannot change order status directly — the backend manages this.
  // This is kept for reference only.
  const statusFlow: Record<string, string[]> = {
    pending: ['in_review', 'cancelled'],
    in_review: ['processing', 'cancelled'],
    processing: ['in_transit', 'cancelled'],
    in_transit: ['completed', 'returned'],
    completed: ['returned'],
    cancelled: [],
    returned: [],
  };

  return statusFlow[currentStatus]?.includes(newStatus) || false;
};
