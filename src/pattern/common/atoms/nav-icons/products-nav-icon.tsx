"use client";

import React, { useEffect, useState } from 'react'
import { IIconProps } from '@/types'
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const ProductsNavIcon = ({ width, height }: IIconProps) => {
    const pathname = usePathname();
    const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);

    useEffect(() => {
        if (pathname.startsWith(`${APP_ROUTES.products}`)) {
            setColor(`${NAV_ICON_ACTIVE}`);
        } else {
            setColor(`${NAV_ICON_INACTIVE}`);
        }
    }, [pathname]);

    return (
        <>
            <svg width={width ?? "24"} height={height ?? "24"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 1.75H13.5C14.335 1.75 15.0158 2.04124 15.4873 2.5127C15.9588 2.98415 16.25 3.66505 16.25 4.5V8C16.25 8.13386 16.1339 8.25 16 8.25C15.8661 8.25 15.75 8.13386 15.75 8V4.5C15.75 3.8555 15.5482 3.28064 15.1338 2.86621C14.7194 2.45178 14.1445 2.25 13.5 2.25H10.5C9.8555 2.25 9.28064 2.45178 8.86621 2.86621C8.45178 3.28064 8.25 3.8555 8.25 4.5V8C8.25 8.13386 8.13386 8.25 8 8.25C7.86614 8.25 7.75 8.13386 7.75 8V4.5C7.75 3.66505 8.04124 2.98415 8.5127 2.5127C8.98415 2.04124 9.66505 1.75 10.5 1.75Z" fill={color} stroke={color} />
                <path d="M8.39941 7H15.5996C17.2327 7 17.9895 7.38258 18.3926 7.86035C18.8222 8.36962 18.9606 9.09942 19.083 10.0879V10.0889L19.7617 15.7695H19.7627C19.7631 15.7738 19.762 15.7765 19.7617 15.7773C19.7613 15.7784 19.7604 15.7796 19.7598 15.7803H8C7.31821 15.7803 6.75 16.3298 6.75 17.0303C6.75015 17.7163 7.31395 18.2803 8 18.2803H20.0303L20.0273 18.625C19.9961 19.449 19.7819 20.1099 19.3467 20.5811C18.8542 21.1142 17.9902 21.4999 16.4902 21.5H7.50977C5.84561 21.5 4.96209 21.027 4.49805 20.3926C4.01675 19.7346 3.88709 18.7728 4.02637 17.5898L4.92676 10.0898V10.0889C5.04408 9.09929 5.17987 8.36846 5.6084 7.85938C6.01009 7.38219 6.76634 7.00007 8.39941 7Z" fill={color} stroke={color} />
            </svg>

        </>
    )
}