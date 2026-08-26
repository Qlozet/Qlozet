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
  { value: 'fabric.product_type', label: 'Fabric · product type' },
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

// ── Condition VALUE inputs ──
// Fields whose value is picked from the taxonomy tree (dynamic dropdown).
export const TAXONOMY_FIELD_CONFIG: Record<
  string,
  {
    kind: string;
    type: 'product_type' | 'categories' | 'audience' | 'attributes';
  }
> = {
  'clothing.taxonomy.product_type': { kind: 'clothing', type: 'product_type' },
  'clothing.taxonomy.categories': { kind: 'clothing', type: 'categories' },
  'clothing.taxonomy.audience': { kind: 'clothing', type: 'audience' },
  'clothing.taxonomy.attributes': { kind: 'clothing', type: 'attributes' },
  'fabric.product_type': { kind: 'fabric', type: 'product_type' },
  'fabric.pattern': { kind: 'fabric', type: 'categories' },
  'accessory.taxonomy.product_type': {
    kind: 'accessory',
    type: 'product_type',
  },
  'accessory.taxonomy.categories': { kind: 'accessory', type: 'categories' },
};

// Fields with a fixed enum of values.
export const STATIC_VALUE_OPTIONS: Record<string, ConditionOption[]> = {
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
};

// Fields that use a plain text input (names, prices).
export const FREE_TEXT_FIELDS = new Set([
  'clothing.name',
  'base_price',
  'fabric.name',
  'fabric.price_per_yard',
]);

/** Derive value options for a taxonomy-backed field from the taxonomy tree. */
export function getTaxonomyValues(
  tree:
    | Record<
        string,
        {
          product_types?: {
            name: string;
            categories?: string[];
            attributes?: string[];
          }[];
        }
      >
    | undefined,
  fieldPath: string
): ConditionOption[] {
  const config = TAXONOMY_FIELD_CONFIG[fieldPath];
  if (!config || !tree) return [];
  const kindData = tree[config.kind];
  if (!kindData?.product_types) return [];
  switch (config.type) {
    case 'product_type':
      return kindData.product_types.map((pt) => ({
        value: pt.name,
        label: pt.name,
      }));
    case 'categories': {
      const all = new Set<string>();
      kindData.product_types.forEach((pt) =>
        pt.categories?.forEach((c) => all.add(c))
      );
      return Array.from(all)
        .sort()
        .map((c) => ({ value: c, label: c }));
    }
    case 'attributes': {
      const all = new Set<string>();
      kindData.product_types.forEach((pt) =>
        pt.attributes?.forEach((a) => all.add(a))
      );
      return Array.from(all)
        .sort()
        .map((a) => ({ value: a, label: a }));
    }
    case 'audience':
      return [
        { value: 'men', label: 'Men' },
        { value: 'women', label: 'Women' },
        { value: 'unisex', label: 'Unisex' },
        { value: 'kids', label: 'Kids' },
      ];
    default:
      return [];
  }
}

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
