// Product Upload Alert - Molecule
// Dismissible alert for product upload guidelines

import React from "react"
import { Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductAlertBannerProps {
    className?: string
    message: string
    onDismiss?: () => void
}

export const ProductAlertBanner: React.FC<ProductAlertBannerProps> = ({ className, message, onDismiss }) => {
    return (
        <div className={cn(className, "bg-[#3E1C0114] w-full flex items-start justify-between p-4 rounded-lg")}>
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-[12px] bg-primary text-primary-foreground flex-shrink-0">
                    <Info className="w-4 h-4" />
                </div>
                <p className="text-sm text-foreground">{message}</p>
            </div>
            {onDismiss && (
                <button onClick={onDismiss} className="text-foreground hover:opacity-70 transition-opacity">
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
