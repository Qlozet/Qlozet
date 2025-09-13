// Add Product With Actions Template - Organism
// Template with custom header actions and dashboard back URL

import React from "react";
import { PageContainer } from "../atoms/page-container";
import { PageHeader } from "../molecules/page-header";
import { ContentWrapper } from "../molecules/content-wrapper";
import { ProductFormContainer } from "./product-form-container";

interface AddProductWithActionsTemplateProps {
  onProductAdded?: (product: any) => void;
  headerActions?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AddProductWithActionsTemplate: React.FC<AddProductWithActionsTemplateProps> = ({ 
  onProductAdded, 
  headerActions, 
  title = "Add New Product",
  subtitle = "Create a new product for your inventory",
  className = ""
}) => {
  return (
    <PageContainer className={className}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        showBackButton={true}
        backUrl="/dashboard"
        headerActions={headerActions}
      />
      
      <ContentWrapper useCard={true}>
        <ProductFormContainer onProductAdded={onProductAdded} />
      </ContentWrapper>
    </PageContainer>
  );
};