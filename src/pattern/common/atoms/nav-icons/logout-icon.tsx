import { cn } from '@/lib/utils'
import { IIconProps } from '@/types'
import React from 'react'

const LogoutIcon = ({ width, height, className }: IIconProps) => {
    return (
        <>
            <svg width={width ?? "26"} height={height ?? "24"} viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(className)}>
                <path d="M9.36328 7.56023C9.68943 3.96023 11.6358 2.49023 15.8967 2.49023H16.0335C20.7363 2.49023 22.6195 4.28023 22.6195 8.75023V15.2702C22.6195 19.7402 20.7363 21.5302 16.0335 21.5302H15.8967C11.6673 21.5302 9.72099 20.0802 9.3738 16.5402" fill="#ACB5BD" />
                <path d="M9.36328 7.56023C9.68943 3.96023 11.6358 2.49023 15.8967 2.49023H16.0335C20.7363 2.49023 22.6195 4.28023 22.6195 8.75023V15.2702C22.6195 19.7402 20.7363 21.5302 16.0335 21.5302H15.8967C11.6673 21.5302 9.72099 20.0802 9.3738 16.5402" stroke="#ACB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.7813 12H3.80859" stroke="#ACB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.15436 8.6499L2.62988 11.9999L6.15436 15.3499" fill="#ACB5BD" />
                <path d="M6.15436 8.6499L2.62988 11.9999L6.15436 15.3499" stroke="#ACB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </>
    )
}

export default LogoutIcon