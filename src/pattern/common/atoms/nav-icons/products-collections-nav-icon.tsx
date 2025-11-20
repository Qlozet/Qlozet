"use client";

import React, { useEffect, useState } from 'react'
import { IIconProps } from '@/types'
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const ProductsCollectionsNavIcon = ({ width, height }: IIconProps) => {
    const pathname = usePathname();
    const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (pathname.startsWith(APP_ROUTES.productsCollections)) {
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
                onMouseLeave={() => setIsHovered(false)}
            >
                <path d="M12 18.5V19.38C12 21.25 11.25 22 9.37 22H4.62C3.17 22 2 20.83 2 19.38V14.63C2 12.75 2.75 12 4.62 12H5.5V15.5C5.5 17.16 6.84 18.5 8.5 18.5H12Z" fill={displayColor} />
                <path d="M17 13.5V14.37C17 15.82 15.82 17 14.37 17H9.62C7.75 17 7 16.25 7 14.37V9.62C7 8.17 8.17 7 9.62 7H10.5V10.5C10.5 12.16 11.84 13.5 13.5 13.5H17Z" fill={displayColor} />
                <path d="M22 4.62V9.37C22 11.25 21.25 12 19.37 12H14.62C12.75 12 12 11.25 12 9.37V4.62C12 2.75 12.75 2 14.62 2H19.37C21.25 2 22 2.75 22 4.62Z" fill={displayColor} />
            </svg>
        </>
    )
}