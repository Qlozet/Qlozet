import React, { FC } from 'react'
import { cn } from '@/lib/utils'
import { IIconProps } from '@/types'

export const LinearAddSquareIcon: FC<IIconProps> = ({ width, height, className }) => {
  return (
      <svg width={width ?? "18"} height={height ?? "18"} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(className)}>
          <path d="M6 9H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V6.75C16.5 3 15 1.5 11.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  )
}