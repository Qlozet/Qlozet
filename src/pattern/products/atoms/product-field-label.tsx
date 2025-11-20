// Product Field Label - Atom
// Label component for product form fields with optional info icon

import React from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductFieldLabelProps {
    children: React.ReactNode
    showInfo?: boolean
    className?: string
}

export const ProductFieldLabel: React.FC<ProductFieldLabelProps> = ({ children, showInfo = false, className }) => {
    return (
        <div className={cn("flex items-center gap-2 mb-2", className)}>
            <label className="text-sm font-medium text-foreground">{children}</label>
            {showInfo && <Info className="w-3 h-3 text-muted-foreground" />}
        </div>
    )
}
