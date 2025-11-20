"use client"

import { useEffect, useState } from "react"
import type { IIconProps } from "@/types"
import { usePathname } from "next/navigation"
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from "@/lib/constants"
import { APP_ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

export const CustomersNavIcon = ({ width, height, className }: IIconProps) => {
    const pathname = usePathname()
    const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (pathname.startsWith(`${APP_ROUTES.customers}`)) {
            setColor(`${NAV_ICON_ACTIVE}`)
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
                fill=""
                xmlns="http://www.w3.org/2000/svg"
                className={cn(className)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <path
                    d="M17.4297 2.5C18.6626 2.5 19.6848 3.4382 19.8076 4.64551L19.8203 4.88965C19.8106 6.1796 18.7963 7.22393 17.5225 7.26953C17.4569 7.26434 17.3917 7.26426 17.3262 7.26953C16.0516 7.22314 15.04 6.17737 15.04 4.88965C15.0402 3.57494 16.1072 2.50019 17.4297 2.5Z"
                    fill={displayColor}
                    stroke={displayColor}
                />
                <path
                    d="M17.334 10.5103C18.5025 10.4743 19.6554 10.7543 20.5029 11.3169L20.5049 11.3179C21.1903 11.7691 21.4649 12.3153 21.4658 12.7974C21.4666 13.2799 21.1933 13.8288 20.5117 14.2847C19.6716 14.8473 18.5178 15.1245 17.3652 15.0933C17.6053 14.3872 17.7311 13.6345 17.7393 12.855V12.8501C17.7393 12.0324 17.6018 11.2409 17.334 10.5103Z"
                    fill={displayColor}
                    stroke={displayColor}
                />
                <path
                    d="M6.54004 2.5C7.86378 2.5 8.9295 3.56595 8.92969 4.88965C8.92969 6.17786 7.91787 7.22388 6.64258 7.26953C6.57702 7.26434 6.51184 7.26426 6.44629 7.26953C5.17168 7.22314 4.16016 6.17737 4.16016 4.88965C4.16034 3.56486 5.22748 2.50006 6.54004 2.5Z"
                    fill={displayColor}
                    stroke={displayColor}
                />
                <path
                    d="M6.44629 10.5073C6.18609 11.2383 6.04981 12.0276 6.0498 12.8501C6.0498 13.6382 6.17924 14.3965 6.41895 15.106C5.32754 15.1047 4.26082 14.8212 3.45703 14.2935C2.77026 13.8371 2.49514 13.2884 2.49512 12.8052C2.49512 12.3219 2.77026 11.7733 3.45703 11.3169L3.45898 11.3149C4.24917 10.7832 5.33857 10.5017 6.44629 10.5073Z"
                    fill={displayColor}
                    stroke={displayColor}
                />
                <path
                    d="M12 9.5C13.5731 9.5001 14.857 10.7354 14.9355 12.2891L14.9395 12.4404C14.9293 14.031 13.6842 15.315 12.1094 15.3691C12.0292 15.3632 11.9476 15.3631 11.8672 15.3691C10.302 15.3134 9.05106 14.0286 9.0498 12.4424C9.0585 10.8151 10.3677 9.5 12 9.5Z"
                    fill={displayColor}
                    stroke={displayColor}
                />
                <path
                    d="M8.8698 17.9401C7.3598 18.9501 7.3598 20.6101 8.8698 21.6101C10.5898 22.7601 13.4098 22.7601 15.1298 21.6101C16.6398 20.6001 16.6398 18.9401 15.1298 17.9401C13.4198 16.7901 10.5998 16.7901 8.8698 17.9401Z"
                    fill={displayColor}
                />
            </svg>
        </>
    )
}
