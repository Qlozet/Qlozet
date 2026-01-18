// Product Variant Placeholder - Molecule
// Placeholder card for adding product variants with call-to-action

import React from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface ProductVariantPlaceholderProps {
    title: string
    description: string
    actionLabel: string
    onAction: () => void
    icon: LucideIcon
}

export const ProductVariantPlaceholder: React.FC<ProductVariantPlaceholderProps> = ({ title, description, actionLabel, onAction, icon: Icon }) => {
    return (
        <div className="text-center space-y-4">
            <h3 className="text-base font-medium text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button onClick={onAction} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Icon className="w-4 h-4" />
                {actionLabel}
            </Button>
        </div>
    )
}
