import React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

// Enhanced Typography component that's backward compatible with existing props
// but also supports new shadcn/ui typography variants

const typographyVariants = cva("", {
  variants: {
    variant: {
      // shadcn/ui variants
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight", 
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      // Custom variants for compatibility
      body: "text-sm font-normal",
      caption: "text-xs text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

interface TypographyProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  
  // Legacy props for compatibility
  textSize?: string
  textWeight?: string
  textColor?: string
  horizontalPadding?: string
  verticalPadding?: string
  align?: string
}

const getDefaultElement = (variant: string | null | undefined): keyof JSX.IntrinsicElements => {
  switch (variant) {
    case 'h1': return 'h1'
    case 'h2': return 'h2'
    case 'h3': return 'h3'
    case 'h4': return 'h4'
    case 'blockquote': return 'blockquote'
    case 'list': return 'ul'
    default: return 'p'
  }
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ 
    className, 
    variant, 
    as, 
    children,
    // Legacy props
    textSize,
    textWeight,
    textColor,
    horizontalPadding,
    verticalPadding,
    align,
    ...props 
  }, ref) => {
    const Comp = as || getDefaultElement(variant)
    
    // Combine new variant classes with legacy prop classes
    const combinedClassName = cn(
      // New shadcn typography variants (take precedence)
      variant && typographyVariants({ variant }),
      // Legacy prop classes (fallback for existing usage)
      !variant && textSize,
      !variant && textWeight,
      !variant && textColor,
      horizontalPadding,
      verticalPadding,
      align,
      className
    )

    return (
      <Comp
        className={combinedClassName}
        ref={ref as any}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

Typography.displayName = "CompatTypography"

export default Typography