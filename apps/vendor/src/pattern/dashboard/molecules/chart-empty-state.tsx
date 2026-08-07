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
    /**
     * Matches the wrapped chart's height so the card keeps its size when there
     * is nothing to plot. Defaults to the common 250px chart height.
     */
    height?: number;
}

// When there's no data the chart isn't rendered at all — an earlier version
// drew a faint "ghost" chart from placeholder numbers and floated this message
// over it, which both invented data and sat on top of the bars.
export const ChartEmptyState = ({
    children,
    isEmpty,
    variant = "bar",
    message = "No data yet",
    description,
    height = 250,
}: ChartEmptyStateProps) => {
    if (!isEmpty) return <>{children}</>;

    const Icon = variant === "pie" ? PieChartIcon : BarChart3;

    return (
        <div
            className="flex w-full flex-col items-center justify-center px-5 text-center"
            style={{ minHeight: height }}
        >
            <Icon size={32} className="text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-2.5 text-sm font-semibold text-foreground">
                {message}
            </p>
            {description && (
                <p className="mt-1.5 max-w-60 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
};
