"use client";

import React, { useEffect, useState } from 'react'
import { IIconProps } from '@/types'
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const OrdersNavIcon = ({ width, height }: IIconProps) => {
    const pathname = usePathname();
    const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (pathname.startsWith(`${APP_ROUTES.orders}`)) {
            setColor(`${NAV_ICON_ACTIVE}`);
        } else {
            setColor(`${NAV_ICON_INACTIVE}`)
        }
    }, [pathname])

    const displayColor = isHovered ? "var(--secondary)" : color

    return (
        <>
            <svg
                width={width ?? "24"}
                height={height ?? "24"}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}>
                <path d="M16.25 19.5C16.9404 19.5 17.5 20.0596 17.5 20.75C17.5 21.4404 16.9404 22 16.25 22C15.5596 22 15 21.4404 15 20.75C15 20.0596 15.5596 19.5 16.25 19.5Z" fill={displayColor} stroke={displayColor} />
                <path d="M8.25 19.5C8.94036 19.5 9.5 20.0596 9.5 20.75C9.5 21.4404 8.94036 22 8.25 22C7.55964 22 7 21.4404 7 20.75C7 20.0596 7.55964 19.5 8.25 19.5Z" fill={displayColor} stroke={displayColor} />
                <path d="M2 1.75H3.74023C4.24567 1.75006 4.74503 1.94131 5.13574 2.2793L5.2959 2.43359C5.53861 2.71193 5.69999 3.04928 5.78223 3.41113L5.87109 3.7998H18.5596C20.0411 3.7998 21.1603 4.99556 21.0518 6.47363V6.47461C21.0407 6.62829 20.9122 6.75 20.75 6.75H5.44043C5.25406 6.75 5.12439 6.60153 5.13867 6.43262V6.43066L5.33789 3.98047H5.33887V3.97266C5.36723 3.53298 5.22452 3.09738 4.91895 2.7627L4.91211 2.75488L4.79395 2.64258C4.50609 2.39513 4.13555 2.25006 3.74023 2.25H2C1.86614 2.25 1.75 2.13386 1.75 2C1.75 1.86614 1.86614 1.75 2 1.75Z" fill={displayColor} stroke={displayColor} />
                <path d="M20.5101 8.75H5.17005C4.75005 8.75 4.41005 9.07 4.37005 9.48L4.01005 13.83C3.87005 15.54 5.21005 17 6.92005 17H18.0401C19.5401 17 20.8601 15.77 20.9701 14.27L21.3001 9.6C21.3401 9.14 20.9801 8.75 20.5101 8.75Z" fill={displayColor} />
            </svg>

        </>
    )
}