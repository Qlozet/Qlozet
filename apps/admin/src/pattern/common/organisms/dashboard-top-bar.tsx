"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardTopBarProps {
    /** Store / account name shown on the right. */
    storeName?: string
    /** Optional override for the page title. Defaults to the current route. */
    title?: string
}

const deriveTitle = (pathname: string): string => {
    const segments = pathname.replace(/^\//, "").split("/").filter(Boolean)
    const last = segments[segments.length - 1] ?? "dashboard"
    return last
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const DashboardTopBar = ({ storeName = "Miskay Boutique", title }: DashboardTopBarProps) => {
    const pathname = usePathname()
    const pageTitle = useMemo(() => title ?? deriveTitle(pathname), [title, pathname])

    return (
        <div className="w-full flex items-center justify-between gap-4 bg-white py-3 px-5 lg:px-6 rounded-2xl shadow-[0px_4px_10px_#AEAEC026]">
            {/* Page title */}
            <h1 className="text-[18px] font-semibold text-grey-black truncate">{pageTitle}</h1>

            {/* Right cluster */}
            <div className="flex items-center justify-end gap-3 lg:gap-4">
                {/* AI assistant */}
                <button
                    type="button"
                    aria-label="AI assistant"
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] text-grey3 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                    <Sparkles className="h-5 w-5" />
                </button>

                {/* Time period selector */}
                <button
                    type="button"
                    className="hidden sm:flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-grey3 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                    <Clock className="h-4 w-4" />
                    <span>This week</span>
                    <ChevronDown className="h-4 w-4" />
                </button>

                {/* Notifications */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-9 w-9 items-center justify-center rounded-[10px] text-grey3 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-white" />
                </button>

                {/* Store name */}
                <span className="hidden md:block text-sm font-medium text-grey-black">{storeName}</span>

                {/* Profile avatar */}
                <button
                    type="button"
                    aria-label="Profile"
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border border-border text-grey3 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                    )}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5 20C5 16.6863 8.13401 14 12 14C15.866 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
