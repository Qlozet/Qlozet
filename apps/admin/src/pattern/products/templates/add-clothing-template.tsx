'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { GoBackButton } from '@/pattern/admin/atoms/go-back-button';
import { RichTextEditor } from '@/pattern/common/organisms/rich-text-editor';
import { FileUploadWidget } from '@/pattern/common/organisms/file-upload-widget';
import { ProductAlertBanner } from '../molecules/product-alert-banner';
import { FieldLabel } from '../atoms/field-label';
import { StatusIndicator } from '../atoms/status-indicator';
import {
  ProductOrganizationSection,
  type ProductOrganizationValue,
} from '../organisms/product-organization-section';
import { ProductPricingSection } from '../organisms/product-pricing-section';
import {
  VariantSelectOptions,
  type VariantDescriptor,
} from '../organisms/variant-select-options';
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
import {
  useGetAdminProductQuery,
  useUpdateAdminProductMutation,
} from '@/redux/services/products/admin-products.api-slice';
import { readApiError } from '@/redux/services/types';
import { getKindDetail } from '@/lib/products';

const countWords = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

type ProductStatus = 'active' | 'draft' | 'archived';

interface AddClothingTemplateProps {
  /** Set to edit an existing product instead of creating a new one. */
  productId?: string;
}

/** Rebuild the Set Variants rows from a saved product's colour variants. */
const toVariantRows = (
  colorVariants: {
    name?: string;
    hex?: string;
    images?: { url?: string }[];
    variants?: {
      size?: string;
      stock?: number;
      price?: number;
      sku?: string;
      yard_per_order?: number;
    }[];
  }[]
): VariantRow[] =>
  colorVariants.map((colour, index) => {
    const sizes = (colour.variants ?? [])
      .map((variant) => variant.size)
      .filter((size): size is string => Boolean(size));

    const details: Record<string, SizeDetail> = {};
    for (const variant of colour.variants ?? []) {
      if (!variant.size) continue;
      details[variant.size] = {
        ...makeSizeDetail(),
        stock: variant.stock ?? 0,
        price: variant.price ?? 0,
        sku: variant.sku ?? '',
        yardsPerOrder: variant.yard_per_order ?? 0,
      };
    }

    const images = (colour.images ?? [])
      .map((image) => image?.url)
      .filter((url): url is string => Boolean(url));

    return {
      id: `${colour.hex ?? colour.name ?? 'variant'}-${index}`,
      colorHex: colour.hex ?? '',
      label: colour.name,
      availableSizes: sizes,
      details,
      images,
      expanded: false,
      selected: false,
    };
  });

