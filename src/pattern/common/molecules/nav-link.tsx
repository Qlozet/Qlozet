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

const activeStyle = `font-semibold text-primary font-normal`

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
        <>
            <Link
                href={href}
                className={cn(
                    "w-fit 2xl:w-full flex items-center gap-3 px-2 2xl:px-4 py-2 2xl:py-3 text-sidebar-foreground hover:bg-gray-100 rounded-lg transition-colors text-sm font-normal transition-all duration-300",
                    (isActiveState() || isActive) && activeStyle,
                    className,
                )}
                onClick={handleToggle}
                ref={innerRef}
                {...props}
            >
                {children}
            </Link>
        </>
    )
}

export default NavLink
