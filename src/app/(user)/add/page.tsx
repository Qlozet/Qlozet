'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AddProductTemplate from '@/patterns/add/templates/add-product-template';
import toast from 'react-hot-toast';

const AddProduct: React.FC = () => {
  const router = useRouter();

  const handleProductAdded = async (productData: any) => {
    try {
      // Here you would typically make an API call to save the product
      console.log('Product data to save:', productData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      toast.success('Product added successfully!');

      // Redirect to products page or product detail
      router.push('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product. Please try again.');
      throw error; // Re-throw to let the form handle it
    }
  };

  return (
    <AddProductTemplate
      onProductAdded={handleProductAdded}
      backUrl='/products'
      title='Add New Product'
      subtitle='Create and configure a new product for your store'
    />
  );
};

export default AddProduct;

/* 
OLD IMPLEMENTATION REMOVED - NOW USES ATOMIC DESIGN TEMPLATE

This page previously contained ~1500+ lines of complex form logic including:
- Multiple useState hooks for form data, variants, customizations, images
- Complex validation schemas with Yup
- File upload handling with drag & drop
- Modal state management for customization options
- Direct component imports and complex layout logic
- Manual form submission and API integration

Now simplified to use the AddProductTemplate which encapsulates all this functionality
in a clean, reusable atomic design pattern.

Benefits of the new approach:
1. Single responsibility - page only handles routing and success callbacks
2. Reusable - template can be used in other contexts (admin, mobile, etc.)
3. Testable - complex logic is isolated in the template and organisms
4. Maintainable - changes to form logic don't affect page structure
5. Consistent - follows established atomic design patterns

The template composition includes:
- ProductFormContainer (organism) - handles all form state and validation
- ProductBasicInfoForm (molecule) - basic product information section
- ProductVariantsSection (molecule) - product variants and specifications
- ProductCustomizationSection (molecule) - customization options
- ProductImagesSection (molecule) - image upload and preview

All original functionality is preserved through the atomic design patterns.
*/
