'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/pattern/common/organisms/rich-text-editor';
import { FileUploadWidget } from '@/pattern/common/organisms/file-upload-widget';
import { ProductAlertBanner } from '../molecules/product-alert-banner';
import { FieldLabel } from '../atoms/field-label';
import { StatusPill } from '../atoms/status-pill';
import {
  ProductOrganizationSection,
  type ProductOrganizationValue,
} from '../organisms/clothing-organization-section';
import { ProductPricingSection } from '../organisms/clothing-pricing-section';
import {
  VariantSelectOptions,
  type VariantDescriptor,
} from '../organisms/clothing-variant-options';
import {
  SetVariantsTable,
  makeSizeDetail,
  type VariantRow,
  type SizeDetail,
} from '../organisms/set-variants-table';
import {
  DefaultImagesUploader,
  type DefaultImage,
} from '../organisms/default-images-uploader';
import {
  CustomizationBuilder,
  DEFAULT_CUSTOMIZATION_SECTIONS,
  type CustomSection,
} from '../organisms/customization-builder';
import { APP_ROUTES } from '@/lib/routes';
import {
  useCreateClothingMutation,
  useGetProductQuery,
  type ColorVariantDto,
} from '@/redux/services/products/products.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';

const countWords = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

type ProductStatus = 'active' | 'draft' | 'archived';

