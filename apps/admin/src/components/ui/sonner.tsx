'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import {
  Toaster as Sonner,
  type ToasterProps as SonnerToasterProps,
} from 'sonner';
import {
  Info,
  CircleCheck,
  CircleAlert,
  CircleSlash,
  X as XIcon,
} from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Custom icons for each toast variant, matching the design system.
 * Colors are the design-system tokens resolved to their hex values:
 * info #1e6ef4 · success #149e5e · warning #ee6002 · error #f23c57
 */
const toastIcons: SonnerToasterProps['icons'] = {
  info: <Info className="h-5 w-5 shrink-0 text-[#1e6ef4]" />,
  success: <CircleCheck className="h-5 w-5 shrink-0 text-[#149e5e]" />,
  warning: <CircleAlert className="h-5 w-5 shrink-0 text-[#ee6002]" />,
  error: <CircleSlash className="h-5 w-5 shrink-0 text-[#f23c57]" />,
  close: <XIcon />,
};

/**
 * Class overrides per toast type so sonner renders the branded style
 * (colored border, tinted background, no default shadow).
 */
const toastClassNames: SonnerToasterProps['toastOptions'] = {
  classNames: {
    toast:
      '!border !rounded-[8px] !shadow-none !py-[8px] !pl-[16px] !pr-[4px] !space-2 !items-center !justify-start !min-w-[490px] !w-fit !max-w-[520px]',
    info: '!bg-[#e8f0fe] !border-[#1e6ef4]',
    success: '!bg-[#e4fdf1] !border-[#149e5e] items-start!',
    warning: '!bg-[#fdf2eb] !border-[#ee6002]',
    error: '!bg-[#feebee] !border-[#f23c57] items-start!',
    title:
      '!text-[#3f4650] !text-base !font-normal !pr-[28px] !leading-5',
    description: '!text-[#697586] !text-sm !pr-[8px]',
    closeButton: 'top-6.5! size-4!',
  },
  style: { minHeight: 56, width: 'fit-content', margin: '0 auto' },
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      closeButton
      duration={5000}
      icons={toastIcons}
      {...props}
      toastOptions={toastClassNames}
    />
  );
};

export { Toaster };
