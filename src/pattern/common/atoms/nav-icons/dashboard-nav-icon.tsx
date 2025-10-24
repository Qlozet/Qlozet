"use client";

import React, { useEffect, useState } from 'react'
import { IIconProps } from '@/types'
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const DashboardNavIcon = ({ width, height }: IIconProps) => {
    const pathname = usePathname();
    const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);

    useEffect(() => {
        if (pathname.match(`${APP_ROUTES.dashboard}`)) {
            setColor(`${NAV_ICON_ACTIVE}`);
        } else {
            setColor(`${NAV_ICON_INACTIVE}`);
        }
    }, [pathname]);

    return (
        <>
            <svg width={width ?? "24"} height={height ?? "24"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.7705 2.5H18.6709C19.6768 2.50008 20.3632 2.76461 20.7998 3.20117C21.2363 3.63781 21.5 4.32415 21.5 5.33008V7.23047C21.4999 8.23635 21.2364 8.92282 20.7998 9.35938C20.3632 9.79593 19.6768 10.0595 18.6709 10.0596H16.7705C15.7646 10.0596 15.0782 9.79584 14.6416 9.35938C14.205 8.92282 13.9405 8.23635 13.9404 7.23047V5.33008C13.9404 4.32394 14.205 3.6378 14.6416 3.20117C15.0782 2.76455 15.7644 2.5 16.7705 2.5Z" fill={color} stroke={color} />
                <path d="M5.33984 13.9302H7.24023C8.24639 13.9302 8.93215 14.1944 9.36719 14.6313C9.80224 15.0684 10.0642 15.7568 10.0596 16.7681V18.6704C10.0595 19.6763 9.7959 20.3627 9.35938 20.7993C8.92282 21.2359 8.23635 21.5004 7.23047 21.5005H5.33008C4.32395 21.5005 3.63769 21.2358 3.20117 20.7983C2.76459 20.3607 2.50008 19.672 2.5 18.6606V16.7603C2.5 15.7541 2.76465 15.0679 3.20215 14.6313C3.63982 14.1948 4.32841 13.9302 5.33984 13.9302Z" fill={color} stroke={color} />
                <path d="M6.29004 2.5C8.38318 2.50002 10.0801 4.19689 10.0801 6.29004C10.0801 8.38317 8.38317 10.0801 6.29004 10.0801C4.19689 10.0801 2.50002 8.38318 2.5 6.29004C2.5 4.19688 4.19688 2.5 6.29004 2.5Z" fill={color} stroke={color} />
                <path d="M17.71 13.9199C19.8031 13.9199 21.5 15.6168 21.5 17.71C21.5 19.8031 19.8031 21.5 17.71 21.5C15.6168 21.5 13.9199 19.8031 13.9199 17.71C13.9199 15.6168 15.6168 13.9199 17.71 13.9199Z" fill={color} stroke={color} />
            </svg>

        </>
    )
}