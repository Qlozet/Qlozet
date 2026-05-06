// Product Field Group - Molecule
// Groups product form field with label using composition pattern

import React from "react"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductFieldGroupProps {
    children: React.ReactNode
    className?: string
}

interface ProductFieldGroupLabelProps {
    children: React.ReactNode
    className?: string
    tooltip?: string
}

interface ProductFieldGroupContentProps {
    children: React.ReactNode
}

interface ProductFieldGroupFooterProps {
    children: React.ReactNode
}

const ProductFieldGroupRoot: React.FC<ProductFieldGroupProps> = ({ children, className }) => {
    return <div className={cn("space-y-2", className)}>{children}</div>
}

const ProductFieldGroupLabel: React.FC<ProductFieldGroupLabelProps> = ({ children, className, tooltip }) => {
    if (tooltip) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Label>{children}</Label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        )
    }

    return <Label className={className}>{children}</Label>
}

const ProductFieldGroupContent: React.FC<ProductFieldGroupContentProps> = ({ children }) => {
    return <div>{children}</div>
}

const ProductFieldGroupFooter: React.FC<ProductFieldGroupFooterProps> = ({ children }) => {
    return <div className="text-sm text-muted-foreground">{children}</div>
}

export const ProductFieldGroup = Object.assign(ProductFieldGroupRoot, {
    Label: ProductFieldGroupLabel,
    Content: ProductFieldGroupContent,
    Footer: ProductFieldGroupFooter,
})
