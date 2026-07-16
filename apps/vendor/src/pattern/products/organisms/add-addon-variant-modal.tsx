'use client';

import { useRef, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';

export interface AddonVariantResult {
  name: string;
  price: number;
  colorHex?: string;
  imageUrl?: string;
}

// Preset swatches for quick colour selection
const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#C0C0C0', '#808080',
  '#D4AF37', '#B87333', '#CD7F32', '#E5C100',
  '#FF0000', '#DC143C', '#8B0000', '#FF6347',
  '#0000FF', '#1E90FF', '#000080', '#4169E1',
  '#008000', '#2E8B57', '#006400', '#32CD32',
  '#800080', '#9370DB', '#4B0082', '#DA70D6',
  '#FF69B4', '#FFD700', '#FF8C00', '#FFA500',
];

// Modal for adding a single variant to an add-on.
// Props: displayType — determines whether to show colour picker or image upload.
// Resolves with AddonVariantResult or null.
export const AddAddonVariantModal = NiceModal.create(
  ({ displayType }: { displayType: 'colour' | 'picture' }) => {
    const modal = useModal();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [colorHex, setColorHex] = useState('#000000');

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploadedUrl, setUploadedUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadImage, { isLoading: isUploading }] =
      useUploadProductImageMutation();

    if (!modal.visible) return null;

    const cancel = () => {
      modal.resolve(null);
      modal.remove();
    };

    const handleFileSelect = (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadedUrl('');
    };

    const removeImage = () => {
      setImageFile(null);
      setPreviewUrl('');
      setUploadedUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = async () => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        toast.error('Please enter a variant name');
        return;
      }
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // For picture mode, upload the image first
      let finalImageUrl = uploadedUrl;
      if (displayType === 'picture') {
        if (!imageFile && !uploadedUrl) {
          toast.error('Please upload an image');
          return;
        }
        if (imageFile && !uploadedUrl) {
          try {
            const res = await uploadImage(imageFile).unwrap();
            finalImageUrl = (res as any)?.url || (res as any)?.data?.url || '';
            if (!finalImageUrl) {
              toast.error('Upload succeeded but no URL returned');
              return;
            }
          } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to upload image');
            return;
          }
        }
      }

      const result: AddonVariantResult = {
        name: trimmedName,
        price: priceNum,
        ...(displayType === 'colour' ? { colorHex } : {}),
        ...(displayType === 'picture' ? { imageUrl: finalImageUrl } : {}),
      };

      modal.resolve(result);
      modal.remove();
    };

    const isColour = displayType === 'colour';

    return (
      <Dialog open={modal.visible} onOpenChange={(open) => !open && cancel()}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden sm:rounded-[16px] bg-card border-none sm:border-solid">
          <div className="flex flex-col sm:rounded-[16px]">
            {/* Header */}
            <div className="border-b border-border p-6">
              <DialogTitle className="text-base font-semibold text-grey-black dark:text-white m-0">
                Add Variant
              </DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {isColour
                  ? 'Pick a colour and set a price for this variant'
                  : 'Upload an image and set a price for this variant'}
              </p>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Variant Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    isColour ? 'e.g. Gold, Silver, Black...' : 'e.g. Silk, Cotton...'
                  }
                  className="bg-background"
                  autoFocus
                />
              </div>

              {/* Colour Picker or Image Upload */}
              {isColour ? (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Colour
                  </label>
                  {/* Preset swatches */}
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setColorHex(hex)}
                        className={cn(
                          'size-7 rounded-full border-2 transition-all',
                          colorHex === hex
                            ? 'border-primary ring-2 ring-primary/30 scale-110'
                            : 'border-input hover:scale-105'
                        )}
                        style={{ backgroundColor: hex }}
                        aria-label={hex}
                      />
                    ))}
                  </div>
                  {/* Custom hex input */}
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 shrink-0 rounded-lg border border-input"
                      style={{ backgroundColor: colorHex }}
                    />
                    <Input
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      placeholder="#000000"
                      className="bg-background font-mono text-sm"
                    />
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="size-10 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Image
                  </label>
                  {previewUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="aspect-square w-full rounded-lg border border-input object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input p-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <Upload className="size-8" />
                      <p className="text-sm font-medium">Click to upload</p>
                      <p className="text-xs">PNG, JPG, WebP up to 5MB</p>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Price (₦)
                </label>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  type="number"
                  min={0}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!name.trim() || isUploading}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading && <Loader2 className="size-4 animate-spin" />}
                Add Variant
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
