'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GoBackButton } from '@/pattern/common/atoms/go-back-button';
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
import type { StyleHotspotDto } from '@/redux/services/products/products.api-slice';
import NiceModal from '@ebay/nice-modal-react';
import { HotspotEditorModal } from '../organisms/hotspot-editor-modal';
import { Layers } from 'lucide-react';
import { useLazyGetStyleLibraryQuery } from '@/redux/services/style-library/style-library.api-slice';
import { uploadSequentially } from '@/lib/utils';
import { useGetCategoriesForTypeQuery } from '@/redux/services/taxonomy/taxonomy.api-slice';
import { useGetBusinessProfileQuery } from '@/redux/services/settings/settings.api-slice';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

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
  const [hotspots, setHotspots] = useState<StyleHotspotDto[]>([]);

  const [customizationEnabled, setCustomizationEnabled] = useState(false);
  const [measurementRequired, setMeasurementRequired] = useState(false);
  const [turnaroundDays, setTurnaroundDays] = useState('2');
  const [customizationSections, setCustomizationSections] = useState<
    CustomSection[]
  >(DEFAULT_CUSTOMIZATION_SECTIONS);

  // External fabric override: null = inherit, true = always, false = never
  const [externalFabricOverride, setExternalFabricOverride] = useState<boolean | null>(null);
  const { data: businessProfile } = useGetBusinessProfileQuery();

  const [organization, setOrganization] = useState<ProductOrganizationValue>({
    productType: '',
    category: [],
    tags: [],
    audience: '',
  });
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // Fetch attributes for the selected product type (needed for submission)
  const { data: categoryData } = useGetCategoriesForTypeQuery(
    { kind: 'clothing', product_type: organization.productType },
    { skip: !organization.productType }
  );

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
      if (pImages && pImages.length > 0) {
        const firstImage = typeof pImages[0] === 'object' ? pImages[0] : null;
        if (firstImage && firstImage.hotspots) {
          setHotspots(firstImage.hotspots);
        }
      }
      const pProductType = inner?.taxonomy?.product_type || rawProduct?.taxonomy?.product_type || '';
      const pAudience = inner?.taxonomy?.audience || rawProduct?.taxonomy?.audience || '';

      setTitle(pName);
      setDescription(pDesc);
      setStatus(pStatus as ProductStatus);
      setPrice(pPrice ? String(pPrice) : '');
      
      if (pType === 'customize') {
        setCustomizationEnabled(true);
      }

      // External fabric override
      const pExtFabric = inner?.accepts_external_fabric;
      if (pExtFabric === true) setExternalFabricOverride(true);
      else if (pExtFabric === false) setExternalFabricOverride(false);
      else setExternalFabricOverride(null);

      // Map backend tags to the new ProductTag shape
      const rawTags = rawProduct?.tags || [];
      const loadedTags = rawTags.map((t: any) => ({
        name: t.name || t,
        slug: t.slug || (typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '-') : ''),
        type: (t.type as 'system' | 'custom') || 'system',
      }));

      // Legacy products may have product_type='customisable' or 'ready-made'
      // which don't exist in the taxonomy. Clear them so the vendor re-selects.
      const legacyTypes = ['customisable', 'ready-made', 'ready_made', 'customize', 'non_customize'];
      const validProductType = pProductType && !legacyTypes.includes(pProductType.toLowerCase())
        ? pProductType
        : '';

      setOrganization({
        productType: validProductType,
        category: pCategory ? [pCategory] : [],
        tags: loadedTags,
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
      const newSections = DEFAULT_CUSTOMIZATION_SECTIONS.map(s => ({
        ...s,
        items: s.items ? [...s.items] : undefined,
        subGroups: s.subGroups ? s.subGroups.map(sg => ({ ...sg, items: [...sg.items] })) : [],
      }));
      
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
             category: bItem.categories?.[0] || bItem.category || '',
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
        if (fabSec) {
          fabSec.items = (inner.fabrics || []).map((bItem: any, idx: number) => {
            const img = bItem.images?.[0];
            const imgUrl = typeof img === 'string' ? img : img?.url;
            const firstVariant = bItem.variants?.[0];
            return {
              id: `loaded-fabric-${Math.random()}`,
              productId: bItem._id || bItem.id,
              label: bItem.name,
              imageUrl: imgUrl,
              price: Number(bItem.price || bItem.price_per_yard || 0),
              yardsPerOrder: firstVariant?.yard_per_order,
              originalData: bItem,
            };
          });
        }
      }

      // Restore addons sub-groups
      if (inner?.addons && inner.addons.length > 0) {
        const addonsSec = newSections.find(s => s.key === 'addons');
        if (addonsSec) {
          addonsSec.subGroups = inner.addons.map((addon: any, idx: number) => ({
            key: `addon-${addon.name?.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
            title: addon.name || 'Add-On',
            displayType: addon.display_type || 'colour',
            items: (addon.variants || []).map((v: any, vIdx: number) => ({
              id: `addon-variant-${idx}-${vIdx}-${Math.random()}`,
              label: v.name || 'Variant',
              price: v.price || 0,
              colorHex: v.color_hex,
              imageUrl: v.image_url,
            })),
          }));
        }
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

    // Backend requires a non-empty taxonomy.product_type. The vendor must
    // always pick one from the API-driven dropdown.
    const productType = organization.productType;
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
        const res = await uploadSequentially(v.imageFiles, file => uploadImage(file).unwrap());
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
      const uploadedDefaults = await uploadSequentially(
        localDefaultImages,
        async (img) => {
          const res = await uploadImage(img.file!).unwrap();
          return { url: res.data?.url || '', public_id: res.data?.public_id || 'unknown' };
        }
      );
      
      const defaultImageUrls = [
        ...defaultImages.filter(img => !img.isLocal).map(img => ({ url: img.url, public_id: 'unknown' })),
        ...uploadedDefaults.filter(img => !!img.url)
      ];

      const uploadedExtras = await uploadSequentially(
        extraFiles,
        async (file) => {
          const res = await uploadImage(file).unwrap();
          return { url: res.data?.url || '', public_id: res.data?.public_id || 'unknown' };
        }
      );
      
      const extraImageUrls = uploadedExtras.filter(img => !!img.url);
      
      const finalImages: any[] = [...defaultImageUrls, ...extraImageUrls];
      if (finalImages.length > 0 && hotspots.length > 0) {
        finalImages[0] = { ...finalImages[0], hotspots };
      }

      // Prepare customization objects
      const styles: any[] = [];
      const accessories: any[] = [];
      const fabrics: any[] = [];

      await Promise.all(customizationSections.map(async (sec) => {
        const allItems = [...(sec.items || []), ...(sec.subGroups?.flatMap(sg => sg.items) || [])];
        const fullObjects = await Promise.all(allItems.map(async (it) => {
          if (it.originalData) {
            let updatedImages = it.originalData.images || [];
            return {
              ...it.originalData,
              price: Math.max(1, Number(it.price) || 1),
              images: updatedImages,
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
                  description: styleItem.description || '',
                  aliases: styleItem.aliases || [],
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

          // Fabric items: fetch full product, spread all data, ensure variants has yard_per_order
          if (sec.key === 'fabric') {
            try {
              const res = await getProduct(it.productId).unwrap();
              const prodData = (res as any)?.data || res;
              const finalData = prodData?.kind ? prodData[prodData.kind] : prodData;
              const existingVariants = Array.isArray(finalData.variants) ? finalData.variants : [];
              const yardsPerOrder = it.yardsPerOrder || 3;
              const variants = existingVariants.length > 0
                ? existingVariants.map((v: any) => ({
                    ...v,
                    yard_per_order: v.yard_per_order || yardsPerOrder,
                  }))
                : [{ size: 'default', stock: 100, price: finalData.price_per_yard || 1, sku: `fabric-${it.productId}`, yard_per_order: yardsPerOrder }];
              return {
                ...finalData,
                variants,
              };
            } catch (e) {
              console.error("Failed to fetch fabric for custom section", e);
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

      // Build addons from the addons section's sub-groups
      const addonsSection = customizationSections.find(s => s.key === 'addons');
      const addons = (addonsSection?.subGroups ?? [])
        .filter(sg => sg.displayType && sg.items.length > 0)
        .map(sg => ({
          name: sg.title,
          display_type: sg.displayType as 'colour' | 'picture',
          variants: sg.items.map(item => ({
            name: item.label || 'Variant',
            price: item.price || 0,
            ...(sg.displayType === 'colour' && item.colorHex ? { color_hex: item.colorHex } : {}),
            ...(sg.displayType === 'picture' && item.imageUrl ? { image_url: item.imageUrl } : {}),
          })),
        }));

      const payload: CreateClothingDto = {
        ...(editId ? { product_id: editId } : {}),
        seo: { title: title.trim() },
        metafields: {
          base_price: price ? Number(price) : undefined,
          discount: discount || undefined,
          tags: organization.tags,
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
            attributes: categoryData?.attributes || organization.category,
            audience: organization.audience,
          },
          images: finalImages,
          color_variants: colorVariants,
          styles,
          accessories,
          fabrics,
          ...(addons.length > 0 ? { addons } : {}),
          accepts_external_fabric: externalFabricOverride,
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
              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <p className="font-medium text-foreground">Interactive Hotspots</p>
                  <p className="text-muted-foreground text-xs">Link style options to your primary product image.</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={defaultImages.length === 0}
                  onClick={async () => {
                    const primary = defaultImages[0];
                    if (!primary) return;
                    const result = await NiceModal.show(HotspotEditorModal, {
                      imageUrl: primary.url,
                      hotspots,
                      sections: customizationSections,
                    });
                    if (result !== undefined) {
                      setHotspots(result as StyleHotspotDto[]);
                    }
                  }}
                >
                  <Layers className="size-4 mr-2" />
                  Configure Hotspots
                </Button>
              </div>
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

            {variants.length > 0 && (
              <SetVariantsTable variants={variants} onChange={setVariants} />
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
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
                <SelectTrigger className="w-full bg-background dark:bg-muted dark:border-white/10 capitalize">
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

            {/* External Fabric Override */}
            <div className="rounded-lg bg-card p-6 custom-card-shadow">
              <div className="mb-3">
                <span className="text-sm font-semibold text-grey-black dark:text-white">
                  External Fabric
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Override your store-wide setting for this product only.
                </p>
              </div>
              <RadioGroup
                value={
                  externalFabricOverride === null
                    ? 'inherit'
                    : externalFabricOverride
                      ? 'always'
                      : 'never'
                }
                onValueChange={(val) => {
                  if (val === 'inherit') setExternalFabricOverride(null);
                  else if (val === 'always') setExternalFabricOverride(true);
                  else setExternalFabricOverride(false);
                }}
                className="space-y-2.5"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inherit" id="ef-inherit" />
                  <Label htmlFor="ef-inherit" className="text-sm font-normal cursor-pointer">
                    Inherit from store settings{' '}
                    <span className="text-xs text-muted-foreground">
                      (currently: {businessProfile?.accepts_external_fabric !== false ? 'ON' : 'OFF'})
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="always" id="ef-always" />
                  <Label htmlFor="ef-always" className="text-sm font-normal cursor-pointer">
                    Always accept
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="ef-never" />
                  <Label htmlFor="ef-never" className="text-sm font-normal cursor-pointer">
                    Never accept
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex items-start gap-2 mt-3 p-2.5 rounded-md bg-muted/50">
                <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  This overrides your store-wide setting for this specific product only.
                </p>
              </div>
            </div>

            <ProductOrganizationSection
              value={organization}
              onChange={setOrganization}
              
            />

            <ProductPricingSection
              price={price}
              onPriceChange={setPrice}
              discount={discount}
              onDiscountChange={setDiscount}
            />

            <div className="flex flex-col gap-3">
              <Button 
                type="button" 
                onClick={() => handleSave(false)} 
                disabled={isSaving} 
                className="h-12 w-full"
              >
                {isSaving ? 'Publishing…' : 'Publish Now'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="h-12 w-full bg-transparent"
              >
                {isSaving ? 'Saving…' : 'Save as Draft'}
              </Button>
            </div>
            </div>
          </div>
        </div>

          </>
        )}
      </div>
    </div>
  );
}
