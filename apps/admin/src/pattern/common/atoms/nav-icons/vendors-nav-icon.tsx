"use client";

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Store } from 'lucide-react'
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants'
import { APP_ROUTES } from '@/lib/routes'
import { IIconProps } from '@/types'

// Placeholder icon — swap <Store /> for the provided SVG when available.
export const VendorsNavIcon = ({ className }: IIconProps) => {
    const pathname = usePathname()
    const [color, setColor] = useState<string>(NAV_ICON_INACTIVE)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        setColor(pathname.startsWith(APP_ROUTES.vendors) ? NAV_ICON_ACTIVE : NAV_ICON_INACTIVE)
    }, [pathname])

    const displayColor = isHovered ? 'var(--secondary)' : color

    return (
        <Store
            className={className}
            color={displayColor}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        />
    )
}
