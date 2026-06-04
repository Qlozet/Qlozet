"use client";

import React, { useEffect, useState } from 'react'
import { IIconProps } from '@/types'
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const NotificationNavIcon = ({ width, height }: IIconProps) => {
    const pathname = usePathname();
    const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (pathname.startsWith(`${APP_ROUTES.notification}`)) {
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
                <path d="M12 6.44V9.77" stroke={displayColor} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                <path d="M12.0206 2C8.24277 2 5.18327 4.98 5.18327 8.66V10.76C5.18327 11.44 4.8958 12.46 4.53646 13.04L3.23259 15.16C2.43177 16.47 2.98618 17.93 4.4646 18.41C9.37212 20 14.6801 20 19.5876 18.41C20.9736 17.96 21.5691 16.38 20.8196 15.16L19.5157 13.04C19.1564 12.46 18.8689 11.43 18.8689 10.76V8.66C18.8689 5 15.7783 2 12.0206 2Z" stroke={displayColor} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                <path d="M15.4194 18.8201C15.4194 20.6501 13.8795 22.1501 12.0007 22.1501C11.0664 22.1501 10.204 21.7701 9.58803 21.1701C8.97208 20.5701 8.58191 19.7301 8.58191 18.8201" stroke={displayColor} strokeWidth="1.5" strokeMiterlimit="10" />
            </svg>
        </>
    )
}
