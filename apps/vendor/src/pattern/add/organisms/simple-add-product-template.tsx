// Simple Add Product Template - Organism
// Simplified version of add product template without back button and card layout

import React from 'react';
import { PageContainer } from '../atoms/page-container';
import { PageHeader } from '../molecules/page-header';
import { ContentWrapper } from '../molecules/content-wrapper';
import { ProductFormContainer } from './product-form-container';

interface SimpleAddProductTemplateProps {
  onProductAdded?: (product: any) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const SimpleAddProductTemplate: React.FC<
  SimpleAddProductTemplateProps
> = ({
  onProductAdded,
  className = '',
  title = 'Add Product',
  subtitle = '',
}) => {
  return (
    <PageContainer backgroundColor='white' className={className}>
      <PageHeader title={title} subtitle={subtitle} showBackButton={false} />

      <ContentWrapper useCard={false}>
        <ProductFormContainer onProductAdded={onProductAdded} />
      </ContentWrapper>
    </PageContainer>
  );
};