// Add Clothing product form (vendor). Shares the admin component set, wired to
// the vendor's own create-clothing endpoint.
export default function AddClothingTemplate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  
  const { data: productData, isLoading: isLoadingProduct } = useGetProductQuery(editId as string, {
    skip: !editId,
  });
  
  const [createClothing, { isLoading: isCreating }] = useCreateClothingMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();
  const isSaving = isCreating || isUploading;

  const [showAlert, setShowAlert] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [defaultImages, setDefaultImages] = useState<DefaultImage[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);

  const [customizationEnabled, setCustomizationEnabled] = useState(false);
  const [measurementRequired, setMeasurementRequired] = useState(false);
  const [turnaroundDays, setTurnaroundDays] = useState('2');
  const [customizationSections, setCustomizationSections] = useState<
    CustomSection[]
  >(DEFAULT_CUSTOMIZATION_SECTIONS);

  const [organization, setOrganization] = useState<ProductOrganizationValue>({
    tag: [],
    category: [],
    subCategory: [],
    productType: [],
    audience: '',
  });
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);

  useEffect(() => {
    if (productData) {
      // The API might return { data: { kind: 'clothing', clothing: { name: ... } } }
      // or it might already be flattened.
      const rawProduct = (productData as any)?.data || productData;
      const inner = rawProduct?.kind ? rawProduct[rawProduct.kind] : rawProduct;

      const pName = inner?.name || rawProduct?.name || '';
      const pDesc = inner?.description || rawProduct?.description || '';
      const pStatus = rawProduct?.status || 'active';
      const pPrice = rawProduct?.base_price || rawProduct?.metafields?.base_price || rawProduct?.price || '';
      const pType = inner?.type || rawProduct?.type || '';
      const pTags = inner?.taxonomy?.attributes || rawProduct?.tags || [];
      const pCategory = inner?.taxonomy?.categories?.[0] || rawProduct?.category || '';
      const pImages = inner?.images || rawProduct?.images || [];

      setTitle(pName);
      setDescription(pDesc);
      setStatus(pStatus as ProductStatus);
      setPrice(pPrice ? String(pPrice) : '');
      
      if (pType === 'customize') {
        setCustomizationEnabled(true);
      }

      setOrganization({
        tag: pTags,
        category: pCategory ? [pCategory] : [],
        subCategory: [], 
        productType: [], 
        audience: '',    
      });

      if (pImages && pImages.length > 0) {
        setDefaultImages(
          pImages.map((img: any) => {
            const url = typeof img === 'string' ? img : img?.url;
            return {
              id: Math.random().toString(36).substr(2, 9),
              url: url ? url.replace(/^http:\/\//i, 'https://') : '',
              isLocal: false,
            };
          })
        );
      }
    }
  }, [productData]);

  const wordCount = countWords(description);

  const addVariant = (descriptor: VariantDescriptor, sizeKeys: string[]) => {
    const details: Record<string, SizeDetail> = {};
    sizeKeys.forEach((size) => {
      details[size] = makeSizeDetail();
    });
    const key = descriptor.colorHex ?? descriptor.label ?? 'variant';
    setVariants((prev) => [
      ...prev,
      {
        id: `${key}-${prev.length}-${sizeKeys.join('')}`,
        colorHex: descriptor.colorHex ?? '',
        imageUrl: descriptor.imageUrl,
        label: descriptor.label,
        availableSizes: sizeKeys,
        details,
        images: [],
        expanded: true,
        selected: false,
      },
    ]);
  };

  const handleSave = async (isDraft = false) => {
    if (!title.trim()) {
      toast.error('Please enter a product title.');
      return;
    }

    const hasCustomItems = customizationSections.some(
      (sec) => (sec.items && sec.items.length > 0) || sec.subGroups?.some((sg) => sg.items && sg.items.length > 0)
    );

    if (!isDraft && customizationEnabled && !hasCustomItems) {
      toast.error('You must add at least one style or customization option to publish a customisable product. Save as a draft instead.');
      return;
    }

    // Backend requires a non-empty taxonomy.product_type. When customization is
    // on the product type is implicitly "customisable" (the dropdown is hidden);
    // otherwise the vendor must pick one.
    const productType = customizationEnabled
      ? 'customisable'
      : organization.productType[0];
    if (!productType) {
      toast.error('Please select a product type.');
      return;
    }

    if (!organization.audience) {
      toast.error('Please select a target audience.');
      return;
    }

    const colorVariants: ColorVariantDto[] = await Promise.all(variants.map(async (v) => {
      const name = v.label || v.colorHex;
      
      let uploadedVariantImages: { url: string; public_id: string }[] = [];
      if (v.imageFiles && v.imageFiles.length > 0) {
        const res = await Promise.all(v.imageFiles.map(file => uploadImage(file).unwrap()));
        uploadedVariantImages = res.map(r => ({ url: r.data?.url || '', public_id: r.data?.public_id || 'unknown' })).filter(img => Boolean(img.url));
      }

      return {
        name,
        hex: v.colorHex,
        images: [
          ...(v.imageUrl ? [{ url: v.imageUrl, public_id: 'unknown' }] : []),
          ...v.images.filter(url => !url.startsWith('blob:')).map((url) => ({ url, public_id: 'unknown' })),
          ...uploadedVariantImages,
        ],
        variants: v.availableSizes.map((size) => {
          const detail = v.details[size] ?? makeSizeDetail();
          return {
            size,
            stock: detail.stock,
            price: detail.price,
            sku: detail.sku || undefined,
            yard_per_order: detail.yardsPerOrder,
            color: { name, hex: v.colorHex },
          };
        }),
      };
    }));

    try {
      const localDefaultImages = defaultImages.filter((img) => img.isLocal && img.file);
      const uploadedDefaults = await Promise.all(
        localDefaultImages.map(async (img) => {
          const res = await uploadImage(img.file!).unwrap();
          return { url: res.data?.url || '', public_id: res.data?.public_id || 'unknown' };
        })
      );
      
      const defaultImageUrls = [
        ...defaultImages.filter(img => !img.isLocal).map(img => ({ url: img.url, public_id: 'unknown' })),
        ...uploadedDefaults.filter(img => !!img.url)
      ];

      const uploadedExtras = await Promise.all(
        extraFiles.map(async (file) => {
          const res = await uploadImage(file).unwrap();
          return { url: res.data?.url || '', public_id: res.data?.public_id || 'unknown' };
        })
      );
      
      const extraImageUrls = uploadedExtras.filter(img => !!img.url);
      
      const finalImages = [...defaultImageUrls, ...extraImageUrls];
      await createClothing({
        ...(editId ? { _id: editId } : {}),
        seo: { title: title.trim() },
        metafields: {
          base_price: price ? Number(price) : undefined,
          discount: discount || undefined,
        },
        clothing: {
          name: title.trim(),
          type: customizationEnabled ? 'customize' : 'non_customize',
          description: description || undefined,
          turnaround_days: Number(turnaroundDays) || 0,
          status: isDraft ? 'draft' : 'active',
          taxonomy: {
            product_type: productType,
            categories: organization.category,
            attributes: [...organization.subCategory, ...organization.tag],
            audience: organization.audience,
          },
          images: finalImages,
          color_variants: colorVariants,
          styles: [],
          accessories: [],
          fabrics: [],
        },
      }).unwrap();

      toast.success('Clothing product created successfully.');
      router.push(APP_ROUTES.productsCloth);
    } catch {
      toast.error('Failed to create product. Please try again.');
    }
  };

  return (
    <div className="w-full min-h-screen h-fit pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {isLoadingProduct ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Loading product data...
          </div>
        ) : (
          <>
            {/* Back */}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-grey-black transition-opacity hover:opacity-80"
            >
              <span className="flex size-7 items-center justify-center rounded-full border border-border bg-white">
                <ArrowLeft className="size-4" />
              </span>
              Go Back
            </button>

        {showAlert && (
          <ProductAlertBanner
            message="Upload picture products with close to white background in high resolution and quality"
            onDismiss={() => setShowAlert(false)}
          />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <FieldLabel htmlFor="product-title">Title</FieldLabel>
              <Input
                id="product-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="https://www.garmisland.com"
                className="bg-background"
              />
            </div>

            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <FieldLabel tooltip="Enter product description">
                Description
              </FieldLabel>
              <RichTextEditor value={description} onChange={setDescription} />
              <p className="mt-2 text-xs text-muted-foreground">
                {wordCount} words
              </p>
            </div>

            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <FieldLabel>Upload Media</FieldLabel>
              <FileUploadWidget value={extraFiles} onChange={setExtraFiles} />
            </div>

            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
                Upload Default Images
              </h3>
              <DefaultImagesUploader
                images={defaultImages}
                onChange={setDefaultImages}
              />
            </div>

            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
                Customization
              </h3>
              <CustomizationBuilder
                sections={customizationSections}
                onChange={setCustomizationSections}
              />
            </div>

            <VariantSelectOptions onAddVariant={addVariant} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-grey-black dark:text-white">
                  Status
                </span>
                <StatusPill status={status} />
              </div>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ProductStatus)}
              >
                <SelectTrigger className="w-full bg-background capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-grey-black dark:text-white">
                  Customization
                </span>
                <Switch
                  checked={customizationEnabled}
                  onCheckedChange={setCustomizationEnabled}
                />
              </div>

              {customizationEnabled && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      tooltip="Indicate if measurements are required"
                      className="mb-0 font-normal"
                    >
                      Measurement Required
                    </FieldLabel>
                    <Switch
                      checked={measurementRequired}
                      onCheckedChange={setMeasurementRequired}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="turnaround-days"
                      tooltip="Days required to complete customization"
                      className="font-normal"
                    >
                      Turnaround Days
                    </FieldLabel>
                    <Input
                      id="turnaround-days"
                      type="number"
                      min={1}
                      value={turnaroundDays}
                      onChange={(e) => setTurnaroundDays(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              )}
            </div>

            <ProductOrganizationSection
              value={organization}
              onChange={setOrganization}
              hideProductType={customizationEnabled}
            />

            <ProductPricingSection
              price={price}
              onPriceChange={setPrice}
              discount={discount}
              onDiscountChange={setDiscount}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-8 bg-transparent"
              >
                {isSaving ? 'Saving…' : 'Save as Draft'}
              </Button>
              <Button 
                type="button" 
                onClick={() => handleSave(false)} 
                disabled={isSaving} 
                className="px-8"
              >
                {isSaving ? 'Publishing…' : 'Publish Now'}
              </Button>
            </div>
          </div>
        </div>

            <SetVariantsTable variants={variants} onChange={setVariants} />
          </>
        )}
      </div>
    </div>
  );
}
