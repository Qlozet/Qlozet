"use client"

import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { ReactNode } from "react";

interface ChartEmptyStateProps {
    children: ReactNode;
    isEmpty: boolean;
    /** "bar" shows a bar chart icon, "pie" shows a pie chart icon */
    variant?: "bar" | "pie";
    /** Primary message */
    message?: string;
    /** Secondary helper text */
    description?: string;
}

export const ChartEmptyState = ({
    children,
    isEmpty,
    variant = "bar",
    message = "No data yet",
    description,
}: ChartEmptyStateProps) => {
    if (!isEmpty) return <>{children}</>;

    const Icon = variant === "pie" ? PieChartIcon : BarChart3;

    return (
        <div className="relative">
            {/* Ghost chart — muted, non-interactive */}
            <div className="opacity-[0.35] pointer-events-none select-none" aria-hidden="true">
                {children}
            </div>

            {/* Centered overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center px-4 max-w-[220px]">
                    <div className="mx-auto mb-2 flex items-center justify-center">
                        <Icon
                            size={28}
                            className="text-muted-foreground/60 animate-pulse"
                            strokeWidth={1.5}
                        />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                        {message}
                    </p>
                    {description && (
                        <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
