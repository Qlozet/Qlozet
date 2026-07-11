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
            {/* Ghost chart — very faint, non-interactive */}
            <div className="opacity-[0.12] pointer-events-none select-none" aria-hidden="true">
                {children}
            </div>

            {/* Centered overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center px-5 py-4 max-w-[240px] rounded-xl bg-background/70 dark:bg-card/70 backdrop-blur-sm">
                    <div className="mx-auto mb-2.5 flex items-center justify-center">
                        <Icon
                            size={32}
                            className="text-muted-foreground"
                            strokeWidth={1.5}
                        />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                        {message}
                    </p>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
