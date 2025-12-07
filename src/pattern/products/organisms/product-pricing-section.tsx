// Product Pricing Section - Organism
// Section for product pricing input

import React from "react"
import { ProductFieldGroup } from "../molecules/product-field-group"
import { Input } from "@/components/ui/input"

interface ProductPricingSectionProps {
    price: string
    onPriceChange: (value: string) => void
}

export const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({ price, onPriceChange }) => {
    return (
        <div className="bg-card rounded-lg p-6">
            <h3 className="text-sm font-medium text-foreground mb-4">Pricing</h3>
            <div className="w-full space-y-[10px]">
                {/* Price */}
                <ProductFieldGroup>
                    <ProductFieldGroup.Label tooltip="Enter the product price" className="text-sm font-normal">
                        Price
                    </ProductFieldGroup.Label>
                    <ProductFieldGroup.Content>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground">$</span>
                            <Input
                                type="number"
                                value={price}
                                onChange={(e) => onPriceChange(e.target.value)}
                                className="bg-accent border-border-input pl-7"
                            />
                        </div>
                    </ProductFieldGroup.Content>
                </ProductFieldGroup>

                {/* Available discount? */}
                <ProductFieldGroup>
                    <ProductFieldGroup.Label tooltip="Enter the Available discount?" className="text-sm font-normal">
                        Available discount?
                    </ProductFieldGroup.Label>
                    <ProductFieldGroup.Content>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground">$</span>
                            <Input
                                type="number"
                                value={price}
                                onChange={(e) => onPriceChange(e.target.value)}
                                className="bg-accent border-border-input pl-7"
                            />
                        </div>
                    </ProductFieldGroup.Content>
                </ProductFieldGroup>
            </div>
        </div>
    )
}
