// Loading Add Product Template - Organism
// Loading state template for add product page

import React from 'react';
import { PageContainer } from '../atoms/page-container';
import { LoadingState } from '../atoms/loading-state';

interface LoadingAddProductTemplateProps {
  message?: string;
  className?: string;
}

export const LoadingAddProductTemplate: React.FC<
  LoadingAddProductTemplateProps
> = ({ message = 'Loading product form...', className = '' }) => {
  return (
    <PageContainer className={className}>
      <LoadingState message={message} size='lg' />
    </PageContainer>
  );
};
