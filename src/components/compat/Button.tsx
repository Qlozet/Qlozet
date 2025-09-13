import React from "react"
import { Button as ShadcnButton } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ButtonProps as ShadcnButtonProps } from "@/components/ui/button"

// Compatibility interface that maps old props to new ones
interface CompatButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'outline' | 'danger' | 'default' | 'secondary' | 'ghost' | 'link'
  btnSize?: 'large' | 'small' | 'default'
  loading?: boolean
  clickHandler?: (event: React.MouseEvent<HTMLButtonElement>) => void
  maxWidth?: string
  minWidth?: string
  paddingVertical?: string
}

export const Button = React.forwardRef<HTMLButtonElement, CompatButtonProps>(
  ({
    variant = 'default',
    btnSize = 'default',
    loading = false,
    clickHandler,
    children,
    className,
    maxWidth,
    minWidth,
    paddingVertical,
    disabled,
    ...props
  }, ref) => {
    // Map custom variants to shadcn variants
    const mappedVariant = variant === 'primary' ? 'default' :
      variant === 'danger' ? 'destructive' :
        variant as any

    // Map custom sizes to shadcn sizes  
    const mappedSize = btnSize === 'large' ? 'lg' :
      btnSize === 'small' ? 'sm' :
        'default'

    // Combine custom styling with shadcn classes
    const combinedClassName = cn(
      maxWidth && maxWidth,
      minWidth && minWidth,
      paddingVertical && paddingVertical,
      className
    )

    const ButtonComponent = (
      <ShadcnButton
        ref={ref}
        variant={mappedVariant}
        size={mappedSize}
        onClick={clickHandler}
        disabled={loading || disabled}
        className={combinedClassName}
        {...props}
      >
        {loading ? "Loading..." : children}
      </ShadcnButton>
    )

    // Add Framer Motion animations if needed
    return (
      <motion.div
        whileHover={{ scale: 0.98, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        className="inline-block"
      >
        {ButtonComponent}
      </motion.div>
    )
  }
)

Button.displayName = "CompatButton"

export default Button