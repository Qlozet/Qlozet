'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  type ColorVariantDto,
} from '@/redux/services/products/products.api-slice';

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
  const [createClothing, { isLoading: isSaving }] = useCreateClothingMutation();

  const [showAlert, setShowAlert] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [defaultImages, setDefaultImages] = useState<DefaultImage[]>([]);

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
  });
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a product title.');
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

    const colorVariants: ColorVariantDto[] = variants.map((v) => {
      const name = v.label || v.colorHex;
      return {
        name,
        hex: v.colorHex,
        images: [
          ...(v.imageUrl ? [{ url: v.imageUrl, public_id: '' }] : []),
          ...v.images.map((url) => ({ url, public_id: '' })),
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
    });

    try {
      await createClothing({
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
          status,
          taxonomy: {
            product_type: productType,
            categories: organization.category,
            attributes: [...organization.subCategory, ...organization.tag],
            audience: '',
          },
          images: defaultImages
            .filter((img) => !img.isLocal)
            .map((img) => ({ url: img.url, public_id: '' })),
          color_variants: colorVariants,
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
              <FileUploadWidget />
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

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="px-8">
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        <SetVariantsTable variants={variants} onChange={setVariants} />
      </div>
    </div>
  );
}
