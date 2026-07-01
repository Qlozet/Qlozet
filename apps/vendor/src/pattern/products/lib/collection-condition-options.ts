// Option sources for the Create Collection condition builder. Static until the
// backend exposes taxonomy endpoints for these fields.

export interface Option {
  value: string
  label: string
}

// condition.field — the product attribute a rule matches on.
export const CONDITION_FIELD_OPTIONS: Option[] = [
  { value: 'product_category', label: 'Product Category' },
  { value: 'product_sub_category', label: 'Product Sub-Category' },
  { value: 'product_type', label: 'Product Type' },
  { value: 'product_tags', label: 'Product Tags' },
]

// condition.operator — mirrors the backend ConditionDto operator enum.
export const CONDITION_OPERATOR_OPTIONS: Option[] = [
  { value: 'is_equal_to', label: 'is equal to' },
  { value: 'not_equal_to', label: 'is not equal to' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
]

// condition.value — the options offered per field.
export const CONDITION_VALUE_OPTIONS: Record<string, Option[]> = {
  product_category: [
    { value: 'Suits', label: 'Suits' },
    { value: 'Shirts and Tops', label: 'Shirts and Tops' },
    { value: 'Native Wear', label: 'Native Wear' },
    { value: 'Trousers', label: 'Trousers' },
    { value: 'Dress', label: 'Dress' },
  ],
  product_sub_category: [
    { value: 'Ankara', label: 'Ankara' },
    { value: 'Agbada', label: 'Agbada' },
    { value: 'Kaftan', label: 'Kaftan' },
    { value: 'Plain', label: 'Plain' },
    { value: 'Embroidered', label: 'Embroidered' },
  ],
  product_type: [
    { value: 'Customizable', label: 'Customizable' },
    { value: 'Non-customizable', label: 'Non-customizable' },
  ],
  product_tags: [
    { value: 'Men', label: 'Men' },
    { value: 'Women', label: 'Women' },
    { value: 'Unisex', label: 'Unisex' },
    { value: 'Kids', label: 'Kids' },
  ],
}
