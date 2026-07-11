'use client';

import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MultiSelectTagsDropdown,
  type TagGroup,
} from '@/pattern/common/organisms/multi-select-tag-dropdown';
import { FieldLabel } from '../atoms/field-label';
import { TagComboInput } from '../molecules/tag-combo-input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetProductTypesQuery,
  useGetCategoriesForTypeQuery,
  useGetVendorTagsQuery,
  type ProductTag,
} from '@/redux/services/taxonomy/taxonomy.api-slice';

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
  productType: string;       // Single value (e.g. 'Dress')
  category: string[];        // Categories from cascading API
  tags: ProductTag[];         // System + custom tags
  audience: Audience | '';
}

interface ProductOrganizationSectionProps {
  value: ProductOrganizationValue;
  onChange: (next: ProductOrganizationValue) => void;
  /** The taxonomy kind — determines which product types/categories load */
  kind?: 'clothing' | 'accessory' | 'fabric';
  /** Hide the Product type field — e.g. when customization is enabled */
  hideProductType?: boolean;
}

export const ProductOrganizationSection = ({
  value,
  onChange,
  kind = 'clothing',
  hideProductType = false,
}: ProductOrganizationSectionProps) => {
  // 1. Fetch product types for the given kind
  const {
    data: productTypes,
    isLoading: isLoadingTypes,
  } = useGetProductTypesQuery(kind);

  // 2. Fetch categories cascading from the selected product type
  const {
    data: categoryData,
    isLoading: isLoadingCategories,
  } = useGetCategoriesForTypeQuery(
    { kind, product_type: value.productType },
    { skip: !value.productType }
  );

  // 3. Fetch vendor-selectable tags
  const {
    data: vendorTags,
    isLoading: isLoadingTags,
  } = useGetVendorTagsQuery();

  // Build category options for the multi-select
  const categoryGroups: TagGroup[] = categoryData?.categories
    ? [
        {
          label: 'Categories',
          tags: categoryData.categories.map((cat) => ({
            value: cat,
            label: cat,
          })),
        },
      ]
    : [];

  // When product type changes, clear the selected categories
  // (they belong to the old product type)
  useEffect(() => {
    // Only reset if categories are set and the product type has changed
    if (value.category.length > 0 && categoryData?.categories) {
      const validCategories = value.category.filter((c) =>
        categoryData.categories.includes(c)
      );
      if (validCategories.length !== value.category.length) {
        onChange({ ...value, category: validCategories });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryData?.categories]);

  return (
    <div className="rounded-lg bg-card p-6 custom-card-shadow">
      <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
        Product Organization
      </h3>

      <div className="space-y-4">
        {/* Product Type — single select */}
        {!hideProductType && (
          <div>
            <FieldLabel tooltip="Select the product type">Product type</FieldLabel>
            {isLoadingTypes ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={value.productType || undefined}
                onValueChange={(next) =>
                  onChange({ ...value, productType: next, category: [] })
                }
              >
                <SelectTrigger className="w-full bg-background dark:bg-muted dark:border-white/10">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes?.map((pt) => (
                    <SelectItem key={pt.name} value={pt.name}>
                      {pt.icon ? `${pt.icon} ${pt.name}` : pt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Category — multi-select, cascading from product type */}
        <div>
          <FieldLabel tooltip="Select product categories">Category</FieldLabel>
          {isLoadingCategories && value.productType ? (
            <Skeleton className="h-10 w-full" />
          ) : categoryGroups.length > 0 ? (
            <MultiSelectTagsDropdown
              placeholder="Select categories"
              groups={categoryGroups}
              value={value.category}
              onChange={(next) => onChange({ ...value, category: next })}
            />
          ) : (
            <div className="flex h-10 w-full items-center rounded-md border border-border-input bg-accent px-3 text-sm text-muted-foreground">
              {value.productType
                ? 'No categories available'
                : 'Select a product type first'}
            </div>
          )}
        </div>

        {/* Tags — combo input (system + custom) */}
        <div>
          <FieldLabel tooltip="Add searchable tags">Tags</FieldLabel>
          <TagComboInput
            value={value.tags}
            onChange={(next) => onChange({ ...value, tags: next })}
            systemTags={vendorTags}
            isLoading={isLoadingTags}
            placeholder="Add tags..."
          />
        </div>

        {/* Audience — static enum, unchanged */}
        <div>
          <FieldLabel tooltip="Select target audience">Audience</FieldLabel>
          <Select
            value={value.audience || undefined}
            onValueChange={(next) =>
              onChange({ ...value, audience: next as Audience })
            }
          >
            <SelectTrigger className="w-full bg-background dark:bg-muted dark:border-white/10">
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
