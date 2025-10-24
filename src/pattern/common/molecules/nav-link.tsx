"use client"

import type React from "react"
import { useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface INavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    exact?: boolean
    isActive?: boolean
    children: React.ReactNode
    className?: string
    innerRef?: React.LegacyRef<HTMLAnchorElement>
    onToggle?: () => void
}

const activeStyle = `bg-gray-100 font-semibold text-gray-900`

const NavLink = ({
    href,
    exact,
    children,
    isActive = false,
    innerRef,
    className,
    onToggle,
    ...props
}: INavLinkProps) => {
    const pathname = usePathname()

    const handleToggle = () => {
        if (onToggle) {
            onToggle()
        }
    }

    const isActiveState = useCallback(() => {
        const activeStatus = exact ? pathname === href : pathname.startsWith(href)
        return activeStatus
    }, [exact, href, pathname])

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium",
                (isActiveState() || isActive) && activeStyle,
                className,
            )}
            onClick={handleToggle}
            ref={innerRef}
            {...props}
        >
            {children}
        </Link>
    )
}

export default NavLink
