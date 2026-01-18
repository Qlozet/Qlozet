"use client";

import React, { useEffect, useState } from 'react'
import { IIconProps } from '@/types'
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const SupportNavIcon = ({ width, height }: IIconProps) => {
    const pathname = usePathname();
    const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (pathname.startsWith(`${APP_ROUTES.support}`)) {
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
                <path d="M20 1.75C21.2426 1.75 22.25 2.75736 22.25 4C22.25 5.24264 21.2426 6.25 20 6.25C18.7574 6.25 17.75 5.24264 17.75 4C17.75 2.75736 18.7574 1.75 20 1.75Z" fill={displayColor} stroke={displayColor} />
                <path d="M7 2.5H14.8496C15.1666 2.5 15.3971 2.78286 15.3311 3.09766L15.3291 3.10352C15.2049 3.73569 15.2186 4.39452 15.3613 5.06445V5.06543C15.7428 6.82708 17.1729 8.25717 18.9346 8.63867H18.9355C19.6113 8.78268 20.2667 8.78275 20.8877 8.67188L20.8945 8.6709C21.2195 8.60801 21.5 8.84821 21.5 9.15039V13.96C21.5 16.4438 19.4936 18.4502 17.0098 18.4502H15.5C15.0187 18.4502 14.5832 18.6775 14.3018 19.0479L14.3008 19.0488L12.8008 21.0391L12.7998 21.04C12.5504 21.3725 12.2558 21.5 12 21.5C11.7442 21.5 11.4496 21.3725 11.2002 21.04L11.1992 21.0391L9.69922 19.0488H9.69824C9.55831 18.8598 9.35996 18.7157 9.16895 18.6201C8.97446 18.5229 8.73721 18.4502 8.5 18.4502H7C4.51621 18.4502 2.50011 16.434 2.5 13.9502V7C2.5 4.51614 4.51614 2.5 7 2.5ZM8 9.5C7.1606 9.5 6.5 10.1771 6.5 11C6.5 11.8229 7.1606 12.5 8 12.5C8.8394 12.5 9.5 11.8229 9.5 11C9.5 10.1739 8.82614 9.5 8 9.5ZM12 9.5C11.1606 9.5 10.5 10.1771 10.5 11C10.5 11.8229 11.1606 12.5 12 12.5C12.8394 12.5 13.5 11.8229 13.5 11C13.5 10.1739 12.8261 9.5 12 9.5ZM16 9.5C15.1606 9.5 14.5 10.1771 14.5 11C14.5 11.8229 15.1606 12.5 16 12.5C16.8394 12.5 17.5 11.8229 17.5 11C17.5 10.1739 16.8261 9.5 16 9.5Z" fill={displayColor} stroke={displayColor} />
            </svg>
        </>
    )
}