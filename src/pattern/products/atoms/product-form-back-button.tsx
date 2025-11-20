// Product Form Back Button - Atom
// Navigation button to go back from product form

import React from "react"
import { ArrowLeft } from "lucide-react"

interface ProductFormBackButtonProps {
    onClick?: () => void
}

export const ProductFormBackButton: React.FC<ProductFormBackButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity"
        >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brown1">
                <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Go Back</span>
        </button>
    )
}
