// Atomic Design Patterns - Main Index
// Central export for pattern compositions and templates only

// Add Page - Individual Component Exports

// Atoms
export { FormError } from "./add/atoms/form-error";
export { FormSuccess } from "./add/atoms/form-success";
export { LoadingState } from "./add/atoms/loading-state";
export { PageContainer } from "./add/atoms/page-container";

// Molecules
export { ProductBasicInfoForm } from "./add/molecules/product-basic-info-form";
export { ProductVariantsSection } from "./add/molecules/product-variants-section";
export { ProductCustomizationSection } from "./add/molecules/product-customization-section";
export { ProductImagesSection } from "./add/molecules/product-images-section";
export { PageHeader } from "./add/molecules/page-header";
export { ContentWrapper } from "./add/molecules/content-wrapper";

// Organisms
export { AddProductForm } from "./add/organisms/add-product-form";
export { ProductPreviewModal } from "./add/organisms/product-preview-modal";
export { ProductFormContainer } from "./add/organisms/product-form-container";
export { SimpleAddProductTemplate } from "./add/organisms/simple-add-product-template";
export { AddProductWithActionsTemplate } from "./add/organisms/add-product-with-actions-template";
export { LoadingAddProductTemplate } from "./add/organisms/loading-add-product-template";

// Templates
export { default as AddProductTemplate, SimpleAddProductTemplate as SimpleAddProductTemplateAlias, AddProductWithActionsTemplate as AddProductWithActionsTemplateAlias, LoadingAddProductTemplate as LoadingAddProductTemplateAlias } from "./add/templates/add-product-template";

// Dashboard Page - Template Only (keeping existing structure for now)
export * from "./dashboard/molecules";  
export * from "./dashboard/organisms";
export { default as DashboardTemplate } from "./dashboard/templates/dashboard-template";

// Customers Page - Template Only (keeping existing structure for now)
export * from "./customers/molecules";
export * from "./customers/organisms"; 
export { default as CustomersTemplate } from "./customers/templates/customers-template";

// Orders Page - Template Only (keeping existing structure for now)
export * from "./orders/molecules";
export * from "./orders/organisms";
export { default as OrdersTemplate } from "./orders/templates/orders-template";

// Products Page - Template Only (keeping existing structure for now)
export * from "./products/molecules";
export * from "./products/organisms";
export { default as ProductsTemplate } from "./products/templates/products-template";

// Settings Page - Template Only (keeping existing structure for now)
export * from "./settings/molecules";
export * from "./settings/organisms";
export { default as SettingsTemplate } from "./settings/templates/settings-template";