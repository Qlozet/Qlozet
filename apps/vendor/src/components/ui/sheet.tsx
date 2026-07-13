'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b sheet-gentle-top',
        bottom: 'inset-x-0 bottom-0 border-t sheet-gentle-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm sheet-gentle-left',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm sheet-gentle-right',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        // Mobile: floating bottom sheet
        "fixed z-50 gap-4 bg-background p-6 shadow-lg",
        "inset-x-4 bottom-4 rounded-[16px] max-h-[85vh] overflow-y-auto",
        "sheet-mobile-bottom",
        // sm+: normal sheet behavior
        "sm:left-auto sm:right-auto sm:bottom-auto sm:max-h-none",
        sheetVariants({ side, className: "hidden sm:block" }),
        className
      )}
      {...props}
    >
      <style>{`
        /* Mobile: force bottom sheet positioning over variant classes */
        @media (max-width: 639px) {
          .sheet-mobile-bottom {
            top: auto !important;
            height: auto !important;
            width: calc(100% - 32px) !important;
            left: 16px !important;
            right: 16px !important;
            bottom: 16px !important;
            border-radius: 16px !important;
            max-height: 85vh;
            overflow-y: auto;
          }
          .sheet-mobile-bottom[data-state="open"] {
            animation: sheetMobileSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .sheet-mobile-bottom[data-state="closed"] {
            animation: sheetMobileSlideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        }
        @keyframes sheetMobileSlideUp {
          0% { opacity: 0; translate: 0 100%; }
          100% { opacity: 1; translate: 0 0; }
        }
        @keyframes sheetMobileSlideDown {
          0% { opacity: 1; translate: 0 0; }
          100% { opacity: 0; translate: 0 100%; }
        }
        /* Desktop: keep existing slide animations */
        @media (min-width: 640px) {
          .sheet-mobile-bottom {
            inset: revert;
            max-height: none;
          }
        }
        @keyframes sheetSlideInRight {
          0% { translate: 100% 0; opacity: 0.5; }
          100% { translate: 0 0; opacity: 1; }
        }
        @keyframes sheetSlideOutRight {
          0% { translate: 0 0; opacity: 1; }
          100% { translate: 100% 0; opacity: 0; }
        }
        @keyframes sheetSlideInLeft {
          0% { translate: -100% 0; opacity: 0.5; }
          100% { translate: 0 0; opacity: 1; }
        }
        @keyframes sheetSlideOutLeft {
          0% { translate: 0 0; opacity: 1; }
          100% { translate: -100% 0; opacity: 0; }
        }
        @keyframes sheetSlideInTop {
          0% { translate: 0 -100%; opacity: 0.5; }
          100% { translate: 0 0; opacity: 1; }
        }
        @keyframes sheetSlideOutTop {
          0% { translate: 0 0; opacity: 1; }
          100% { translate: 0 -100%; opacity: 0; }
        }
        @keyframes sheetSlideInBottom {
          0% { translate: 0 100%; opacity: 0.5; }
          100% { translate: 0 0; opacity: 1; }
        }
        @keyframes sheetSlideOutBottom {
          0% { translate: 0 0; opacity: 1; }
          100% { translate: 0 100%; opacity: 0; }
        }
        @media (min-width: 640px) {
          .sheet-gentle-right[data-state="open"] {
            animation: sheetSlideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .sheet-gentle-right[data-state="closed"] {
            animation: sheetSlideOutRight 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .sheet-gentle-left[data-state="open"] {
            animation: sheetSlideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .sheet-gentle-left[data-state="closed"] {
            animation: sheetSlideOutLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .sheet-gentle-top[data-state="open"] {
            animation: sheetSlideInTop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .sheet-gentle-top[data-state="closed"] {
            animation: sheetSlideOutTop 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .sheet-gentle-bottom[data-state="open"] {
            animation: sheetSlideInBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .sheet-gentle-bottom[data-state="closed"] {
            animation: sheetSlideOutBottom 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        }
      `}</style>
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
