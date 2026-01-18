import React from 'react'
import { cn } from '@/lib/utils'
import { IIconProps } from '@/types'

export const DarkModeIcon = ({ width, height, className }: IIconProps) => {
    return (
        <>
            <svg width={width ?? "25"} height={height ?? "24"} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(className)}>
                <path d="M2.11422 12.42C2.48906 17.57 7.03927 21.76 12.4849 21.99C16.3271 22.15 19.7632 20.43 21.8248 17.72C22.6787 16.61 22.2205 15.87 20.794 16.12C20.0964 16.24 19.3779 16.29 18.6282 16.26C13.5366 16.06 9.37164 11.97 9.35082 7.13996C9.3404 5.83996 9.62154 4.60996 10.1317 3.48996C10.694 2.24996 10.0172 1.65996 8.71566 2.18996C4.59236 3.85996 1.77061 7.84996 2.11422 12.42Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </>
    )
}