// Product Organization Section - Organism
// Section containing all product categorization fields

import React from "react"
import { ProductFieldGroup } from "../molecules/product-field-group"
import { MultiSelectTagsDropdown } from "@/pattern/common/organisms/multi-select-tag-dropdown"

interface TagGroup {
    label: string
    tags: { value: string; label: string }[]
}

interface ProductOrganizationSectionProps {
    audience: string[]
    onAudienceChange: (value: string[]) => void
    audienceGroups: TagGroup[]
    category: string[]
    onCategoryChange: (value: string[]) => void
    categoryGroups: TagGroup[]
    productType: string[]
    onProductTypeChange: (value: string[]) => void
    productTypeGroups: TagGroup[]
    attributes: string[]
    onAttributesChange: (value: string[]) => void
    attributesGroups: TagGroup[]
}

export const ProductOrganizationSection: React.FC<ProductOrganizationSectionProps> = ({
    audience,
    onAudienceChange,
    audienceGroups,
    category,
    onCategoryChange,
    categoryGroups,
    productType,
    onProductTypeChange,
    productTypeGroups,
    attributes,
    onAttributesChange,
    attributesGroups,
}) => {
    return (
        <div className="bg-card rounded-lg p-6">
            <h3 className="text-sm font-medium text-foreground mb-4">Product Organization</h3>

            <div className="space-y-4">
                <ProductFieldGroup>
                    <ProductFieldGroup.Label tooltip="Select target audience">
                        Audience
                    </ProductFieldGroup.Label>
                    <ProductFieldGroup.Content>
                        <MultiSelectTagsDropdown placeholder="Men" groups={audienceGroups} value={audience} onChange={onAudienceChange} />
                    </ProductFieldGroup.Content>
                </ProductFieldGroup>

                <ProductFieldGroup>
                    <ProductFieldGroup.Label tooltip="Select product category">
                        Category
                    </ProductFieldGroup.Label>
                    <ProductFieldGroup.Content>
                        <MultiSelectTagsDropdown placeholder="Tops" groups={categoryGroups} value={category} onChange={onCategoryChange} />
                    </ProductFieldGroup.Content>
                </ProductFieldGroup>

                <ProductFieldGroup>
                    <ProductFieldGroup.Label tooltip="Select product type">
                        Product type
                    </ProductFieldGroup.Label>
                    <ProductFieldGroup.Content>
                        <MultiSelectTagsDropdown
                            placeholder="Hoodies"
                            groups={productTypeGroups}
                            value={productType}
                            onChange={onProductTypeChange}
                        />
                    </ProductFieldGroup.Content>
                </ProductFieldGroup>

                <ProductFieldGroup>
                    <ProductFieldGroup.Label tooltip="Select product attributes">
                        Attributes
                    </ProductFieldGroup.Label>
                    <ProductFieldGroup.Content>
                        <MultiSelectTagsDropdown
                            placeholder="Regular fit"
                            groups={attributesGroups}
                            value={attributes}
                            onChange={onAttributesChange}
                        />
                    </ProductFieldGroup.Content>
                </ProductFieldGroup>
            </div>
        </div>
    )
}
