import { z } from "zod";

// Product variant schema
export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  additionalPrice: z.number().min(0, "Additional price cannot be negative").default(0),
  stock: z.number().min(0, "Stock cannot be negative").optional(),
});

// Product customization schema
export const productCustomizationSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Customization name is required")
    .max(100, "Customization name cannot exceed 100 characters"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(1, "At least one option is required")
    .max(20, "Cannot have more than 20 options"),
  additionalPrice: z.number().min(0, "Additional price cannot be negative").default(0),
});

// Basic product schema for form validation
export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_.,()&]+$/, "Product name contains invalid characters"),
  
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  
  category: z
    .string()
    .min(1, "Category is required"),
  
  price: z
    .number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price cannot exceed $999,999.99")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Price cannot have more than 2 decimal places",
    }),
  
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(999999, "Stock cannot exceed 999,999"),
  
  status: z.enum(["active", "draft", "inactive"], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status",
  }),
  
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Cannot have more than 10 images"),
  
  tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
    .max(10, "Cannot have more than 10 tags")
    .optional()
    .default([]),
});

// Extended product schema with variants and customizations
export const completeProductSchema = productFormSchema.extend({
  variants: z
    .array(productVariantSchema)
    .max(50, "Cannot have more than 50 variants")
    .optional()
    .default([])
    .refine(
      (variants) => {
        if (!variants || variants.length === 0) return true;
        // Check for duplicate variants (same size, color, material combination)
        const uniqueVariants = new Set();
        for (const variant of variants) {
          const key = `${variant.size || ''}-${variant.color || ''}-${variant.material || ''}`;
          if (uniqueVariants.has(key) && key !== '--') {
            return false;
          }
          uniqueVariants.add(key);
        }
        return true;
      },
      {
        message: "Duplicate variants are not allowed",
      }
    ),
  
  customizations: z
    .array(productCustomizationSchema)
    .max(20, "Cannot have more than 20 customizations")
    .optional()
    .default([])
    .refine(
      (customizations) => {
        if (!customizations || customizations.length === 0) return true;
        // Check for duplicate customization names
        const names = customizations.map(c => c.name.toLowerCase().trim());
        return names.length === new Set(names).size;
      },
      {
        message: "Duplicate customization names are not allowed",
      }
    ),
});

// Schema for product updates (partial)
export const updateProductSchema = completeProductSchema.partial().extend({
  _id: z.string().min(1, "Product ID is required"),
});

// Schema for bulk operations
export const bulkProductSchema = z.object({
  productIds: z
    .array(z.string().min(1, "Product ID cannot be empty"))
    .min(1, "At least one product must be selected")
    .max(100, "Cannot update more than 100 products at once"),
  status: z.enum(["active", "draft", "inactive"]),
});

// Schema for product filters
export const productFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().max(100).optional(),
  category: z.string().optional(),
  status: z.enum(["active", "draft", "inactive"]).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(["name", "price", "createdAt", "stock"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: "Minimum price cannot be greater than maximum price",
    path: ["minPrice"],
  }
);

// Schema for image upload
export const imageUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, "At least one file is required")
    .max(10, "Cannot upload more than 10 files at once")
    .refine(
      (files) => files.every(file => file.size <= 5 * 1024 * 1024), // 5MB
      "Each file must be smaller than 5MB"
    )
    .refine(
      (files) => files.every(file => file.type.startsWith("image/")),
      "All files must be images"
    ),
});

// Type exports for use in components
export type ProductFormData = z.infer<typeof productFormSchema>;
export type CompleteProductData = z.infer<typeof completeProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;
export type BulkProductData = z.infer<typeof bulkProductSchema>;
export type ProductFiltersData = z.infer<typeof productFiltersSchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;
export type ProductVariantData = z.infer<typeof productVariantSchema>;
export type ProductCustomizationData = z.infer<typeof productCustomizationSchema>;

// Helper function to create default product form data
export const createDefaultProductData = (): Partial<CompleteProductData> => ({
  name: "",
  description: "",
  category: "",
  price: 0,
  stock: 0,
  status: "draft",
  images: [],
  tags: [],
  variants: [],
  customizations: [],
});

// Validation helper functions
export const validateProductForm = (data: unknown) => {
  return productFormSchema.safeParse(data);
};

export const validateCompleteProduct = (data: unknown) => {
  return completeProductSchema.safeParse(data);
};

export const validateProductFilters = (data: unknown) => {
  return productFiltersSchema.safeParse(data);
};

// Transform helper for API data
export const transformFormDataToApiData = (formData: CompleteProductData) => {
  return {
    ...formData,
    variants: formData.variants?.filter(v => v.size || v.color || v.material) || [],
    customizations: formData.customizations?.filter(c => 
      c.name.trim() && c.options.some(opt => opt.trim())
    ) || [],
    tags: formData.tags?.filter(tag => tag.trim()) || [],
  };
};