'use client';

import { useState, useEffect, useCallback } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Check, Info, Upload, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepperField } from '../molecules/stepper-field';
import { LabeledSelect } from '../molecules/labeled-select';
import { ColourSelect } from '../molecules/colour-select';
import { useCreateFabricMutation, useGetProductQuery } from '@/redux/services/products/products.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import {
  useGetProductTypesQuery,
  useGetCategoriesForTypeQuery,
} from '@/redux/services/taxonomy/taxonomy.api-slice';

// Vendor "Add Fabric" — two-panel modal wired to the vendor createFabric
// endpoint (POST /products/fabric). Material maps to the fabric product_type;
// colour is preserved in metafields since the vendor FabricDto has no colour.
export const AddFabricModal = NiceModal.create(({ editId }: { editId?: string }) => {
  const modal = useModal();

  const { data: productData, isLoading: isLoadingProduct } = useGetProductQuery(editId as string, {
    skip: !editId,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [colour, setColour] = useState('');
  const [swatch, setSwatch] = useState('#E8A33D');
  const [pattern, setPattern] = useState('');
  const [yardsLength, setYardsLength] = useState(1);
  const [width, setWidth] = useState(10);
  const [minCut, setMinCut] = useState(4);
  const [pricePerYard, setPricePerYard] = useState(0);

  const [previewUrl, setPreviewUrl] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [createFabric, { isLoading: isCreating }] = useCreateFabricMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();
  const isLoading = isCreating || isUploading || isLoadingProduct;

  // Taxonomy hooks — Material → product_type, Pattern → categories
  const { data: fabricTypes, isLoading: isLoadingTypes } = useGetProductTypesQuery('fabric');
  const { data: categoryData, isLoading: isLoadingCategories } = useGetCategoriesForTypeQuery(
    { kind: 'fabric', product_type: material },
    { skip: !material }
  );

  const materialOptions = fabricTypes?.map((pt) => pt.name) || [];
  const patternOptions = categoryData?.categories || [];

  useEffect(() => {
    if (productData) {
      const rawProduct = (productData as any)?.data || productData;
      const inner = rawProduct?.kind ? rawProduct[rawProduct.kind] : rawProduct;
      
      setName(inner?.name || rawProduct?.name || '');
      setDescription(inner?.description || rawProduct?.description || '');
      setMaterial(inner?.product_type || inner?.taxonomy?.product_type || rawProduct?.product_type || '');
      setColour(rawProduct?.metafields?.colour || rawProduct?.metafields?.color || inner?.colour || '');
      if (rawProduct?.metafields?.swatch) setSwatch(rawProduct.metafields.swatch);
      setPattern(inner?.pattern || '');
      setYardsLength(inner?.yard_length || 0);
      setWidth(inner?.width || 0);
      setMinCut(inner?.min_cut || 4);
      setPricePerYard(inner?.price_per_yard || rawProduct?.base_price || 0);
      
      const pImages = inner?.images || rawProduct?.images || [];
      if (pImages && pImages.length > 0) {
        const url = typeof pImages[0] === 'string' ? pImages[0] : pImages[0].url;
        setHostedUrl(url);
        setPreviewUrl(url);
      }
    }
  }, [productData]);

  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => modal.remove(), 280);
  }, [modal]);

  if (!modal.visible) return null;

  const isValid = name.trim().length > 0 && pricePerYard > 0 && yardsLength > 0 && width >= 10;

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

  const handleSubmit = async (isDraft = false) => {
    if (!isValid) {
      toast.error('Please enter fabric name, price > 0, yards > 0, and width >= 10.');
      return;
    }
    try {
      let finalImageUrl = hostedUrl;
      let finalPublicId = 'unknown';
      if (imageFile && !hostedUrl) {
        const res = await uploadImage(imageFile).unwrap();
        if (res.data?.url) {
          finalImageUrl = res.data.url;
          finalPublicId = res.data.public_id || 'unknown';
        }
      }

      await createFabric({
        ...(editId ? { product_id: editId } : {}),
        seo: { title: name.trim() },
        metafields: { colour: colour || undefined, swatch, base_price: pricePerYard ? Number(pricePerYard) : undefined },
        status: isDraft ? 'draft' : 'active',
        fabric: {
          name: name.trim(),
          description: description.trim() || undefined,
          product_type: material || 'fabric',
          pattern: pattern || undefined,
          yard_length: yardsLength,
          width,
          min_cut: minCut,
          price_per_yard: pricePerYard,
          images: finalImageUrl ? [{ url: finalImageUrl, public_id: finalPublicId }] : undefined,
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
    <Dialog open={modal.visible && !closing} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden sm:rounded-[16px]">
        <div className="flex max-h-[90vh] w-full flex-col sm:rounded-[16px] md:flex-row md:overflow-hidden overflow-y-auto">
          {/* Left: form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex-1 space-y-4 p-6 bg-card md:overflow-y-auto custom-scrollbar"
          >
            <DialogTitle
              id="add-fabric-title"
              className="text-xl font-semibold text-grey-black dark:text-white"
            >
              {editId ? 'Edit' : 'Add'} Fabric
            </DialogTitle>

          {isLoadingProduct ? (
            <div className="flex flex-col gap-6 pt-4">
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              </div>
            </div>
          ) : (
          <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Fabric name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fabric name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Product description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add product description"
            />
          </div>

          {isLoadingTypes ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <LabeledSelect
              label="Material"
              value={material}
              options={materialOptions}
              onChange={(v) => { setMaterial(v); setPattern(''); }}
            />
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Colour</label>
            <ColourSelect
              value={colour}
              hex={swatch}
              onChange={(nextName, hex) => {
                setColour(nextName);
                setSwatch(hex);
              }}
            />
          </div>

          {isLoadingCategories && material ? (
            <Skeleton className="h-10 w-full" />
          ) : patternOptions.length > 0 ? (
            <LabeledSelect
              label="Pattern"
              value={pattern}
              options={patternOptions}
              onChange={setPattern}
            />
          ) : material ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Pattern</label>
              <div className="flex h-10 w-full items-center rounded-md border border-input dark:border-white/10 bg-background dark:bg-muted px-3 text-sm text-muted-foreground">
                No patterns available for this material
              </div>
            </div>
          ) : null}

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
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Price per yard
              <Info className="size-3.5 text-gray-400" />
            </label>
            <div className="flex h-10 items-center rounded-md border border-input dark:border-white/10 bg-background dark:bg-muted px-3">
              <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">$</span>
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
                className="w-full border-none bg-transparent text-sm outline-none dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={!isValid || isLoading}
              className="h-11 flex-1 text-sm bg-transparent"
            >
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={!isValid || isLoading}
              className="h-11 flex-1 text-sm"
            >
              {isLoading ? 'Publishing...' : 'Publish Now'}
            </Button>
          </div>
          </>
          )}
        </form>

        {/* Right: preview / upload */}
        <div className="flex-1 space-y-4 bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-6 md:overflow-y-auto custom-scrollbar h-full">
          <h2 className="text-xl font-semibold text-grey-black dark:text-white">Preview</h2>
          {isLoadingProduct ? (
            <Skeleton className="aspect-square w-full rounded-xl" />
          ) : (
          <>
          <div className="flex items-start gap-3 rounded-lg bg-[hsla(27,97%,12%,0.06)] dark:bg-white/5 p-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Info className="size-3.5" />
            </span>
            <p className="text-sm text-grey-black dark:text-white">
              Provide a flat and smooth picture of only the fabric.
            </p>
          </div>

          <label
            htmlFor="fabric-image"
            className={cn(
              'flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-white/40 dark:bg-white/5 p-6 text-center transition hover:border-gray-400 dark:hover:border-white/40',
              previewUrl && 'border-solid bg-white dark:bg-transparent p-0'
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
                <span className="rounded-md bg-gray-200 dark:bg-white/10 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200">
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
          </>
          )}
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
});
