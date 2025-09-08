# Component Migration Strategy: Custom Components → shadcn/ui

## Overview

This document outlines the strategy for gradually migrating from custom components to shadcn/ui components while maintaining functionality and preventing code breakage.

## Current Setup ✅

### Tailwind CSS v4
- ✅ Upgraded from v3.3.0 to v4.1.13
- ✅ Updated PostCSS configuration with `@tailwindcss/postcss`
- ✅ Maintained custom color scheme (brown/primary theme)
- ✅ Added shadcn/ui CSS variables while preserving existing colors

### shadcn/ui Integration
- ✅ Installed core dependencies: `clsx`, `tailwind-merge`, `class-variance-authority`
- ✅ Configured `components.json` with proper aliases
- ✅ Created `lib/utils.ts` with `cn` utility function
- ✅ Installed base components: Button, Input, Card, Dialog

### Component Analysis
- **58 TypeScript components** across well-organized folders
- **Common patterns**: Button, Typography, Modal, Input variants
- **Using**: Framer Motion, custom Tailwind classes, prop-based styling

## Migration Strategy

### Phase 1: Foundational Components (Week 1-2)

#### 1. Button Migration
**Current**: `components/Button/index.tsx`
- Custom variants: primary, outline, danger
- Custom sizes: large, small
- Framer Motion animations
- Custom styling props

**Target**: `components/ui/button.tsx` (shadcn/ui)
- Built-in variants: default, destructive, outline, secondary, ghost, link
- Built-in sizes: default, sm, lg, icon
- No animations (add separately if needed)

**Migration Approach**:
```typescript
// Create a compatibility layer
// components/Button/ShadcnButton.tsx
import { Button as ShadcnButton } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CompatButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  variant?: 'primary' | 'outline' | 'danger' | 'default' | 'secondary' | 'ghost'
  btnSize?: 'large' | 'small' | 'default'
  loading?: boolean
  clickHandler?: () => void
}

export const Button: React.FC<CompatButtonProps> = ({ 
  variant = 'default', 
  btnSize = 'default',
  loading,
  clickHandler,
  children,
  className,
  ...props 
}) => {
  // Map custom variants to shadcn variants
  const mappedVariant = variant === 'primary' ? 'default' : 
                       variant === 'danger' ? 'destructive' : variant
  
  // Map custom sizes to shadcn sizes  
  const mappedSize = btnSize === 'large' ? 'lg' : 
                    btnSize === 'small' ? 'sm' : 'default'

  return (
    <motion.div whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.98 }}>
      <ShadcnButton
        variant={mappedVariant}
        size={mappedSize}
        onClick={clickHandler}
        disabled={loading}
        className={cn(className)}
        {...props}
      >
        {loading ? "Loading..." : children}
      </ShadcnButton>
    </motion.div>
  )
}
```

#### 2. Input Components Migration
**Current Components**:
- `SearchInput/index.tsx`
- `EmailInput/index.tsx` 
- `PasswordInput/index.tsx`
- `DateInput/index.tsx`
- `NumberInput/index.tsx`
- etc.

**Target**: `components/ui/input.tsx` + custom wrappers

**Migration Approach**:
```typescript
// components/Input/SearchInput.tsx
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  setValue: (value: string) => void
  placeholder?: string
  className?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  setValue,
  placeholder,
  className
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn("pl-9", className)}
      />
    </div>
  )
}
```

#### 3. Typography Migration
**Current**: Custom Typography component with prop-based styling
**Target**: Maintain custom component but enhance with shadcn styling

**Migration Approach**:
```typescript
// components/Typography/index.tsx (Enhanced)
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      // Custom variants
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
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, children, ...props }, ref) => {
    const Comp = as || getDefaultElement(variant)
    return (
      <Comp
        className={cn(typographyVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
```

### Phase 2: Layout Components (Week 3-4)

#### 1. Modal → Dialog Migration
**Current**: `components/Modal/index.tsx` with Framer Motion
**Target**: `components/ui/dialog.tsx` (shadcn/ui)

#### 2. Card Components
**Current**: Custom card-like components
**Target**: `components/ui/card.tsx`

#### 3. Dashboard Components
- Migrate `DashboardTopCard` to use shadcn Card
- Update chart components with shadcn styling

### Phase 3: Form Components (Week 5-6)

#### 1. Advanced Input Components
- Color picker integration
- File upload components  
- Date picker with shadcn Calendar
- Dropdown components

#### 2. Form Validation
- Integrate with existing Formik/Yup setup
- Add React Hook Form support (optional)

### Phase 4: Complex Components (Week 7-8)

#### 1. Table Components
- Migrate customer tables, order tables
- Use shadcn Table components with sorting/filtering

#### 2. Navigation Components
- Update navigation with shadcn styling
- Maintain existing functionality

## Implementation Guidelines

### 1. Backward Compatibility
- Keep original components during migration
- Create compatibility layers that map old props to new components
- Use feature flags to switch between old/new components

### 2. Gradual Migration
```typescript
// Example migration flag system
const USE_SHADCN_BUTTON = process.env.NEXT_PUBLIC_USE_SHADCN_BUTTON === 'true'

export const Button = USE_SHADCN_BUTTON ? ShadcnButton : CustomButton
```

### 3. Style Consistency
- Maintain brown/primary color scheme
- Preserve existing spacing and typography
- Keep Framer Motion animations where important

### 4. Testing Strategy
- Test each migrated component in isolation
- Verify all existing functionality works
- Check responsive design on all breakpoints
- Validate accessibility improvements

## Benefits of Migration

### 1. Consistency
- Standardized component API across the app
- Consistent styling and behavior
- Better maintainability

### 2. Accessibility
- Built-in ARIA attributes
- Keyboard navigation support
- Screen reader compatibility

### 3. Developer Experience
- TypeScript-first approach
- Comprehensive documentation
- Active community support

### 4. Performance
- Optimized bundle size
- Tree-shaking support
- Better rendering performance

## Migration Timeline

```
Week 1-2: Button, Input, Typography components
Week 3-4: Modal/Dialog, Card, Layout components  
Week 5-6: Form components, validation
Week 7-8: Tables, navigation, complex components
Week 9: Testing, polish, cleanup
Week 10: Final migration, remove old components
```

## Risk Mitigation

1. **Feature Flags**: Enable gradual rollout
2. **Compatibility Layers**: Prevent breaking changes
3. **Comprehensive Testing**: Catch regressions early
4. **Documentation**: Keep migration notes for future reference
5. **Rollback Plan**: Ability to revert to old components if needed

## Next Steps

1. Start with Button component migration
2. Create compatibility layer template
3. Set up feature flag system
4. Begin testing with non-critical components
5. Document any issues and solutions

---

This migration strategy ensures a smooth transition while maintaining code stability and user experience.