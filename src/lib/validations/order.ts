// Order Validation Schemas - Zod
// Validation schemas for order-related forms and data

import { z } from 'zod';
import { addressSchema } from './customer';

// Order Item Schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(9999, 'Quantity is too large'),
  price: z.coerce
    .number()
    .min(0, 'Price cannot be negative')
    .max(999999.99, 'Price is too large'),
  total: z.coerce.number().min(0, 'Total cannot be negative'),
  variant: z
    .object({
      size: z.string().max(50, 'Size is too long').optional(),
      color: z.string().max(50, 'Color is too long').optional(),
      material: z.string().max(100, 'Material is too long').optional(),
    })
    .optional(),
  customizations: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, 'Customization name is required')
          .max(100, 'Name is too long'),
        value: z
          .string()
          .min(1, 'Customization value is required')
          .max(200, 'Value is too long'),
        additionalPrice: z.coerce
          .number()
          .min(0, 'Additional price cannot be negative')
          .max(9999.99, 'Additional price is too large')
          .default(0),
      })
    )
    .optional(),
});

// Shipping Address Schema (extends address schema with name and phone)
export const shippingAddressSchema = addressSchema.extend({
  name: z
    .string()
    .min(1, 'Recipient name is required')
    .max(100, 'Name is too long'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
});

// Order Status Schema
export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'return',
]);

// Payment Status Schema
export const paymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded',
]);

// Base Order Schema
const orderBaseSchema = z.object({
  orderNumber: z
    .string()
    .min(1, 'Order number is required')
    .max(50, 'Order number is too long'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z
    .string()
    .min(1, 'Customer name is required')
    .max(100, 'Name is too long'),
  customerEmail: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  subtotal: z.coerce.number().min(0, 'Subtotal cannot be negative'),
  tax: z.coerce.number().min(0, 'Tax cannot be negative').default(0),
  shipping: z.coerce.number().min(0, 'Shipping cannot be negative').default(0),
  discount: z.coerce.number().min(0, 'Discount cannot be negative').default(0),
  total: z.coerce.number().min(0, 'Total cannot be negative'),
  status: orderStatusSchema.default('pending'),
  paymentStatus: paymentStatusSchema.default('pending'),
  paymentMethod: z
    .string()
    .min(1, 'Payment method is required')
    .max(50, 'Payment method is too long'),
  shippingAddress: shippingAddressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

// Create Order Schema
export const createOrderSchema = orderBaseSchema
  .omit({
    orderNumber: true,
    customerName: true,
    customerEmail: true,
    subtotal: true,
    total: true,
    status: true,
    paymentStatus: true,
  })
  .extend({
    // Override items to not require productName and total (will be calculated)
    items: z
      .array(orderItemSchema.omit({ productName: true, total: true }))
      .min(1, 'At least one item is required'),
  });

// Update Order Schema
export const updateOrderSchema = z
  .object({
    _id: z.string().min(1, 'Order ID is required'),
    status: orderStatusSchema.optional(),
    paymentStatus: paymentStatusSchema.optional(),
    shippingAddress: shippingAddressSchema.optional(),
    billingAddress: addressSchema.optional(),
    notes: z.string().max(1000, 'Notes are too long').optional(),
  })
  .partial()
  .required({ _id: true });

// Order Filter/Search Schema
export const orderFilterSchema = z.object({
  search: z.string().max(255, 'Search term is too long').optional(),
  status: orderStatusSchema.or(z.literal('all')).default('all'),
  paymentStatus: paymentStatusSchema.or(z.literal('all')).default('all'),
  dateRange: z
    .object({
      startDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
      endDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
    })
    .optional(),
  sortBy: z
    .enum(['orderNumber', 'customerName', 'total', 'createdAt', 'status'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Cancel Order Schema
export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.string().max(500, 'Reason is too long').optional(),
});

// Return Order Schema
export const returnOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.coerce
          .number()
          .int('Quantity must be a whole number')
          .min(1, 'Quantity must be at least 1'),
        reason: z
          .string()
          .min(1, 'Reason is required')
          .max(500, 'Reason is too long'),
      })
    )
    .min(1, 'At least one item must be selected for return'),
  refundAmount: z.coerce
    .number()
    .min(0, 'Refund amount cannot be negative')
    .max(999999.99, 'Refund amount is too large'),
});

// Bulk Update Orders Schema
export const orderBulkUpdateSchema = z.object({
  orderIds: z
    .array(z.string().min(1, 'Invalid order ID'))
    .min(1, 'At least one order must be selected'),
  updates: z
    .object({
      status: orderStatusSchema.optional(),
      paymentStatus: paymentStatusSchema.optional(),
    })
    .refine(
      (updates) => Object.keys(updates).length > 0,
      'At least one field must be updated'
    ),
});

// Order Report Schema
export const orderReportSchema = z.object({
  format: z.enum(['pdf', 'csv', 'xlsx']).default('pdf'),
  dateRange: z
    .object({
      startDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
      endDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
    })
    .optional(),
  status: z.array(orderStatusSchema).optional(),
  includeItems: z.boolean().default(true),
});

// Quick Order Schema (for simple order creation)
export const quickOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity is too large'),
  variant: orderItemSchema.shape.variant.optional(),
  customizations: orderItemSchema.shape.customizations.optional(),
  useCustomerDefaultAddress: z.boolean().default(true),
  shippingAddress: shippingAddressSchema.optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

// Type exports
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type UpdateOrderData = z.infer<typeof updateOrderSchema>;
export type OrderFilterData = z.infer<typeof orderFilterSchema>;
export type CancelOrderData = z.infer<typeof cancelOrderSchema>;
export type ReturnOrderData = z.infer<typeof returnOrderSchema>;
export type OrderBulkUpdateData = z.infer<typeof orderBulkUpdateSchema>;
export type OrderReportData = z.infer<typeof orderReportSchema>;
export type QuickOrderData = z.infer<typeof quickOrderSchema>;
export type OrderItemData = z.infer<typeof orderItemSchema>;
export type ShippingAddressData = z.infer<typeof shippingAddressSchema>;

// Default values
export const createDefaultOrderData = (): Partial<CreateOrderData> => ({
  customerId: '',
  items: [],
  tax: 0,
  shipping: 0,
  discount: 0,
  paymentMethod: '',
  shippingAddress: {
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  },
  notes: '',
});

export const createDefaultOrderFilterData = (): OrderFilterData => ({
  search: '',
  status: 'all',
  paymentStatus: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
});

export const createDefaultOrderItem = (): Partial<OrderItemData> => ({
  productId: '',
  productName: '',
  quantity: 1,
  price: 0,
  total: 0,
  variant: {},
  customizations: [],
});

// Validation helpers
export const calculateOrderTotal = (
  items: OrderItemData[],
  tax = 0,
  shipping = 0,
  discount = 0
): number => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return subtotal + tax + shipping - discount;
};

export const validateOrderItems = (items: OrderItemData[]): boolean => {
  return (
    items.length > 0 &&
    items.every(
      (item) =>
        item.productId &&
        item.quantity > 0 &&
        item.price >= 0 &&
        item.total >= 0
    )
  );
};

export const validateOrderStatus = (
  currentStatus: string,
  newStatus: string
): boolean => {
  const statusFlow = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'return'],
    delivered: ['return'],
    cancelled: [],
    return: [],
  };

  return (
    statusFlow[currentStatus as keyof typeof statusFlow]?.includes(newStatus) ||
    false
  );
};
