// Product Variants Section - Molecule
// Form composition for product variants management

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CompleteProductData, ProductVariantData } from "@/lib/validations/product";
import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

interface ProductVariantsSectionProps {
  form: UseFormReturn<CompleteProductData>;
}

export const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({ form }) => {
  const variants = form.watch('variants') || [];

  const addVariant = () => {
    const currentVariants = form.getValues('variants') || [];
    form.setValue('variants', [...currentVariants, { size: '', color: '', material: '', additionalPrice: 0 }]);
  };

  const removeVariant = (index: number) => {
    const currentVariants = form.getValues('variants') || [];
    const updatedVariants = currentVariants.filter((_, i) => i !== index);
    form.setValue('variants', updatedVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariantData, value: any) => {
    const currentVariants = form.getValues('variants') || [];
    const updatedVariants = currentVariants.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    );
    form.setValue('variants', updatedVariants);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <Typography variant="h3" className="text-lg font-semibold text-gray-900">
          Product Variants
        </Typography>
        <Button type="button" onClick={addVariant} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Typography>No variants added yet. Click "Add Variant" to get started.</Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <Badge variant="secondary">Variant {index + 1}</Badge>
                  <Button
                    type="button"
                    onClick={() => removeVariant(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size</label>
                    <Input
                      placeholder="e.g., S, M, L, XL"
                      value={variant.size || ''}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <Input
                      placeholder="e.g., Red, Blue"
                      value={variant.color || ''}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Material</label>
                    <Input
                      placeholder="e.g., Cotton, Silk"
                      value={variant.material || ''}
                      onChange={(e) => updateVariant(index, 'material', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="pl-8"
                        value={variant.additionalPrice || 0}
                        onChange={(e) => updateVariant(index, 'additionalPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};