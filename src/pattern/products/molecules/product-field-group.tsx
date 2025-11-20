// Product Field Group - Molecule
// Groups product form field with label and optional word count

import React from "react"
import { ProductFieldLabel } from "../atoms/product-field-label"

interface ProductFieldGroupProps {
    label: string
    showInfo?: boolean
    children: React.ReactNode
    wordCount?: number
}

export const ProductFieldGroup: React.FC<ProductFieldGroupProps> = ({ label, showInfo, children, wordCount }) => {
    return (
        <div>
            <ProductFieldLabel showInfo={showInfo}>{label}</ProductFieldLabel>
            {children}
            {wordCount !== undefined && <div className="mt-2 text-sm text-muted-foreground">{wordCount} words</div>}
        </div>
    )
}
