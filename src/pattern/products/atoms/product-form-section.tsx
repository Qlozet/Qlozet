// Product Form Section - Atom
// Card-style section container for product form fields

import React from "react"
import { cn } from "@/lib/utils"

interface ProductFormSectionProps {
    children: React.ReactNode
    className?: string
}

export const ProductFormSection: React.FC<ProductFormSectionProps> = ({ children, className }) => {
    return <div className={cn("bg-card rounded-lg p-6", className)}>{children}</div>
}
