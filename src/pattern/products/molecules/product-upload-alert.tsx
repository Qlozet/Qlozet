// Product Upload Alert - Molecule
// Dismissible alert for product upload guidelines

import React from "react"
import { Info, X } from "lucide-react"

interface ProductUploadAlertProps {
    message: string
    onDismiss?: () => void
}

export const ProductUploadAlert: React.FC<ProductUploadAlertProps> = ({ message, onDismiss }) => {
    return (
        <div className="bg-accent rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground flex-shrink-0 mt-0.5">
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
