// Status Indicator - Atom
// Small colored dot to indicate status

import React from "react"
import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
    status?: "active" | "inactive" | "draft"
    className?: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status = "active", className }) => {
    const statusColors = {
        active: "bg-success",
        inactive: "bg-error",
        draft: "bg-warning",
    }

    return <div className={cn("w-2 h-2 rounded-full", statusColors[status], className)} />
}
