// Add Product Page - Template
// Page-level layout structure for adding products

import React from "react";
import { PageContainer } from "../atoms/page-container";
import { LoadingState } from "../atoms/loading-state";
import { PageHeader } from "../molecules/page-header";
import { ContentWrapper } from "../molecules/content-wrapper";
import { ProductFormContainer } from "../organisms/product-form-container";

interface AddProductTemplateProps {
  /** Whether the page is in a loading state */
  loading?: boolean;
  /** Callback when a product is successfully added */
  onProductAdded?: (product: any) => void;
  /** Custom page title */
  title?: string;
  /** Custom subtitle/description */
  subtitle?: string;
  /** Whether to show the back button */
  showBackButton?: boolean;
  /** Custom back button URL */
  backUrl?: string;
  /** Additional header actions */
  headerActions?: React.ReactNode;
  /** Whether to use a card layout for the form */
  useCardLayout?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

const AddProductTemplate: React.FC<AddProductTemplateProps> = ({
  loading = false,
  onProductAdded,
  title = "Add New Product",
  subtitle = "Create a new product for your inventory",
  showBackButton = true,
  backUrl = "/products",
  headerActions,
  useCardLayout = true,
  className = "",
}) => {
  if (loading) {
    return (
      <PageContainer className={className}>
        <LoadingState message="Loading..." size="lg" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={className}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        backUrl={backUrl}
        headerActions={headerActions}
      />
      
      <ContentWrapper useCard={useCardLayout}>
        <ProductFormContainer onProductAdded={onProductAdded} />
      </ContentWrapper>
    </PageContainer>
  );
};

export default AddProductTemplate;

// Template props interface export for reuse
export type { AddProductTemplateProps };