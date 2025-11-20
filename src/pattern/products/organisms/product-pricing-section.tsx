// Product Pricing Section - Organism
// Section for product pricing input

import React from "react"
import { ProductFormSection } from "../atoms/product-form-section"
import { ProductFieldGroup } from "../molecules/product-field-group"
import { Input } from "@/components/ui/input"

interface ProductPricingSectionProps {
    price: string
    onPriceChange: (value: string) => void
}

export const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({ price, onPriceChange }) => {
    return (
        <ProductFormSection>
            <h3 className="text-sm font-medium text-foreground mb-4">Pricing</h3>
            <ProductFieldGroup label="Price" showInfo>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground">$</span>
                    <Input
                        type="number"
                        value={price}
                        onChange={(e) => onPriceChange(e.target.value)}
                        className="bg-accent border-border-input pl-7"
                    />
                </div>
            </ProductFieldGroup>
        </ProductFormSection>
    )
}
