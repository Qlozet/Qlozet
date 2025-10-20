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
      // expand={true}
      // richColors
      // closeButton
      duration={6000}
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-white dark:!bg-slate-900 " +
            "!text-slate-950 dark:!text-slate-50 " +
            "!font-dmsans " +
            "!border !border-slate-200 dark:!border-slate-800 " +
            "!shadow-xl !shadow-slate-200/50 dark:!shadow-slate-950/50 " +
            "!backdrop-blur-sm !rounded-[8px] " +
            "!px-5 !py-4 " +
            "!ring-1 !ring-slate-950/5 dark:!ring-slate-50/5 " +
            "!transition-all !duration-300 " +
            "hover:!scale-[1.02] hover:!shadow-2xl",

          title:
            "!text-sm !font-medium " +
            "!text-slate-900 dark:!text-slate-100 " +
            "!mb-1",

          description:
            "!text-sm !leading-relaxed " +
            "!text-slate-600 dark:!text-slate-400 " +
            "!font-normal",

          actionButton:
            "!bg-slate-900 dark:!bg-slate-100 " +
            "!text-slate-50 dark:!text-slate-900 " +
            "!font-medium !text-sm " +
            "!px-4 !py-2 !rounded-lg " +
            "!transition-all !duration-200 " +
            "hover:!bg-slate-800 dark:hover:!bg-slate-200 " +
            "hover:!scale-105 active:!scale-95 " +
            "!shadow-sm !ring-1 " +
            "!ring-slate-950/10 dark:!ring-slate-50/10",

          cancelButton:
            "!bg-slate-100 dark:!bg-slate-800 " +
            "!text-slate-700 dark:!text-slate-300 " +
            "!font-medium !text-sm " +
            "!px-4 !py-2 !rounded-lg " +
            "!transition-all !duration-200 " +
            "hover:!bg-slate-200 dark:hover:!bg-slate-700 " +
            "hover:!scale-105 active:!scale-95",

          closeButton:
            "!bg-slate-100 dark:!bg-slate-800 " +
            "!text-slate-500 dark:!text-slate-400 " +
            "!border-none !rounded-lg " +
            "!transition-all !duration-200 " +
            "hover:!bg-slate-200 dark:hover:!bg-slate-700 " +
            "hover:!text-slate-900 dark:hover:!text-slate-100 " +
            "hover:!scale-110 active:!scale-95 " +
            "group-data-[type=success]:!bg-emerald-100 dark:group-data-[type=success]:!bg-emerald-900/30 " +
            "group-data-[type=success]:!text-emerald-700 dark:group-data-[type=success]:!text-emerald-400 " +
            "group-data-[type=success]:hover:!bg-emerald-200 dark:group-data-[type=success]:hover:!bg-emerald-900/50 " +
            "group-data-[type=error]:!bg-red-100 dark:group-data-[type=error]:!bg-red-900/30 " +
            "group-data-[type=error]:!text-red-700 dark:group-data-[type=error]:!text-red-400 " +
            "group-data-[type=error]:hover:!bg-red-200 dark:group-data-[type=error]:hover:!bg-red-900/50 " +
            "group-data-[type=warning]:!bg-amber-100 dark:group-data-[type=warning]:!bg-amber-900/30 " +
            "group-data-[type=warning]:!text-amber-700 dark:group-data-[type=warning]:!text-amber-400 " +
            "group-data-[type=warning]:hover:!bg-amber-200 dark:group-data-[type=warning]:hover:!bg-amber-900/50 " +
            "group-data-[type=info]:!bg-blue-100 dark:group-data-[type=info]:!bg-blue-900/30 " +
            "group-data-[type=info]:!text-blue-700 dark:group-data-[type=info]:!text-blue-400 " +
            "group-data-[type=info]:hover:!bg-blue-200 dark:group-data-[type=info]:hover:!bg-blue-900/50",

          success:
            "!bg-gradient-to-br !from-emerald-50 !to-teal-50 " +
            "dark:!from-emerald-950/20 dark:!to-teal-950/20 " +
            "!border-emerald-200 dark:!border-emerald-900/50 " +
            "!ring-emerald-500/10",

          error:
            "!bg-gradient-to-br !from-red-50 !to-rose-50 " +
            "dark:!from-red-950/20 dark:!to-rose-950/20 " +
            "!border-red-200 dark:!border-red-900/50 " +
            "!ring-red-500/10",

          warning:
            "!bg-gradient-to-br !from-amber-50 !to-orange-50 " +
            "dark:!from-amber-950/20 dark:!to-orange-950/20 " +
            "!border-amber-200 dark:!border-amber-900/50 " +
            "!ring-amber-500/10",

          info:
            "!bg-gradient-to-br !from-blue-50 !to-cyan-50 " +
            "dark:!from-blue-950/20 dark:!to-cyan-950/20 " +
            "!border-blue-200 dark:!border-blue-900/50 " +
            "!ring-blue-500/10",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
