"use client";

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Megaphone } from 'lucide-react'
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants'
import { APP_ROUTES } from '@/lib/routes'
import { IIconProps } from '@/types'

// Placeholder icon — swap <Megaphone /> for the provided SVG when available.
export const MarketingNavIcon = ({ className }: IIconProps) => {
    const pathname = usePathname()
    const [color, setColor] = useState<string>(NAV_ICON_INACTIVE)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        setColor(pathname.startsWith(APP_ROUTES.marketing) ? NAV_ICON_ACTIVE : NAV_ICON_INACTIVE)
    }, [pathname])

    const displayColor = isHovered ? 'var(--secondary)' : color

    return (
        <Megaphone
            className={className}
            color={displayColor}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        />
    )
}