// Clothing product form — creates a new product, or edits an existing one when
// `productId` is set (the catalogue's "Edit product" row action links here).
export const AddClothingTemplate = ({
  productId,
}: AddClothingTemplateProps = {}) => {
  const isEdit = Boolean(productId);
  const [showAlert, setShowAlert] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');
  // What the product arrived as. An edit that never touches the Select must not
  // send `status` at all — a product mid-schedule reads as "scheduled", which
  // isn't one of the three options here, and echoing a status back would cancel
  // its pending activation.
  const [initialStatus, setInitialStatus] = useState<string | undefined>();
  const [, setMediaFiles] = useState<File[]>([]);
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
    audience: '',
  });
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const router = useRouter();
  const [createClothing, { isLoading: isCreating }] =
    useCreateClothingMutation();
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateAdminProductMutation();
  const { data: existing, isLoading: isLoadingProduct } =
    useGetAdminProductQuery(productId ?? '', { skip: !productId });

  const isSaving = isCreating || isUpdating;

  const loaded = existing?.data;
  const clothing = useMemo(
    () =>
      (loaded ? getKindDetail(loaded) : {}) as {
        name?: string;
        description?: string;
        type?: string;
        turnaround_days?: number;
        taxonomy?: {
          product_type?: string;
          categories?: string[];
          attributes?: string[];
          audience?: string;
        };
        images?: { url?: string }[];
        color_variants?: Parameters<typeof toVariantRows>[0];
      },
    [loaded]
  );

  // Seed the form once the product arrives. Keyed on the document id so a
  // second render of the same product doesn't stomp on edits in progress.
  useEffect(() => {
    if (!loaded?._id) return;
    setTitle(clothing.name ?? '');
    setDescription(clothing.description ?? '');
    setInitialStatus(loaded.status);
    // 'scheduled' has no Select option — show the underlying draft state; the
    // schedule itself is left alone because `status` won't be sent unchanged.
    setStatus(
      loaded.status === 'active' || loaded.status === 'archived'
        ? (loaded.status as ProductStatus)
        : 'draft'
    );
    setCustomizationEnabled(clothing.type === 'customize');
    setTurnaroundDays(String(clothing.turnaround_days ?? 2));
    setDefaultImages(
      (clothing.images ?? [])
        .map((image) => image?.url)
        .filter((url): url is string => Boolean(url))
        .map((url) => ({ url, isLocal: false }))
    );
    setOrganization({
      tag: [],
      category: clothing.taxonomy?.categories ?? [],
      subCategory: clothing.taxonomy?.attributes ?? [],
      productType: clothing.taxonomy?.product_type
        ? [clothing.taxonomy.product_type]
        : [],
      audience: (clothing.taxonomy?.audience ??
        '') as ProductOrganizationValue['audience'],
    });
    const basePrice =
      loaded.base_price ??
      (loaded.metafields as { base_price?: number } | undefined)?.base_price;
    setPrice(basePrice !== undefined ? String(basePrice) : '');
    setDiscount(
      loaded.discount_percentage ? String(loaded.discount_percentage) : ''
    );
    setVariants(toVariantRows(clothing.color_variants ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded?._id]);

  const wordCount = countWords(description);

  // Create a Set Variants row from the colour/fabric + sizes chosen in Select
  // Options.
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

    if (!organization.audience) {
      toast.error('Please select a target audience.');
      return;
    }

    // Map each variant row + its per-size details into the colour_variants
    // contract the backend expects (POST /products/clothing).
    const colorVariants: ColorVariantDto[] = variants.map((v) => {
      const name = v.label || v.colorHex;
      return {
        name,
        hex: v.colorHex,
        // Fabric swatch + any per-variant product images.
        images: [
          ...(v.imageUrl ? [{ url: v.imageUrl }] : []),
          ...v.images.map((url) => ({ url })),
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

    const clothingPayload = {
      name: title.trim(),
      type: (customizationEnabled ? 'customize' : 'non_customize') as
        | 'customize'
        | 'non_customize',
      description: description || undefined,
      turnaround_days: Number(turnaroundDays) || 0,
      status,
      taxonomy: {
        product_type: organization.productType[0] ?? '',
        categories: organization.category,
        attributes: [...organization.subCategory, ...organization.tag],
        audience: organization.audience,
      },
      // Only hosted ("Add from URL") images can be submitted — local file
      // previews have no upload endpoint yet.
      images: defaultImages
        .filter((img) => !img.isLocal)
        .map((img) => ({ url: img.url })),
      color_variants: colorVariants,
    };

    // Base price/discount aren't first-class on the clothing contract (pricing
    // is per-variant), so preserve them as metafields too.
    const metafields = {
      base_price: price ? Number(price) : undefined,
      discount: discount || undefined,
    };

    try {
      if (productId) {
        await updateProduct({
          id: productId,
          seo: { title: title.trim() },
          metafields,
          base_price: price ? Number(price) : undefined,
          status: status === initialStatus ? undefined : status,
          clothing: clothingPayload,
        }).unwrap();
        toast.success('Product updated.');
      } else {
        await createClothing({
          seo: { title: title.trim() },
          metafields,
          clothing: {
            ...clothingPayload,
            styles: [],
            accessories: [],
            fabrics: [],
          },
        }).unwrap();
        toast.success('Clothing product created successfully.');
      }
      router.push(APP_ROUTES.productsCloth);
    } catch (error) {
      toast.error(
        readApiError(
          error,
          productId
            ? 'Failed to update product. Please try again.'
            : 'Failed to create product. Please try again.'
        )
      );
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="w-full min-h-screen h-fit pb-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <GoBackButton />
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            Loading product…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen h-fit pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <GoBackButton />

        {showAlert && (
          <ProductAlertBanner
            message="Upload picture products with close to white background in high resolution and quality"
            onDismiss={() => setShowAlert(false)}
          />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title */}
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

            {/* Description */}
            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <FieldLabel tooltip="Enter product description">
                Description
              </FieldLabel>
              <RichTextEditor value={description} onChange={setDescription} />
              <p className="mt-2 text-xs text-muted-foreground">
                {wordCount} words
              </p>
            </div>

            {/* Upload Media */}
            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <FieldLabel>Upload Media</FieldLabel>
              <FileUploadWidget onFilesChange={setMediaFiles} />
            </div>

            {/* Upload Default Images */}
            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
                Upload Default Images
              </h3>
              <DefaultImagesUploader
                images={defaultImages}
                onChange={setDefaultImages}
              />
            </div>

            {/* Customization builder */}
            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
                Customization
              </h3>
              <CustomizationBuilder
                sections={customizationSections}
                onChange={setCustomizationSections}
              />
            </div>

            {/* Select Options (Variants) */}
            <VariantSelectOptions onAddVariant={addVariant} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Status */}
            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-grey-black dark:text-white">
                  Status
                </span>
                <StatusIndicator status={status} />
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

            {/* Customization toggle */}
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

            {/* Product Organization */}
            <ProductOrganizationSection
              value={organization}
              onChange={setOrganization}
            />

            {/* Pricing */}
            <ProductPricingSection
              price={price}
              onPriceChange={setPrice}
              discount={discount}
              onDiscountChange={setDiscount}
            />

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="px-8">
                {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Set Variants — full-width section at the bottom */}
        <SetVariantsTable variants={variants} onChange={setVariants} />
      </div>
    </div>
  );
};
