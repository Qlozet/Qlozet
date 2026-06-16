'use client';

import { useRef, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Info, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LabeledSelect } from '../molecules/labeled-select';
import {
  AccessoryVariantsBuilder,
  type AccessoryVariantRow,
  type ColourOption,
} from '../molecules/accessory-variants-builder';
import {
  useCreateAccessoryMutation,
  type VariantDto,
} from '@/redux/services/products/products.api-slice';

const CATEGORY_OPTIONS = ['Belts', 'Hats', 'Bags'];
const SUB_CATEGORY_OPTIONS = ['Leather belt', 'Fabric belt', 'Chain belt'];
const TAG_OPTIONS = ['Men', 'Women', 'Unisex'];

// UI size label -> API size code.
const SIZE_CODE: Record<string, string> = {
  'Extra small': 'XS',
  Small: 'S',
  Medium: 'M',
  Large: 'L',
  'Extra large': 'XL',
};

export const AddAccessoryModal = NiceModal.create(() => {
  const modal = useModal();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [tag, setTag] = useState('');
  const [price, setPrice] = useState(0);
  const [variants, setVariants] = useState<AccessoryVariantRow[]>([]);

  const [previewUrl, setPreviewUrl] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const idCounter = useRef(0);
  const [createAccessory, { isLoading }] = useCreateAccessoryMutation();

  if (!modal.visible) return null;

  const handleClose = () => modal.remove();
  const isValid = name.trim().length > 0 && price > 0;

  const handleAddVariants = (colours: ColourOption[], sizes: string[]) => {
    setVariants((prev) => {
      const existing = new Set(prev.map((v) => v.colour.hex));
      const additions = colours
        .filter((c) => !existing.has(c.hex))
        .map((colour) => ({
          id: `variant-${(idCounter.current += 1)}`,
          colour,
          sizes,
        }));
      return [...prev, ...additions];
    });
  };

  const handleRemoveVariant = (id: string) =>
    setVariants((prev) => prev.filter((v) => v.id !== id));

  const handleFile = (file?: File) => {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setHostedUrl('');
  };

  const handleAddUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    setPreviewUrl(url);
    setHostedUrl(url);
    setShowUrlInput(false);
    setUrlDraft('');
  };

  // Flatten colour×size rows into the backend's per-variant shape.
  const buildVariants = (): VariantDto[] =>
    variants.flatMap((v) => {
      const colour = { name: v.colour.name, hex: v.colour.hex };
      if (v.sizes.length === 0) {
        return [{ stock: 0, price, color: colour }];
      }
      return v.sizes.map((size) => ({
        size: SIZE_CODE[size] ?? size,
        stock: 0,
        price,
        color: colour,
      }));
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error('Please enter an accessory name and price.');
      return;
    }
    try {
      await createAccessory({
        accessory: {
          name: name.trim(),
          description: description.trim() || undefined,
          price,
          sub_category: subCategory || undefined,
          taxonomy: {
            product_type: 'accessory',
            categories: category ? [category] : [],
            attributes: tag ? [tag] : [],
            audience: tag,
          },
          variants: buildVariants(),
          images: hostedUrl ? [{ url: hostedUrl }] : undefined,
        },
      }).unwrap();
      toast.success('Accessory uploaded successfully');
      handleClose();
    } catch {
      toast.error('Failed to upload accessory. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-accessory-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-250 flex-col overflow-hidden rounded-2xl bg-card shadow-2xl md:flex-row"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>

        {/* Left: form + variants */}
        <form
          onSubmit={handleSubmit}
          className="flex-[2] space-y-6 overflow-y-auto p-6"
        >
          <h2
            id="add-accessory-title"
            className="text-xl font-semibold text-foreground"
          >
            Add Accessory
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Accessory name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Wide-leg pants"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Product description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add product description"
                />
              </div>

              <LabeledSelect
                label="Categories"
                value={category}
                options={CATEGORY_OPTIONS}
                onChange={setCategory}
                placeholder="Belts"
              />
              <LabeledSelect
                label="Sub-categories"
                value={subCategory}
                options={SUB_CATEGORY_OPTIONS}
                onChange={setSubCategory}
                placeholder="Leather belt"
              />
              <LabeledSelect
                label="Tags"
                value={tag}
                options={TAG_OPTIONS}
                onChange={setTag}
                placeholder="Men"
              />

              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  Price
                  <Info className="size-3.5 text-gray-400" />
                </label>
                <div className="flex h-10 items-center rounded-md border border-input bg-background px-3">
                  <span className="mr-2 text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    min={0}
                    value={price || ''}
                    placeholder="100000"
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    className="w-full border-none bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <AccessoryVariantsBuilder
              variants={variants}
              onAdd={handleAddVariants}
              onRemove={handleRemoveVariant}
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="h-11 w-full max-w-[12rem] text-sm"
          >
            {isLoading ? 'Uploading...' : 'Upload Accessory'}
          </Button>
        </form>

        {/* Right: preview / upload */}
        <div className="flex-1 space-y-4 bg-[#F4F4F4] p-6">
          <h2 className="text-xl font-semibold text-foreground">Preview</h2>

          <div className="flex items-start gap-3 rounded-lg bg-white p-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Info className="size-3.5" />
            </span>
            <p className="text-sm text-gray-600">
              Add a clear picture of the accessory in white background
            </p>
          </div>

          <label
            htmlFor="accessory-image"
            className={cn(
              'flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white/40 p-6 text-center transition hover:border-gray-400',
              previewUrl && 'border-solid bg-white p-0'
            )}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Accessory preview"
                className="h-full w-full rounded-xl object-contain"
              />
            ) : (
              <>
                <Upload className="size-6 text-gray-500" />
                <span className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
                  Add or drop image or sketch
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUrlInput((prev) => !prev);
                  }}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Add from URL
                </button>
              </>
            )}
          </label>
          <input
            id="accessory-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {showUrlInput && !previewUrl && (
            <div className="flex gap-2">
              <Input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://image-url.com/accessory.png"
                className="h-10"
              />
              <Button type="button" onClick={handleAddUrl} className="h-10">
                Add
              </Button>
            </div>
          )}

          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setPreviewUrl('');
                setHostedUrl('');
              }}
              className="text-sm text-destructive hover:underline"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
