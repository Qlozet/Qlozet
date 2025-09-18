// Settings Validation Schemas
// Zod validation schemas for settings forms

import { z } from 'zod';

// Company Details Schema
export const companyDetailsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  nin: z.string().optional(),
  bvn: z.string().optional(),
  logo: z.array(z.string()).optional(),
  cacDocs: z.array(z.string()).optional(),
});

// Billing and Invoice Schema
export const billingInvoiceSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  billingAddress: z.string().min(1, 'Billing address is required'),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  bankAccount: z.string().optional(),
  invoiceTemplate: z.string().optional(),
});

// Warehouse Schema
export const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  address: z.string().min(1, 'Warehouse address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional(),
});

// User Permission Schema
export const userPermissionSchema = z.object({
  name: z.string().min(1, 'User name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  permissions: z
    .array(z.string())
    .min(1, 'At least one permission is required'),
  isActive: z.boolean().optional(),
});

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentCategory: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

// Order Settings Schema
export const orderSettingsSchema = z.object({
  autoConfirm: z.boolean(),
  maxOrderItems: z.number().min(1, 'Max order items must be at least 1'),
  orderTimeout: z.number().min(1, 'Order timeout must be at least 1 minute'),
  allowBackorders: z.boolean(),
  requireSignature: z.boolean(),
  sendNotifications: z.boolean(),
  defaultShippingMethod: z.string().optional(),
});

// Type exports
export type CompanyDetailsData = z.infer<typeof companyDetailsSchema>;
export type BillingInvoiceData = z.infer<typeof billingInvoiceSchema>;
export type WarehouseData = z.infer<typeof warehouseSchema>;
export type UserPermissionData = z.infer<typeof userPermissionSchema>;
export type CategoryData = z.infer<typeof categorySchema>;
export type OrderSettingsData = z.infer<typeof orderSettingsSchema>;
