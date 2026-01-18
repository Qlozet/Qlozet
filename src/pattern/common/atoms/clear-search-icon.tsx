import React, { FC } from 'react'
import { cn } from '@/lib/utils'
import { IIconProps } from '@/types'

export const ClearSearchIcon: FC<IIconProps> = ({ width, height, className }) => {
  return (
      <svg
          xmlns='http://www.w3.org/2000/svg'
          width={width ?? '16'}
          height={height ?? '16'}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={cn(className)}
      >
          <line x1='18' y1='6' x2='6' y2='18' />
          <line x1='6' y1='6' x2='18' y2='18' />
      </svg>
  )
}