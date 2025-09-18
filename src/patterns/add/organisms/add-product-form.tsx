// Add Product Form - Organism
// Complete product creation form with validation and submission

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  completeProductSchema,
  CompleteProductData,
  createDefaultProductData,
  transformFormDataToApiData,
} from '@/lib/validations/product';
import {
  useCreateProductMutation,
  useGetCategoriesQuery,
  useUploadProductImagesMutation,
  CreateProductRequest,
} from '@/redux/services/products/products.api-slice';
import { ProductBasicInfoForm } from '../molecules/product-basic-info-form';
import { ProductVariantsSection } from '../molecules/product-variants-section';
import { ProductCustomizationSection } from '../molecules/product-customization-section';
import { ProductImagesSection } from '../molecules/product-images-section';
import { ProductPreviewModal } from './product-preview-modal';
import { show } from '@ebay/nice-modal-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Typography from '@/components/compat/Typography';
import { Separator } from '@/components/ui/separator';

interface AddProductFormProps {
  onProductAdded?: (product: any) => void;
  onCancel?: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  onProductAdded,
  onCancel,
}) => {
  // RTK Query hooks
  const [createProduct, { isLoading: isSubmitting }] =
    useCreateProductMutation();
  const { data: categories = [], isLoading: loadingCategories } =
    useGetCategoriesQuery();
  const [uploadImages, { isLoading: isUploading }] =
    useUploadProductImagesMutation();

  // Local state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // React Hook Form setup
  const form = useForm<CompleteProductData>({
    resolver: zodResolver(completeProductSchema),
    defaultValues: createDefaultProductData(),
    mode: 'onChange',
  });

  // Handle file upload
  const handleFileUpload = async (files: File[]): Promise<void> => {
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const result = await uploadImages(formData).unwrap();

      // Add uploaded URLs to form
      const currentImages = form.getValues('images') || [];
      const updatedImages = [...currentImages, ...result.urls];
      form.setValue('images', updatedImages);

      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.');
      throw error;
    }
  };

  // Handle form submission
  const onSubmit = async (data: CompleteProductData) => {
    try {
      // Transform form data for API
      const transformedData = transformFormDataToApiData(data);

      // Validate required fields
      if (
        !transformedData.name ||
        !transformedData.category ||
        !transformedData.price ||
        transformedData.images.length === 0
      ) {
        toast.error(
          'Please fill in all required fields and add at least one image.'
        );
        return;
      }

      // Create the product
      const productData: CreateProductRequest = {
        name: transformedData.name,
        description: transformedData.description || '',
        category: transformedData.category,
        price: transformedData.price,
        stock: transformedData.stock,
        status: transformedData.status,
        images: transformedData.images,
        variants: transformedData.variants,
        customizations: transformedData.customizations,
        tags: transformedData.tags,
      };

      const result = await createProduct(productData).unwrap();

      toast.success('Product added successfully!');

      // Reset form
      form.reset(createDefaultProductData());
      setSelectedFiles([]);

      // Call callback
      if (onProductAdded) {
        onProductAdded(result);
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to create product. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle preview
  const handlePreview = () => {
    const formData = form.getValues();
    show(ProductPreviewModal, {
      productData: formData,
      categories,
      selectedFiles,
    });
  };

  // Check if form is valid and has required data
  const formData = form.watch();
  const isFormValid =
    form.formState.isValid &&
    formData.name &&
    formData.category &&
    formData.price > 0 &&
    (formData.images?.length > 0 || selectedFiles.length > 0);

  const hasUnsavedImages = selectedFiles.length > 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='max-w-4xl mx-auto space-y-6'
      >
        {/* Header */}
        <div className='mb-8'>
          <Typography
            variant='h1'
            className='text-2xl font-bold text-gray-900 mb-2'
          >
            Add New Product
          </Typography>
          <Typography variant='body1' className='text-gray-600'>
            Fill in the details below to add a new product to your inventory.
          </Typography>
        </div>

        <Separator className='mb-8' />

        {/* Basic Information Section */}
        <ProductBasicInfoForm
          form={form}
          categories={categories}
          loadingCategories={loadingCategories}
        />

        {/* Product Images Section */}
        <ProductImagesSection
          form={form}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          isUploading={isUploading}
          onUploadFiles={handleFileUpload}
        />

        {/* Variants Section */}
        <ProductVariantsSection form={form} />

        {/* Customization Section */}
        <ProductCustomizationSection form={form} />

        <Separator className='mb-8' />

        {/* Form Actions */}
        <div className='flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 p-6 rounded-lg'>
          <div className='text-sm text-gray-600'>
            {!isFormValid && (
              <Typography variant='caption' className='text-red-600'>
                Please fill in all required fields and add at least one image
              </Typography>
            )}
            {hasUnsavedImages && (
              <Typography variant='caption' className='text-amber-600 block'>
                You have {selectedFiles.length} unsaved image(s). They will be
                uploaded when you submit.
              </Typography>
            )}
          </div>

          <div className='flex gap-3'>
            {onCancel && (
              <Button
                type='button'
                variant='outline'
                onClick={onCancel}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
            )}

            <Button
              type='button'
              variant='outline'
              onClick={handlePreview}
              disabled={!form.watch('name') || isSubmitting || isUploading}
            >
              Preview
            </Button>

            <Button
              type='submit'
              disabled={!isFormValid || isSubmitting || isUploading}
              className='min-w-[120px]'
            >
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
