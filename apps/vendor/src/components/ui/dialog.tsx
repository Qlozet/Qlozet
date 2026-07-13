'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import AnimatedContent from './animated-content';
import { CloseSquareIcon } from '@/pattern/common/atoms/close-square-icon';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[99999999px] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Mobile: floating bottom sheet
        "fixed z-50 grid w-[calc(100%-32px)] gap-4 border bg-background p-6 shadow-lg rounded-[16px]",
        "bottom-4 left-4 right-4 max-h-[85vh] overflow-y-auto",
        "dialog-mobile-anim",
        // sm+: centered dialog
        "sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:w-full sm:max-h-none sm:overflow-visible sm:rounded-[16px]",
        "sm:dialog-gentle-anim",
        className
      )}
      {...props}
    >
      <style>{`
        /* Mobile: slide up from bottom */
        @media (max-width: 639px) {
          .dialog-mobile-anim[data-state="open"] {
            animation: dialogSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .dialog-mobile-anim[data-state="closed"] {
            animation: dialogSlideDown 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
          }
        }
        @keyframes dialogSlideUp {
          0% { opacity: 0; translate: 0 100%; }
          100% { opacity: 1; translate: 0 0; }
        }
        @keyframes dialogSlideDown {
          0% { opacity: 1; translate: 0 0; }
          100% { opacity: 0; translate: 0 100%; }
        }
        /* Desktop: gentle scale */
        @media (min-width: 640px) {
          .dialog-mobile-anim[data-state="open"],
          .dialog-gentle-anim[data-state="open"] {
            animation: dialogGentleIn 0.25s cubic-bezier(0, 0, 0.2, 1) forwards;
          }
          .dialog-mobile-anim[data-state="closed"],
          .dialog-gentle-anim[data-state="closed"] {
            animation: dialogGentleOut 0.15s cubic-bezier(0.4, 0, 1, 1) forwards;
          }
        }
        @keyframes dialogGentleIn {
          0% { opacity: 0; scale: 0.97; }
          100% { opacity: 1; scale: 1; }
        }
        @keyframes dialogGentleOut {
          0% { opacity: 1; scale: 1; }
          100% { opacity: 0; scale: 0.97; }
        }
      `}</style>
      {children}
      <DialogPrimitive.Close className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary'>
        <X className='h-4 w-4' />
        <span className='sr-only'>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
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
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
