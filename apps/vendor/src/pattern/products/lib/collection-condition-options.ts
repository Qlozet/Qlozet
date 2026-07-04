// Option sources for the Create Collection condition builder.
// Field values use the dot-notation paths the backend's getNestedValue()
// traverses on the product document. Operators mirror the backend
// evaluateOperator() switch cases.

export interface Option {
  value: string
  label: string
}

// condition.field — product attribute paths used by the backend.
export const CONDITION_FIELD_OPTIONS: Option[] = [
  { value: 'clothing.taxonomy.product_type', label: 'Product Type' },
  { value: 'clothing.taxonomy.categories', label: 'Category' },
  { value: 'clothing.taxonomy.audience', label: 'Audience' },
  { value: 'clothing.taxonomy.attributes', label: 'Attributes' },
  { value: 'clothing.name', label: 'Product Name' },
  { value: 'clothing.type', label: 'Customize Type' },
  { value: 'base_price', label: 'Price' },
  { value: 'kind', label: 'Product Kind' },
  { value: 'status', label: 'Status' },
  // Fabric fields — fabrics have product_type & pattern as direct fields, no taxonomy object
  { value: 'fabric.product_type', label: 'Fabric Material' },
  { value: 'fabric.pattern', label: 'Fabric Pattern' },
  { value: 'fabric.name', label: 'Fabric Name' },
  { value: 'fabric.price_per_yard', label: 'Price per Yard' },
  // Accessory fields
  { value: 'accessory.taxonomy.product_type', label: 'Accessory Type' },
  { value: 'accessory.taxonomy.categories', label: 'Accessory Category' },
  { value: 'accessory.taxonomy.audience', label: 'Accessory Audience' },
]

// condition.operator — mirrors the backend evaluateOperator() cases.
export const CONDITION_OPERATOR_OPTIONS: Option[] = [
  { value: 'is_equal_to', label: 'is equal to' },
  { value: 'not_equal_to', label: 'is not equal to' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
]

// Fields that need taxonomy-fetched values (dynamic dropdowns).
// The value is the `kind` param for the taxonomy API.
export const TAXONOMY_FIELD_CONFIG: Record<string, { kind: string; type: 'product_type' | 'categories' | 'audience' | 'attributes' }> = {
  'clothing.taxonomy.product_type': { kind: 'clothing', type: 'product_type' },
  'clothing.taxonomy.categories': { kind: 'clothing', type: 'categories' },
  'clothing.taxonomy.audience': { kind: 'clothing', type: 'audience' },
  'clothing.taxonomy.attributes': { kind: 'clothing', type: 'attributes' },
  // Fabric uses taxonomy API for product_type list, and categories (patterns) cascade from it
  'fabric.product_type': { kind: 'fabric', type: 'product_type' },
  'fabric.pattern': { kind: 'fabric', type: 'categories' },
  // Accessory
  'accessory.taxonomy.product_type': { kind: 'accessory', type: 'product_type' },
  'accessory.taxonomy.categories': { kind: 'accessory', type: 'categories' },
  'accessory.taxonomy.audience': { kind: 'accessory', type: 'audience' },
}

// Static value options for non-taxonomy fields (free-text fields use an Input
// instead of a Select, so these are only for fields with known enum values).
export const STATIC_VALUE_OPTIONS: Record<string, Option[]> = {
  'clothing.type': [
    { value: 'customize', label: 'Customizable' },
    { value: 'non_customize', label: 'Non-customizable' },
  ],
  kind: [
    { value: 'clothing', label: 'Clothing' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'accessory', label: 'Accessory' },
  ],
  status: [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ],
}

// Fields that accept free-text input instead of a dropdown.
export const FREE_TEXT_FIELDS = new Set([
  'clothing.name',
  'base_price',
  'fabric.name',
  'fabric.price_per_yard',
])
