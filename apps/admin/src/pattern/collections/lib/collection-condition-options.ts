// Condition builder options for platform collections. Field paths are the
// dot-notation paths the backend traverses when matching products.

export interface ConditionOption {
  value: string;
  label: string;
}

export const CONDITION_FIELD_OPTIONS: ConditionOption[] = [
  { value: 'kind', label: 'Product kind' },
  { value: 'status', label: 'Status' },
  { value: 'base_price', label: 'Base price' },
  { value: 'clothing.taxonomy.product_type', label: 'Clothing · product type' },
  { value: 'clothing.taxonomy.categories', label: 'Clothing · category' },
  { value: 'clothing.taxonomy.audience', label: 'Clothing · audience' },
  { value: 'clothing.taxonomy.attributes', label: 'Clothing · attribute' },
  { value: 'clothing.name', label: 'Clothing · name' },
  {
    value: 'clothing.type',
    label: 'Clothing · type (customize / non_customize)',
  },
  {
    value: 'accessory.taxonomy.product_type',
    label: 'Accessory · product type',
  },
  { value: 'accessory.taxonomy.categories', label: 'Accessory · category' },
  { value: 'fabric.taxonomy.product_type', label: 'Fabric · product type' },
  { value: 'fabric.pattern', label: 'Fabric · pattern' },
  { value: 'fabric.name', label: 'Fabric · name' },
  { value: 'fabric.price_per_yard', label: 'Fabric · price per yard' },
];

export const CONDITION_OPERATOR_OPTIONS: ConditionOption[] = [
  { value: 'is_equal_to', label: 'is equal to' },
  { value: 'not_equal_to', label: 'is not equal to' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
];

/** Explore-scope kinds a platform collection can be pinned to. */
export const KIND_OPTIONS = ['clothing', 'accessory', 'fabric'] as const;

const FIELD_LABELS = Object.fromEntries(
  CONDITION_FIELD_OPTIONS.map((o) => [o.value, o.label])
);
const OPERATOR_LABELS = Object.fromEntries(
  CONDITION_OPERATOR_OPTIONS.map((o) => [o.value, o.label])
);

/** Human-readable "Clothing · product type is equal to agbada". */
export function formatCondition(c: {
  field: string;
  operator: string;
  value: string;
}): string {
  const field = FIELD_LABELS[c.field] ?? c.field;
  const op = OPERATOR_LABELS[c.operator] ?? c.operator.replace(/_/g, ' ');
  return `${field} ${op} ${c.value}`;
}
