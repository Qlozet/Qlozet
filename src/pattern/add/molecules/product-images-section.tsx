// Product Images Section - Molecule
// Form composition for product image upload and management

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CompleteProductData } from '@/lib/validations/product';
import Typography from '@/components/compat/Typography';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, X } from 'lucide-react';
import DragDrop from '@/components/DragandDrop/ind';

interface ProductImagesSectionProps {
  form: UseFormReturn<CompleteProductData>;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  isUploading: boolean;
  onUploadFiles: (files: File[]) => Promise<void>;
}

export const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({
  form,
  selectedFiles,
  setSelectedFiles,
  isUploading,
  onUploadFiles,
}) => {
  const images = form.watch('images') || [];

  const handleFileSelect = async (files: File[]) => {
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Auto-upload if desired
    if (newFiles.length > 0) {
      try {
        await onUploadFiles(newFiles);
        setSelectedFiles([]); // Clear selected files after upload
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    const currentImages = form.getValues('images') || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    form.setValue('images', updatedImages);
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <Typography
          variant='h3'
          className='text-lg font-semibold text-gray-900'
        >
          Product Images
        </Typography>
        <Typography variant='body2' className='text-gray-600'>
          Upload high-quality images of your product. The first image will be
          used as the main product image.
        </Typography>
      </CardHeader>
      <CardContent className='space-y-4'>
        <DragDrop
          onFileSelect={handleFileSelect}
          accept='image/*'
          multiple
          maxSize={5 * 1024 * 1024} // 5MB
        />

        {selectedFiles.length > 0 && (
          <div>
            <Typography className='font-medium mb-2'>
              Selected Files ({selectedFiles.length})
            </Typography>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
              {selectedFiles.map((file, index) => (
                <div key={index} className='relative group'>
                  <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <Button
                    type='button'
                    onClick={() => removeFile(index)}
                    variant='ghost'
                    size='sm'
                    className='absolute top-1 right-1 bg-red-600 text-white hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                  <Typography
                    variant='caption'
                    className='text-xs text-gray-600 mt-1 truncate'
                  >
                    {file.name}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div>
            <Typography className='font-medium mb-2'>
              Uploaded Images ({images.length})
            </Typography>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
              {images.map((imageUrl, index) => (
                <div key={index} className='relative group'>
                  <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                    <img
                      src={imageUrl}
                      alt={`Uploaded ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <Button
                    type='button'
                    onClick={() => removeUploadedImage(index)}
                    variant='ghost'
                    size='sm'
                    className='absolute top-1 right-1 bg-red-600 text-white hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='h-3 w-3' />
                  </Button>
                  {index === 0 && (
                    <Badge className='absolute bottom-1 left-1 text-xs'>
                      Main
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isUploading && (
          <div className='flex items-center justify-center py-4'>
            <Loader size='sm' />
            <Typography className='ml-2'>Uploading images...</Typography>
          </div>
        )}

        <div className='mt-4'>
          <label className='text-sm font-medium mb-2 block'>
            Alternative Upload
          </label>
          <Input
            type='file'
            accept='image/*'
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleFileSelect(Array.from(files));
              }
            }}
            className='cursor-pointer'
          />
        </div>
      </CardContent>
    </Card>
  );
};
