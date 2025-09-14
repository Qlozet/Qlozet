// Customer Validation Schemas - Zod
// Validation schemas for customer-related forms and data

import { z } from 'zod';

// Address Schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(200, 'Street address is too long'),
  city: z.string().min(1, 'City is required').max(100, 'City name is too long'),
  state: z.string().min(1, 'State is required').max(100, 'State name is too long'),
  zipCode: z.string()
    .min(1, 'ZIP code is required')
    .regex(/^[0-9]{5}(?:-[0-9]{4})?$/, 'Invalid ZIP code format'),
  country: z.string().min(1, 'Country is required').max(100, 'Country name is too long'),
});

// Optional Address Schema (for billing address, etc.)
export const optionalAddressSchema = addressSchema.partial();

// Customer Base Schema
const customerBaseSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s.-]+$/, 'Name can only contain letters, spaces, dots, and hyphens'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
    
  address: addressSchema.optional(),
});

// Create Customer Schema
export const createCustomerSchema = customerBaseSchema.extend({
  status: z.enum(['active', 'inactive']).default('active'),
});

// Update Customer Schema  
export const updateCustomerSchema = customerBaseSchema.extend({
  _id: z.string().min(1, 'Customer ID is required'),
  status: z.enum(['active', 'inactive']).optional(),
}).partial().required({ _id: true });

// Customer Search/Filter Schema
export const customerFilterSchema = z.object({
  search: z.string().max(255, 'Search term is too long').optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  sortBy: z.enum(['name', 'email', 'createdAt', 'totalSpent']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Customer Import Schema
export const customerImportSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type),
      'File must be a CSV or Excel file'
    ),
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
});

// Customer Export Schema
export const customerExportSchema = z.object({
  format: z.enum(['csv', 'xlsx']).default('csv'),
  filters: z.object({
    status: z.enum(['active', 'inactive', 'all']).default('all'),
    dateRange: z.object({
      startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
      endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
    }).optional(),
  }).optional(),
});

// Customer Bulk Update Schema
export const customerBulkUpdateSchema = z.object({
  customerIds: z.array(z.string().min(1, 'Invalid customer ID')).min(1, 'At least one customer must be selected'),
  updates: z.object({
    status: z.enum(['active', 'inactive']).optional(),
  }).refine((updates) => Object.keys(updates).length > 0, 'At least one field must be updated'),
});

// Type exports
export type CreateCustomerData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;
export type CustomerFilterData = z.infer<typeof customerFilterSchema>;
export type CustomerImportData = z.infer<typeof customerImportSchema>;
export type CustomerExportData = z.infer<typeof customerExportSchema>;
export type CustomerBulkUpdateData = z.infer<typeof customerBulkUpdateSchema>;
export type AddressData = z.infer<typeof addressSchema>;

// Default values
export const createDefaultCustomerData = (): CreateCustomerData => ({
  name: '',
  email: '',
  phone: '',
  status: 'active',
  address: undefined,
});

export const createDefaultCustomerFilterData = (): CustomerFilterData => ({
  search: '',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
});

// Validation helpers
export const validateEmail = (email: string): boolean => {
  try {
    z.string().email().parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  try {
    z.string().regex(/^\+?[1-9]\d{1,14}$/).parse(phone);
    return true;
  } catch {
    return false;
  }
};