// Product Customization Section - Molecule
// Form composition for product customization options management

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CompleteProductData, ProductCustomizationData } from "@/lib/validations/product";
import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

interface ProductCustomizationSectionProps {
  form: UseFormReturn<CompleteProductData>;
}

export const ProductCustomizationSection: React.FC<ProductCustomizationSectionProps> = ({ form }) => {
  const customizations = form.watch('customizations') || [];

  const addCustomization = () => {
    const current = form.getValues('customizations') || [];
    form.setValue('customizations', [...current, { name: '', options: [''], additionalPrice: 0 }]);
  };

  const removeCustomization = (index: number) => {
    const current = form.getValues('customizations') || [];
    form.setValue('customizations', current.filter((_, i) => i !== index));
  };

  const updateCustomization = (index: number, field: keyof ProductCustomizationData, value: any) => {
    const current = form.getValues('customizations') || [];
    const updated = current.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    form.setValue('customizations', updated);
  };

  const addOption = (custIndex: number) => {
    const current = form.getValues('customizations') || [];
    const updated = current.map((item, i) => 
      i === custIndex ? { ...item, options: [...item.options, ''] } : item
    );
    form.setValue('customizations', updated);
  };

  const updateOption = (custIndex: number, optIndex: number, value: string) => {
    const current = form.getValues('customizations') || [];
    const updated = current.map((item, i) => 
      i === custIndex ? { 
        ...item, 
        options: item.options.map((opt: string, j: number) => j === optIndex ? value : opt) 
      } : item
    );
    form.setValue('customizations', updated);
  };

  const removeOption = (custIndex: number, optIndex: number) => {
    const current = form.getValues('customizations') || [];
    const updated = current.map((item, i) => 
      i === custIndex ? { 
        ...item, 
        options: item.options.filter((_: any, j: number) => j !== optIndex) 
      } : item
    );
    form.setValue('customizations', updated);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <Typography variant="h3" className="text-lg font-semibold text-gray-900">
          Customization Options
        </Typography>
        <Button type="button" onClick={addCustomization} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Customization
        </Button>
      </CardHeader>
      <CardContent>
        {customizations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Typography>No customization options added yet.</Typography>
          </div>
        ) : (
          <div className="space-y-6">
            {customizations.map((customization, custIndex) => (
              <div key={custIndex} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary">Customization {custIndex + 1}</Badge>
                  <Button
                    type="button"
                    onClick={() => removeCustomization(custIndex)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customization Name</label>
                    <Input
                      placeholder="e.g., Engraving, Color Choice"
                      value={customization.name || ''}
                      onChange={(e) => updateCustomization(custIndex, 'name', e.target.value)}
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
                        value={customization.additionalPrice || 0}
                        onChange={(e) => updateCustomization(custIndex, 'additionalPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Typography className="font-medium">Options</Typography>
                    <Button
                      type="button"
                      onClick={() => addOption(custIndex)}
                      variant="ghost"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customization.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="flex gap-2">
                        <Input
                          placeholder={`Option ${optIndex + 1}`}
                          value={option || ''}
                          onChange={(e) => updateOption(custIndex, optIndex, e.target.value)}
                          className="flex-1"
                        />
                        {customization.options.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeOption(custIndex, optIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
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