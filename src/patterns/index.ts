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

// Dashboard Page - Individual Component Exports

// Atoms
export { MetricCard } from "./dashboard/atoms/metric-card";
export { ChartContainer } from "./dashboard/atoms/chart-container";
export { LoadingSkeleton } from "./dashboard/atoms/loading-skeleton";

// Molecules
export { MetricsSection } from "./dashboard/molecules/metrics-section";
export { ChartGrid } from "./dashboard/molecules/chart-grid";
export { AnalyticsGrid } from "./dashboard/molecules/analytics-grid";
export { RecentOrdersSection } from "./dashboard/molecules/recent-orders-section";

// Organisms
export { DashboardContent } from "./dashboard/organisms/dashboard-content";

// Templates
export { DashboardTemplate } from "./dashboard/templates/dashboard-template";
export { default as DashboardTemplateDefault } from "./dashboard/templates/dashboard-template";

// Customers Page - Individual Component Exports

// Atoms
export { CustomerStatusBadge } from "./customers/atoms/customer-status-badge";
export { CustomerAvatar } from "./customers/atoms/customer-avatar";
export { CustomerStatCard } from "./customers/atoms/customer-stat-card";
export { CustomerTableCell } from "./customers/atoms/customer-table-cell";

// Molecules
export { CustomerSearchFilter } from "./customers/molecules/customer-search-filter";
export { CustomerStatsSection } from "./customers/molecules/customer-stats-section";
export { CustomerTableRow } from "./customers/molecules/customer-table-row";
export { CustomerDetailsCard } from "./customers/molecules/customer-details-card";

// Organisms
export { CustomersTable } from "./customers/organisms/customers-table";
export { CustomerDetailsModal } from "./customers/organisms/customer-details-modal";

// Templates
export { CustomersPageTemplate } from "./customers/templates/customers-page-template";

// Orders Page - Individual Component Exports

// Atoms
export { OrderStatusBadge } from "./orders/atoms/order-status-badge";
export { PaymentStatusBadge } from "./orders/atoms/payment-status-badge";
export { OrderStatCard } from "./orders/atoms/order-stat-card";
export { OrderAmount } from "./orders/atoms/order-amount";

// Molecules
export { OrderSearchFilter } from "./orders/molecules/order-search-filter";
export { OrderStatsSection } from "./orders/molecules/order-stats-section";
export { OrderTableRow } from "./orders/molecules/order-table-row";
export { OrderDetailsCard } from "./orders/molecules/order-details-card";

// Organisms
export { OrdersTable } from "./orders/organisms/orders-table";
export { OrderDetailsModal } from "./orders/organisms/order-details-modal";

// Templates
export { OrdersPageTemplate } from "./orders/templates/orders-page-template";

// Products Page - Individual Component Exports

// Atoms
export { ProductStatusBadge } from "./products/atoms/product-status-badge";
export { ProductImage } from "./products/atoms/product-image";
export { ProductPrice } from "./products/atoms/product-price";
export { StockIndicator } from "./products/atoms/stock-indicator";

// Molecules
export { ProductSearchFilter } from "./products/molecules/product-search-filter";
export { ProductStatsSection } from "./products/molecules/product-stats-section";
export { ProductTableRow } from "./products/molecules/product-table-row";
export { ProductDetailsCard } from "./products/molecules/product-details-card";

// Organisms
export { ProductsTable } from "./products/organisms/products-table";
export { ProductDetailsModal } from "./products/organisms/product-details-modal";

// Templates
export { ProductsPageTemplate } from "./products/templates/products-page-template";

// Settings Page - Individual Component Exports

// Atoms
export { SettingsTabButton } from "./settings/atoms/settings-tab-button";
export { FormSectionHeader } from "./settings/atoms/form-section-header";

// Molecules
export { SettingsNavigation } from "./settings/molecules/settings-navigation";
export { CompanyDetailsForm } from "./settings/molecules/company-details-form";

// Organisms
export { SettingsContent } from "./settings/organisms/settings-content";

// Templates
export { SettingsTemplate } from "./settings/templates/settings-template";
export { default as SettingsTemplateDefault } from "./settings/templates/settings-template";

// Support Page - Individual Component Exports

// Molecules
export { SupportForm } from "./support/molecules/support-form";

// Templates
export { SupportTemplate } from "./support/templates/support-template";
export { default as SupportTemplateDefault } from "./support/templates/support-template";