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

### 1. Common Components
Components used across multiple pages are placed in `patterns/common/` and organized by atomic level.

### 2. Page-Specific Components
Components used only in one page are organized under that page's directory.

### 3. Component References
- Components in `components/ui/` remain unchanged (shadcn/ui library)
- Components in `components/` are referenced through the patterns system
- Public assets remain in their original location

### 4. Import Pattern
```typescript
// From patterns system
import { Typography, Loader } from "@/patterns/common/atoms";
import { DashboardTopCard } from "@/patterns/common/molecules";
import { DashboardTemplate } from "@/patterns/dashboard/templates";

// Direct imports for UI components remain the same
import { Button } from "@/components/ui/button";
```

## Implementation Status

### Completed Pages
- ✅ Dashboard - Full atomic structure created
- ✅ Customers - Full atomic structure created  
- ✅ Orders - Partial atomic structure created

### Pending Pages
- 🔄 Products - Needs analysis and structure creation
- 🔄 Settings - Needs analysis and structure creation
- 🔄 Add - Needs analysis and structure creation
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

- **Better Organization** - Clear component hierarchy
- **Reusability** - Easy identification of shared components
- **Maintainability** - Atomic structure makes changes predictable
- **Scalability** - New pages can easily adopt existing patterns
- **Consistency** - Atomic design ensures UI consistency