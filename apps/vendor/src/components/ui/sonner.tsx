import React from 'react';
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      duration={5000}
      gap={12}
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast " +
            "!bg-white dark:!bg-slate-900 " +
            "!text-slate-950 dark:!text-slate-50 " +
            "!font-poppins " +
            "!border-none " +
            "!shadow-[0px_8px_24px_rgba(0,0,0,0.08)] dark:!shadow-[0px_8px_24px_rgba(0,0,0,0.4)] " +
            "!backdrop-blur-md !rounded-lg " +
            "!px-4 !py-3.5 !pr-10 " +
            "!ring-1 !ring-slate-950/5 dark:!ring-slate-50/10 " +
            "!transition-all !duration-300 !ease-out " +
            "hover:!shadow-[0px_12px_32px_rgba(0,0,0,0.12)] dark:hover:!shadow-[0px_12px_32px_rgba(0,0,0,0.6)] " +
            "hover:!-translate-y-0.5 " +
            "!min-w-[360px] !max-w-[420px] " +
            "!overflow-visible !relative " +
            "before:!content-[''] before:!absolute before:!left-0 before:!top-0 before:!h-full before:!w-1 " +
            "before:!rounded-l-lg before:!pointer-events-none before:!transition-none",

          title:
            "!text-[15px] !font-medium !tracking-tight " +
            "!text-slate-900 dark:!text-slate-50 " +
            "!leading-tight",

          description:
            "!text-[13px] !leading-relaxed " +
            "!text-slate-600 dark:!text-slate-400 " +
            "!font-normal mt-1",

          actionButton:
            "!bg-primary dark:!bg-primary " +
            "!text-primary-foreground dark:!text-primary-foreground " +
            "!font-medium !text-[13px] " +
            "!px-3.5 !py-1.5 !rounded-md !h-8 " +
            "!transition-all !duration-200 !ease-out " +
            "hover:!bg-primary/90 dark:hover:!bg-primary/90 " +
            "hover:!scale-[1.02] active:!scale-[0.98] " +
            "!shadow-sm !ring-1 " +
            "!ring-slate-950/10 dark:!ring-slate-50/10 " +
            "!ml-auto !mt-2",

          cancelButton:
            "!bg-slate-100 dark:!bg-slate-800 " +
            "!text-slate-700 dark:!text-slate-300 " +
            "!font-medium !text-[13px] " +
            "!px-3.5 !py-1.5 !rounded-md !h-8 " +
            "!transition-all !duration-200 !ease-out " +
            "hover:!bg-slate-200 dark:hover:!bg-slate-700 " +
            "hover:!scale-[1.02] active:!scale-[0.98] " +
            "!mr-2 !mt-2",

          closeButton:
            "!absolute !-right-2 !top-2 !left-auto !bottom-auto " +
            "!bg-slate-100 dark:!bg-slate-800 " +
            "!text-slate-600 dark:!text-slate-400 " +
            "!border-none !rounded-md " +
            "!w-6 !h-6 !p-0 !m-0 " +
            "!flex !items-center !justify-center " +
            // "!transition-all !duration-200 !ease-out " +
            // "hover:!bg-slate-200 dark:hover:!bg-slate-700 " +
            // "hover:!text-slate-900 dark:hover:!text-slate-100 " +
            // "hover:!rotate-90 " +
            // "active:!scale-90 " +
            "!opacity-100 !z-10 " +
            "group-data-[type=success]:!bg-emerald-100 dark:group-data-[type=success]:!bg-emerald-900/50 " +
            "group-data-[type=success]:!text-emerald-700 dark:group-data-[type=success]:!text-emerald-400 " +
            "group-data-[type=success]:hover:!bg-emerald-200 dark:group-data-[type=success]:hover:!bg-emerald-900/70 " +
            "group-data-[type=error]:!bg-red-100 dark:group-data-[type=error]:!bg-red-900/50 " +
            "group-data-[type=error]:!text-red-700 dark:group-data-[type=error]:!text-red-400 " +
            "group-data-[type=error]:hover:!bg-red-200 dark:group-data-[type=error]:hover:!bg-red-900/70 " +
            "group-data-[type=warning]:!bg-amber-100 dark:group-data-[type=warning]:!bg-amber-900/50 " +
            "group-data-[type=warning]:!text-amber-700 dark:group-data-[type=warning]:!text-amber-400 " +
            "group-data-[type=warning]:hover:!bg-amber-200 dark:group-data-[type=warning]:hover:!bg-amber-900/70 " +
            "group-data-[type=info]:!bg-blue-100 dark:group-data-[type=info]:!bg-blue-900/50 " +
            "group-data-[type=info]:!text-blue-700 dark:group-data-[type=info]:!text-blue-400 " +
            "group-data-[type=info]:hover:!bg-blue-200 dark:group-data-[type=info]:hover:!bg-blue-900/70",

          success:
            "!bg-gradient-to-br !from-emerald-50/90 !via-teal-50/80 !to-emerald-50/90 " +
            "dark:!from-emerald-950/30 dark:!via-teal-950/25 dark:!to-emerald-950/30 " +
            "!border-emerald-300/60 dark:!border-emerald-800/60 " +
            "!ring-emerald-500/20 dark:!ring-emerald-400/20 " +
            "before:!bg-gradient-to-b before:!from-emerald-500 before:!to-teal-500",

          error:
            "!bg-gradient-to-br !from-red-50/90 !via-rose-50/80 !to-red-50/90 " +
            "dark:!from-red-950/30 dark:!via-rose-950/25 dark:!to-red-950/30 " +
            "!border-red-300/60 dark:!border-red-800/60 " +
            "!ring-red-500/20 dark:!ring-red-400/20 " +
            "before:!bg-gradient-to-b before:!from-red-500 before:!to-rose-500",

          warning:
            "!bg-gradient-to-br !from-amber-50/90 !via-orange-50/80 !to-amber-50/90 " +
            "dark:!from-amber-950/30 dark:!via-orange-950/25 dark:!to-amber-950/30 " +
            "!border-amber-300/60 dark:!border-amber-800/60 " +
            "!ring-amber-500/20 dark:!ring-amber-400/20 " +
            "before:!bg-gradient-to-b before:!from-amber-500 before:!to-orange-500",

          info:
            "!bg-gradient-to-br !from-blue-50/90 !via-cyan-50/80 !to-blue-50/90 " +
            "dark:!from-blue-950/30 dark:!via-cyan-950/25 dark:!to-blue-950/30 " +
            "!border-blue-300/60 dark:!border-blue-800/60 " +
            "!ring-blue-500/20 dark:!ring-blue-400/20 " +
            "before:!bg-gradient-to-b before:!from-blue-500 before:!to-cyan-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
