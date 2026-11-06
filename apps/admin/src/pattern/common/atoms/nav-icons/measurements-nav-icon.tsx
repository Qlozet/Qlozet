'use client';

import { Ruler } from 'lucide-react';
import { IIconProps } from '@/types';
import { cn } from '@/lib/utils';

// Draws with currentColor, so NavLink sets the active/inactive shade.
export const MeasurementsNavIcon = ({ className }: IIconProps) => (
  <Ruler className={cn('w-5 h-5', className)} strokeWidth={1.75} />
);
