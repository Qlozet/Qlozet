// Product Preview Modal - Organism
// Modal component for previewing product data before submission

import React from "react";
import { create, useModal } from "@ebay/nice-modal-react";
import { CompleteProductData } from "@/lib/validations/product";
import { Category } from "@/redux/services/products/products.api-slice";
import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductPreviewModalProps {
  productData: CompleteProductData;
  categories: Category[];
  selectedFiles: File[];
}

export const ProductPreviewModal = create<ProductPreviewModalProps>(({ 
  productData, 
  categories, 
  selectedFiles 
}) => {
  const { visible, resolve, remove } = useModal();
  const selectedCategory = categories.find(c => c._id === productData.category);
  
  const handleCloseModal = () => {
    resolve({ resolved: true });
    remove();
  };

  return (
    <Dialog open={visible} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Product Preview</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Typography variant="h3" className="font-semibold mb-3">Basic Information</Typography>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {productData.name || 'Not specified'}</div>
                <div><strong>Category:</strong> {selectedCategory?.name || 'Not selected'}</div>
                <div><strong>Price:</strong> ${productData.price || 0}</div>
                <div><strong>Stock:</strong> {productData.stock || 0} units</div>
                <div><strong>Status:</strong> <span className="capitalize">{productData.status || 'Draft'}</span></div>
              </div>
              {productData.description && (
                <div className="mt-4">
                  <Typography variant="h4" className="font-semibold mb-2">Description</Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {productData.description}
                  </Typography>
                </div>
              )}
            </div>
            
            {/* Images */}
            <div>
              {((productData.images?.length || 0) > 0 || selectedFiles.length > 0) && (
                <div>
                  <Typography variant="h3" className="font-semibold mb-3">
                    Images ({(productData.images?.length || 0) + selectedFiles.length})
                  </Typography>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Uploaded images */}
                    {productData.images?.slice(0, 4).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="aspect-square object-cover rounded-lg"
                      />
                    ))}
                    {/* Selected files */}
                    {selectedFiles.slice(0, 4 - (productData.images?.length || 0)).map((file, index) => (
                      <img
                        key={`file-${index}`}
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          {productData.variants && productData.variants.length > 0 && (
            <div>
              <Typography variant="h3" className="font-semibold mb-3">
                Variants ({productData.variants.length})
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {productData.variants.slice(0, 6).map((variant, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      {variant.size && <div><strong>Size:</strong> {variant.size}</div>}
                      {variant.color && <div><strong>Color:</strong> {variant.color}</div>}
                      {variant.material && <div><strong>Material:</strong> {variant.material}</div>}
                      {variant.additionalPrice > 0 && (
                        <div><strong>Additional Price:</strong> +${variant.additionalPrice}</div>
                      )}
                    </div>
                  </div>
                ))}
                {productData.variants.length > 6 && (
                  <div className="text-gray-500 text-center col-span-full">
                    +{productData.variants.length - 6} more variants
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customizations */}
          {productData.customizations && productData.customizations.length > 0 && (
            <div>
              <Typography variant="h3" className="font-semibold mb-3">
                Customizations ({productData.customizations.length})
              </Typography>
              <div className="space-y-3 text-sm">
                {productData.customizations.slice(0, 3).map((customization, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-1">{customization.name}</div>
                    <div className="text-gray-600">
                      <strong>Options:</strong> {customization.options.filter(opt => opt.trim()).join(", ")}
                    </div>
                    {customization.additionalPrice > 0 && (
                      <div className="text-gray-600">
                        <strong>Additional Price:</strong> +${customization.additionalPrice}
                      </div>
                    )}
                  </div>
                ))}
                {productData.customizations.length > 3 && (
                  <div className="text-gray-500 text-center">
                    +{productData.customizations.length - 3} more customizations
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {productData.tags && productData.tags.length > 0 && (
            <div>
              <Typography variant="h3" className="font-semibold mb-2">Tags</Typography>
              <div className="flex flex-wrap gap-2">
                {productData.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleCloseModal} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});