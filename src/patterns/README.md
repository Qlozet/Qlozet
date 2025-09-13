# Atomic Design Patterns

This directory implements the Atomic Design methodology to structure components within the project.

## Structure

### Atomic Design Hierarchy

1. **Atoms** - Basic UI elements (Typography, Loader, Button, Input)
2. **Molecules** - Small functional components (DashboardTopCard, Modal, DropDown)
3. **Organisms** - Complex components (CustomerTable, OrderTable, RecentOrder)
4. **Templates** - Page-level layouts (DashboardTemplate, CustomersTemplate)
5. **Pages** - Final content views (actual page files in app directory)

### Directory Organization

```
patterns/
├── common/           # Shared components across multiple pages
│   ├── atoms/       # Basic shared UI elements
│   ├── molecules/   # Shared functional components
│   ├── organisms/   # Shared complex components
│   └── templates/   # Shared layout templates
├── dashboard/       # Dashboard page specific components
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── customers/       # Customers page specific components
├── orders/          # Orders page specific components
├── products/        # Products page specific components
├── settings/        # Settings page specific components
├── add/             # Add page specific components
└── [other-pages]/   # Other page specific components
```

## Usage Guidelines

### 1. Pure Pattern Approach
Patterns contain **only** compositions and templates, not re-exports of existing components.

### 2. Component Imports
- **Components**: Import directly from `@/components/*` 
- **UI Components**: Import directly from `@/components/ui/*` (shadcn/ui)
- **Patterns**: Import compositions and templates from `@/patterns/*`

### 3. Pattern Structure
- **Atoms**: Simple, reusable UI elements (form-error.tsx, form-success.tsx)
- **Molecules**: Pattern compositions combining multiple components (product-basic-info-form.tsx)
- **Organisms**: Complex pattern compositions (add-product-form.tsx, product-preview-modal.tsx)
- **Templates**: Complete page layout patterns with props interface (add-product-template.tsx)

### 3.1. File Naming Convention
- **All files use kebab-case naming**: `product-basic-info-form.tsx`, `add-product-template.tsx`
- **No index files**: Each component is in its own individual file
- **Component names match file names**: `ProductBasicInfoForm` in `product-basic-info-form.tsx`

### 4. Import Pattern
```typescript
// ✅ Correct - Import components directly
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import DashboardTopCard from "@/components/DashboardTopCard";

// ✅ Correct - Import UI components directly
import { Button as ShadcnButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ✅ Correct - Import pattern compositions and templates (individual files, kebab-case)
import { ProductBasicInfoForm } from "@/patterns/add/molecules/product-basic-info-form";
import { AddProductTemplate } from "@/patterns/add/templates/add-product-template";
import { ProductFormContainer } from "@/patterns/add/organisms/product-form-container";

// ✅ Correct - Import from main patterns index (recommended)
import { ProductBasicInfoForm, AddProductTemplate, ProductFormContainer } from "@/patterns";

// ❌ Incorrect - Don't import components from patterns
// import { Typography } from "@/patterns/common/atoms"; // This doesn't exist
// ❌ Incorrect - No index files exist in individual folders
// import { ProductBasicInfoForm } from "@/patterns/add/molecules"; // No index file
```

## Implementation Status

### Completed Pages
- ✅ Dashboard - Full atomic structure created
- ✅ Customers - Full atomic structure created  
- ✅ Orders - Full atomic structure created
- ✅ Products - Full atomic structure created
- ✅ Add - Full atomic structure created
- ✅ Settings - Full atomic structure created

### Pending Pages
- 🔄 Details - Needs analysis and structure creation
- 🔄 Notification - Needs analysis and structure creation
- 🔄 Product-details - Needs analysis and structure creation
- 🔄 Support - Needs analysis and structure creation
- 🔄 Wallet - Needs analysis and structure creation

## Migration Strategy

1. **Analysis Phase** - Review each page's component usage
2. **Categorization** - Sort components by atomic design level
3. **Common Extraction** - Move shared components to common directory
4. **Structure Creation** - Create atomic folders and reference files
5. **Template Development** - Develop reusable page templates
6. **Implementation** - Gradually migrate pages to use pattern imports

## Benefits

- **Clear Separation** - Components vs patterns have distinct purposes
- **No Duplication** - Components exist in one place only
- **Better Composition** - Patterns focus on layout and behavior composition
- **Maintainability** - Changes to components don't affect pattern structure
- **True Atomic Design** - Patterns represent actual design compositions, not aliases