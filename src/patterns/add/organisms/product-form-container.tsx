// Product Form Container - Organism
// Container component that provides context for the product form

import React from "react";
import { AddProductForm } from "./add-product-form";

interface ProductFormContainerProps {
  onProductAdded?: (product: any) => void;
  className?: string;
}

export const ProductFormContainer: React.FC<ProductFormContainerProps> = ({ 
  onProductAdded,
  className = "" 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <AddProductForm onProductAdded={onProductAdded} />
    </div>
  );
};