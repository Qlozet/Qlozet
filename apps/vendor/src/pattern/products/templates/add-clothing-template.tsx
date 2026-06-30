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
  type CustomComponentItem,
} from '../organisms/customization-builder';
import { APP_ROUTES } from '@/lib/routes';
import {
  useCreateClothingMutation,
  useGetProductQuery,
  useLazyGetProductQuery,
  type ColorVariantDto,
  type CreateClothingDto,
} from '@/redux/services/products/products.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { useLazyGetStyleLibraryQuery } from '@/redux/services/style-library/style-library.api-slice';

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
  const [getProduct] = useLazyGetProductQuery();
  const [getStyleLibrary] = useLazyGetStyleLibraryQuery();
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
      const pAttributes = inner?.taxonomy?.attributes || rawProduct?.tags || [];
      const pCategory = inner?.taxonomy?.categories?.[0] || rawProduct?.category || '';
      const pImages = inner?.images || rawProduct?.images || [];
      const pProductType = inner?.taxonomy?.product_type || rawProduct?.taxonomy?.product_type || '';
      const pAudience = inner?.taxonomy?.audience || rawProduct?.taxonomy?.audience || '';

      const knownSubcategories = ['ankara', 'plain', 'embroidered', 'two-piece'];
      const loadedSubCategories = pAttributes.filter((a: string) => knownSubcategories.includes(a));
      const loadedTags = pAttributes.filter((a: string) => !knownSubcategories.includes(a));

      setTitle(pName);
      setDescription(pDesc);
      setStatus(pStatus as ProductStatus);
      setPrice(pPrice ? String(pPrice) : '');
      
      if (pType === 'customize') {
        setCustomizationEnabled(true);
      }

      setOrganization({
        tag: loadedTags,
        category: pCategory ? [pCategory] : [],
        subCategory: loadedSubCategories, 
        productType: pProductType ? [pProductType] : [], 
        audience: pAudience as any,    
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

      // Restore variants
      if (inner?.color_variants && inner.color_variants.length > 0) {
        const loadedVariants = inner.color_variants.map((cv: any, idx: number) => {
          const sizes = cv.variants?.map((v: any) => v.size || 'M') || [];
          const details: Record<string, SizeDetail> = {};
          cv.variants?.forEach((v: any) => {
            details[v.size || 'M'] = {
              stock: v.stock || 0,
              price: v.price || 0,
              sku: v.sku || '',
              yardsPerOrder: v.yard_per_order || 0,
              selected: false,
            };
          });
          
          const matchingFabric = inner?.fabrics?.find((f: any) => f.name === cv.name);
          
          let imgUrl = undefined;
          if (matchingFabric && matchingFabric.images && matchingFabric.images.length > 0) {
            imgUrl = typeof matchingFabric.images[0] === 'string' ? matchingFabric.images[0] : matchingFabric.images[0].url;
          }

          const fallbackImages = cv.variants?.[0]?.images || [];
          const sourceImages = (cv.images && cv.images.length > 0) ? cv.images : fallbackImages;
          
          if (!imgUrl && sourceImages && sourceImages.length > 0) {
            imgUrl = typeof sourceImages[0] === 'string' ? sourceImages[0] : sourceImages[0].url;
          }
          
          return {
            id: `loaded-var-${idx}`,
            colorHex: cv.hex || '',
            label: cv.name || '',
            imageUrl: imgUrl,
            availableSizes: sizes,
            details,
            images: sourceImages?.map((i: any) => typeof i === 'string' ? i : i.url) || [],
            expanded: false,
            selected: false,
          };
        });
        setVariants(loadedVariants);
      }

      // Restore customizations (styles, fabrics, accessories)
      const newSections = DEFAULT_CUSTOMIZATION_SECTIONS.map(s => ({ ...s, items: s.items ? [...s.items] : [] }));
      
      const mapCustomItems = (backendItems: any[] | undefined): CustomComponentItem[] => {
        return (backendItems || []).map((bItem: any, idx: number) => {
           const img = bItem.images?.[0];
           const imgUrl = typeof img === 'string' ? img : img?.url;
           return {
             id: `loaded-item-${Math.random()}`,
             // eslint-disable-next-line no-underscore-dangle
             productId: bItem._id || bItem.id, // Store original ID if needed later
             label: bItem.name,
             imageUrl: imgUrl,
             price: Number(bItem.price || bItem.base_price || 0),
             originalData: bItem,
           };
        });
      };

      if (inner?.styles && inner.styles.length > 0) {
        const styleSec = newSections.find(s => s.key === 'style');
        if (styleSec) styleSec.items = mapCustomItems(inner.styles);
      }
      if (inner?.accessories && inner.accessories.length > 0) {
        const accSec = newSections.find(s => s.key === 'accessory');
        if (accSec) accSec.items = mapCustomItems(inner.accessories);
      }
      if (inner?.fabrics && inner.fabrics.length > 0) {
        const fabSec = newSections.find(s => s.key === 'fabric');
        if (fabSec) fabSec.items = mapCustomItems(inner.fabrics);
      }

      setCustomizationSections(newSections);

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
      const name = v.label || v.colorHex || 'Unknown';
      
      let uploadedVariantImages: { url: string; public_id: string }[] = [];
      if (v.imageFiles && v.imageFiles.length > 0) {
        const res = await Promise.all(v.imageFiles.map(file => uploadImage(file).unwrap()));
        uploadedVariantImages = res.map(r => ({ url: r.data?.url || '', public_id: r.data?.public_id || 'unknown' })).filter(img => Boolean(img.url));
      }

        const finalVariantImages = [
          ...v.images.filter(url => !url.startsWith('blob:')).map((url) => ({ url, public_id: 'unknown' })),
          ...uploadedVariantImages,
        ];

        return {
          name,
          hex: v.colorHex || '#000000',
          images: finalVariantImages,
          variants: v.availableSizes.map((size) => {
            const detail = v.details[size] ?? makeSizeDetail();
            return {
              size,
              stock: detail.stock || 0,
              price: detail.price || 0,
              sku: detail.sku || '',
              yard_per_order: detail.yardsPerOrder || 0,
              color: { name, hex: v.colorHex || '#000000' },
              images: finalVariantImages,
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

      // Prepare customization objects
      const styles: any[] = [];
      const accessories: any[] = [];
      const fabrics: any[] = [];

      await Promise.all(customizationSections.map(async (sec) => {
        const allItems = [...(sec.items || []), ...(sec.subGroups?.flatMap(sg => sg.items) || [])];
        const fullObjects = await Promise.all(allItems.map(async (it) => {
          if (it.originalData) {
            return {
              ...it.originalData,
              price: Math.max(1, Number(it.price) || 1),
            };
          }
          
          if (!it.productId) return null; // If no backend ID, we skip for now
          
          if (sec.key === 'style') {
            try {
              const res = await getStyleLibrary().unwrap();
              const styleItem = res.styles.find(s => s._id === it.productId);
              if (styleItem) {
                return {
                  name: styleItem.name,
                  style_code: styleItem.style_code || '',
                  categories: styleItem.category ? [styleItem.category] : [],
                  images: styleItem.image_url ? [{ url: styleItem.image_url, public_id: 'unknown' }] : [],
                  attributes: styleItem.attributes || [],
                  price: Math.max(1, Number(it.price) || 1),
                  min_width_cm: 1,
                  type: styleItem.type || 'style',
                };
              }
              return null;
            } catch (e) {
              console.error("Failed to fetch style for custom section", e);
              return null;
            }
          }

          try {
            const res = await getProduct(it.productId).unwrap();
            const prodData = (res as any)?.data || res;
            const finalData = prodData?.kind ? prodData[prodData.kind] : prodData;
            return {
              ...finalData,
              price: Math.max(1, Number(it.price) || 1),
            };
          } catch (e) {
            console.error("Failed to fetch product for custom section", e);
            return null;
          }
        }));

        const validObjects = fullObjects.filter(Boolean);
        if (sec.key === 'style') validObjects.forEach(o => styles.push(o));
        if (sec.key === 'accessory') validObjects.forEach(o => accessories.push(o));
        if (sec.key === 'fabric') validObjects.forEach(o => fabrics.push(o));
      }));

      const payload: CreateClothingDto = {
        ...(editId ? { product_id: editId } : {}),
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
          styles,
          accessories,
          fabrics,
        },
      };

      console.log("SENDING PAYLOAD TO BACKEND:", JSON.stringify(payload.clothing.color_variants, null, 2));

      await createClothing(payload).unwrap();

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
