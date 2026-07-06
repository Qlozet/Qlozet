"use client";

import React, { useEffect, useState } from 'react'
import { IIconProps } from '@/types'
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const ProductsDiscountsNavIcon = ({ width, height }: IIconProps) => {
    const pathname = usePathname();
    const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (pathname.startsWith(APP_ROUTES.productsDiscounts)) {
            setColor(`${NAV_ICON_ACTIVE}`);
        } else {
            setColor(`${NAV_ICON_INACTIVE}`)
        }
    }, [pathname])

    const displayColor = isHovered ? "var(--secondary)" : color

    return (
        <svg
            width={width ?? "24"}
            height={height ?? "24"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Percent/tag discount icon */}
            <path d="M3.9 12.0001L10.28 5.62006C10.66 5.24006 11.3 5.24006 11.68 5.62006L18.06 12.0001C18.44 12.3801 18.44 13.0201 18.06 13.4001L11.68 19.7801C11.3 20.1601 10.66 20.1601 10.28 19.7801L3.9 13.4001C3.52 13.0201 3.52 12.3801 3.9 12.0001Z" fill={displayColor} opacity="0.4" />
            <path d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z" fill={displayColor} />
            <path d="M13.5 16C14.3284 16 15 15.3284 15 14.5C15 13.6716 14.3284 13 13.5 13C12.6716 13 12 13.6716 12 14.5C12 15.3284 12.6716 16 13.5 16Z" fill={displayColor} />
            <path d="M8.01001 15.7401C7.82001 15.7401 7.63001 15.6701 7.48001 15.5201C7.19001 15.2301 7.19001 14.7501 7.48001 14.4601L13.48 8.46006C13.77 8.17006 14.25 8.17006 14.54 8.46006C14.83 8.75006 14.83 9.23006 14.54 9.52006L8.54001 15.5201C8.39001 15.6701 8.20001 15.7401 8.01001 15.7401Z" fill={displayColor} />
            <path d="M21.77 11.6301L20.12 9.5801L20.37 6.8301C20.41 6.3701 20.06 5.9601 19.6 5.9101L16.86 5.6201L14.84 3.9201C14.47 3.6101 13.93 3.6101 13.56 3.9201L11 6.0501L8.44 3.9201C8.07 3.6101 7.53 3.6101 7.16 3.9201L5.14 5.6301L2.4 5.9201C1.94 5.9701 1.59 6.3801 1.63 6.8401L1.88 9.5901L0.23 11.6401C-0.0799999 12.0101 -0.0799999 12.5501 0.23 12.9201L1.88 14.9701L1.63 17.7201C1.59 18.1801 1.94 18.5901 2.4 18.6401L5.14 18.9301L7.16 20.6401C7.35 20.7901 7.57 20.8701 7.8 20.8701C8.03 20.8701 8.26 20.7901 8.44 20.6401L11 18.5101L13.56 20.6401C13.93 20.9501 14.47 20.9501 14.84 20.6401L16.86 18.9301L19.6 18.6401C20.06 18.5901 20.41 18.1801 20.37 17.7201L20.12 14.9701L21.77 12.9201C22.08 12.5501 22.08 12.0001 21.77 11.6301Z" fill={displayColor} opacity="0.15" />
        </svg>
    )
}
