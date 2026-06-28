'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Info, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepperField } from '../molecules/stepper-field';
import { LabeledSelect } from '../molecules/labeled-select';
import { ColourSelect } from '../molecules/colour-select';
import { useCreateFabricMutation } from '@/redux/services/products/products.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';

const MATERIAL_OPTIONS = [
  'Cotton',
  'Linen',
  'Silk',
  'Wool',
  'Polyester',
  'Chiffon',
  'Velvet',
  'Lace',
];

const PATTERN_OPTIONS = [
  'Solid',
  'Striped',
  'Graphic',
  'Dotted',
  'Animal',
  'Tropical',
  'Paisley',
  'Argyle',
  'Floral',
  'Camou',
  'Colour-Block',
  'Repeated',
  'Checkerboard',
  'Plaid',
  'Gingham',
  'Houndstooth',
  'Chevron',
  'Tweed',
  'Abstract',
  'Tie Dye',
  'Ankara',
  'Geometric',
  'Lace',
  'Kente',
  'Aso Oke',
  'Kuba',
  'Shweshwe',
];

// Vendor "Add Fabric" — two-panel modal wired to the vendor createFabric
// endpoint (POST /products/fabric). Material maps to the fabric product_type;
// colour is preserved in metafields since the vendor FabricDto has no colour.
export const AddFabricModal = NiceModal.create(() => {
  const modal = useModal();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [colour, setColour] = useState('');
  const [swatch, setSwatch] = useState('#E8A33D');
  const [pattern, setPattern] = useState('');
  const [yardsLength, setYardsLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [minCut, setMinCut] = useState(4);
  const [pricePerYard, setPricePerYard] = useState(0);

  const [previewUrl, setPreviewUrl] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [createFabric, { isLoading: isCreating }] = useCreateFabricMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();
  const isLoading = isCreating || isUploading;

  if (!modal.visible) return null;

  const handleClose = () => modal.remove();
  const isValid = name.trim().length > 0 && pricePerYard > 0;

  const handleFile = (file?: File) => {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setImageFile(file);
    setHostedUrl('');
  };

  const handleAddUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    setPreviewUrl(url);
    setHostedUrl(url);
    setImageFile(null);
    setShowUrlInput(false);
    setUrlDraft('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error('Please enter a fabric name and price per yard.');
      return;
    }
    try {
      let finalImageUrl = hostedUrl;
      if (imageFile && !hostedUrl) {
        const res = await uploadImage(imageFile).unwrap();
        if (res.data?.url) {
          finalImageUrl = res.data.url;
        }
      }

      await createFabric({
        metafields: { colour: colour || undefined, swatch },
        fabric: {
          name: name.trim(),
          description: description.trim() || undefined,
          product_type: material || 'fabric',
          pattern: pattern || undefined,
          yard_length: yardsLength,
          width,
          min_cut: minCut,
          price_per_yard: pricePerYard,
          images: finalImageUrl ? [{ url: finalImageUrl, public_id: '' }] : undefined,
          // Backend validates variants as an array even though Swagger marks it
          // optional; the modal has no variant UI, so send an empty array.
          variants: [],
        },
      }).unwrap();
      toast.success('Fabric uploaded successfully');
      handleClose();
    } catch {
      toast.error('Failed to upload fabric. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-fabric-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl md:flex-row"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>

        {/* Left: form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto p-6"
        >
          <h2
            id="add-fabric-title"
            className="text-xl font-semibold text-foreground"
          >
            Add Fabric
          </h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Fabric name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fabric name"
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
            label="Material"
            value={material}
            options={MATERIAL_OPTIONS}
            onChange={setMaterial}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Colour</label>
            <ColourSelect
              value={colour}
              hex={swatch}
              onChange={(nextName, hex) => {
                setColour(nextName);
                setSwatch(hex);
              }}
            />
          </div>

          <LabeledSelect
            label="Pattern"
            value={pattern}
            options={PATTERN_OPTIONS}
            onChange={setPattern}
          />

          <div className="grid grid-cols-3 gap-3">
            <StepperField
              label="Yards/Length"
              value={yardsLength}
              onChange={setYardsLength}
            />
            <StepperField label="Width" value={width} onChange={setWidth} />
            <StepperField
              label="Min Cut (Yards)"
              value={minCut}
              onChange={setMinCut}
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              Price per yard
              <Info className="size-3.5 text-gray-400" />
            </label>
            <div className="flex h-10 items-center rounded-md border border-border-input bg-background px-3">
              <span className="mr-2 text-sm text-gray-500">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={pricePerYard === 0 ? '' : pricePerYard}
                onChange={(e) =>
                  setPricePerYard(
                    e.target.value === '' ? 0 : Number(e.target.value)
                  )
                }
                className="w-full border-none bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="h-11 w-full text-sm"
          >
            {isLoading ? 'Uploading...' : 'Upload Fabric'}
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
              Provide a flat and smooth picture of only the fabric.
            </p>
          </div>

          <label
            htmlFor="fabric-image"
            className={cn(
              'flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white/40 p-6 text-center transition hover:border-gray-400',
              previewUrl && 'border-solid bg-white p-0'
            )}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Fabric preview"
                className="h-full w-full rounded-xl object-contain"
              />
            ) : (
              <>
                <Upload className="size-6 text-gray-500" />
                <span className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
                  Add or Drop image
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
            id="fabric-image"
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
                placeholder="https://image-url.com/fabric.png"
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
                setImageFile(null);
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
