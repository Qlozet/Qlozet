'use client';

import {
  MultiSelectTagsDropdown,
  type TagGroup,
} from '@/pattern/common/organisms/multi-select-tag-dropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldLabel } from '../atoms/field-label';

// Backend (POST /products/clothing) requires taxonomy.audience to be one of
// these exact values.
export const AUDIENCE_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Kids' },
] as const;

export type Audience = (typeof AUDIENCE_OPTIONS)[number]['value'];

export interface ProductOrganizationValue {
  tag: string[];
  category: string[];
  subCategory: string[];
  productType: string[];
  audience: Audience | '';
}

interface ProductOrganizationSectionProps {
  value: ProductOrganizationValue;
  onChange: (next: ProductOrganizationValue) => void;
  // Hide the Product type field — e.g. when customization is enabled, the
  // product type is implied and the dropdown is not shown.
  hideProductType?: boolean;
}

// Option sources for the organization chips. Static until the backend exposes
// taxonomy endpoints.
const TAG_GROUPS: TagGroup[] = [
  {
    label: 'Tags',
    tags: [
      { value: 'ankara', label: 'Ankara' },
      { value: 'kente', label: 'Kente' },
      { value: 'adire', label: 'Adire' },
      { value: 'lace', label: 'Lace' },
    ],
  },
];

const CATEGORY_GROUPS: TagGroup[] = [
  {
    label: 'Categories',
    tags: [
      { value: 'suit', label: 'Suit' },
      { value: 'kaftan', label: 'Kaftan' },
      { value: 'cargo', label: 'Cargo' },
      { value: 'abgada', label: 'Abgada' },
      { value: 'tops', label: 'Tops' },
      { value: 'dresses', label: 'Dresses' },
    ],
  },
];

const SUB_CATEGORY_GROUPS: TagGroup[] = [
  {
    label: 'Sub-categories',
    tags: [
      { value: 'ankara', label: 'Ankara' },
      { value: 'plain', label: 'Plain' },
      { value: 'embroidered', label: 'Embroidered' },
      { value: 'two-piece', label: 'Two Piece' },
    ],
  },
];

const PRODUCT_TYPE_GROUPS: TagGroup[] = [
  {
    label: 'Product Types',
    tags: [
      { value: 'customisable', label: 'Customisable' },
      { value: 'ready-made', label: 'Ready Made' },
    ],
  },
];

export const ProductOrganizationSection = ({
  value,
  onChange,
  hideProductType = false,
}: ProductOrganizationSectionProps) => {
  const set = (key: keyof ProductOrganizationValue) => (next: string[]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="rounded-lg bg-card p-6 custom-card-shadow">
      <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
        Product Organization
      </h3>

      <div className="space-y-4">
        <div>
          <FieldLabel tooltip="Add searchable tags">Tag</FieldLabel>
          <MultiSelectTagsDropdown
            placeholder="Select tags"
            groups={TAG_GROUPS}
            value={value.tag}
            onChange={set('tag')}
          />
        </div>

        <div>
          <FieldLabel tooltip="Select product category">Category</FieldLabel>
          <MultiSelectTagsDropdown
            placeholder="Select category"
            groups={CATEGORY_GROUPS}
            value={value.category}
            onChange={set('category')}
          />
        </div>

        <div>
          <FieldLabel tooltip="Select sub-category">Sub-category</FieldLabel>
          <MultiSelectTagsDropdown
            placeholder="Select sub-category"
            groups={SUB_CATEGORY_GROUPS}
            value={value.subCategory}
            onChange={set('subCategory')}
          />
        </div>

        {!hideProductType && (
          <div>
            <FieldLabel tooltip="Select product type">Product type</FieldLabel>
            <MultiSelectTagsDropdown
              placeholder="Customisable"
              groups={PRODUCT_TYPE_GROUPS}
              value={value.productType}
              onChange={set('productType')}
            />
          </div>
        )}

        <div>
          <FieldLabel tooltip="Select target audience">Audience</FieldLabel>
          <Select
            value={value.audience || undefined}
            onValueChange={(next) =>
              onChange({ ...value, audience: next as Audience })
            }
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
