'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { readApiError } from '@/redux/services/types';
import { Button } from '@/components/ui/button';
import { GoBackButton } from '@/pattern/common/atoms/go-back-button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/pattern/common/organisms/rich-text-editor';
import { ListingReadinessCard } from '../molecules/listing-readiness-card';
import {
  listingReadiness,
  visibleText,
  LISTING_RULES,
} from '../lib/listing-readiness';
import { FieldLabel } from '../atoms/field-label';
import { StatusPill } from '../atoms/status-pill';
import {
  ProductOrganizationSection,
  type ProductOrganizationValue,
} from '../organisms/clothing-organization-section';
import { ProductPricingSection } from '../organisms/clothing-pricing-section';
import {
  VariantSelectOptions,
  STANDARD_SIZE_OPTIONS,
  type SizeOption,
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
import { useLazyGetStyleLibraryQuery } from '@/redux/services/style-library/style-library.api-slice';
import { cn, uploadSequentially } from '@/lib/utils';
import { useGetCategoriesForTypeQuery } from '@/redux/services/taxonomy/taxonomy.api-slice';
import { useGetBusinessProfileQuery } from '@/redux/services/settings/settings.api-slice';
import { useGetSizeGuidesQuery } from '@/redux/services/size-guides/size-guides.api-slice';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PendingReviewNote } from '../molecules/listing-review-copy';

type ProductStatus = 'active' | 'draft' | 'archived';
type ModerationStatus = 'pending' | 'approved' | 'rejected';

// One numbered heading per section, so the form reads as a path: what it
// is, what it looks like, what it comes in, how it is made.
const SectionHeader = ({
  step,
  title,
  lead,
}: {
  step: number;
  title: string;
  lead?: ReactNode;
}) => (
  <div className="mb-4">
    <div className="flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary tabular-nums">
        {step}
      </span>
      <h3 className="text-sm font-semibold text-grey-black dark:text-white">
        {title}
      </h3>
    </div>
    {lead && <p className="mt-1.5 text-xs text-muted-foreground">{lead}</p>}
  </div>
);

// Add Clothing product form (vendor). Shares the admin component set, wired to
// the vendor's own create-clothing endpoint.
export default function AddClothingTemplate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { data: productData, isLoading: isLoadingProduct } = useGetProductQuery(
    editId as string,
    {
      skip: !editId,
    }
  );

  const [createClothing, { isLoading: isCreating }] =
    useCreateClothingMutation();
  const [getProduct] = useLazyGetProductQuery();
  const [getStyleLibrary] = useLazyGetStyleLibraryQuery();
  const [uploadImage, { isLoading: isUploading }] =
    useUploadProductImageMutation();
  const isSaving = isCreating || isUploading;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');
  // Platform review of the listing (set by the admin catalogue). Read-only
  // here; shown so a vendor editing a listing knows whether it is live.
  const [moderation, setModeration] = useState<{
    status: ModerationStatus;
    reason?: string | null;
  } | null>(null);
  const [defaultImages, setDefaultImages] = useState<DefaultImage[]>([]);

  const [customizationEnabled, setCustomizationEnabled] = useState(false);
  // Garment fabric requirement: yards this garment uses per size (bill of
  // materials). Drives fabric pricing, cross-vendor fabric, and inventory.
  const [yardagePerSize, setYardagePerSize] = useState<Record<string, number>>(
    {}
  );
  const [turnaroundDays, setTurnaroundDays] = useState('2');
  const [customizationSections, setCustomizationSections] = useState<
    CustomSection[]
  >(DEFAULT_CUSTOMIZATION_SECTIONS);

  // External fabric override: null = inherit, true = always, false = never
  const [externalFabricOverride, setExternalFabricOverride] = useState<
    boolean | null
  >(null);
  const { data: businessProfile } = useGetBusinessProfileQuery();

  const [organization, setOrganization] = useState<ProductOrganizationValue>({
    productType: '',
    category: [],
    tags: [],
    audience: '',
  });
  const [price, setPrice] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // The size guide this garment follows. Its sizes become the ones on offer
  // and its chart is what the shop shows; the vendor's guides may also attach
  // themselves by their own conditions, which shows up here pre-selected.
  const [sizeGuideId, setSizeGuideId] = useState<string | null>(null);
  const { data: sizeGuidesRes } = useGetSizeGuidesQuery();
  const sizeGuides = sizeGuidesRes?.data ?? [];
  const activeGuide = sizeGuides.find((g) => g._id === sizeGuideId) ?? null;
  const sizeOptions: SizeOption[] =
    activeGuide && activeGuide.sizes.length > 0
      ? [...activeGuide.sizes]
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((sz) => ({ value: sz.label.trim(), label: sz.label.trim() }))
      : STANDARD_SIZE_OPTIONS;

  // Unsaved-work guard. A snapshot of everything the vendor can change is
  // compared to the one taken after the form settled (empty for a new
  // listing, populated for an edit); leaving with a difference asks first.
  const [loadedAt, setLoadedAt] = useState(0);
  const [baseline, setBaseline] = useState<string | null>(null);
  // Flipped once a save lands, so the guard does not fire on the way out.
  const [saved, setSaved] = useState(false);

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
      const pPrice =
        rawProduct?.base_price ||
        rawProduct?.metafields?.base_price ||
        rawProduct?.price ||
        '';
      const pType = inner?.type || rawProduct?.type || '';
      const pAttributes = inner?.taxonomy?.attributes || rawProduct?.tags || [];
      const pCategory =
        inner?.taxonomy?.categories?.[0] || rawProduct?.category || '';
      const pImages = inner?.images || rawProduct?.images || [];
      const pProductType =
        inner?.taxonomy?.product_type ||
        rawProduct?.taxonomy?.product_type ||
        '';
      const pAudience =
        inner?.taxonomy?.audience || rawProduct?.taxonomy?.audience || '';

      setTitle(pName);
      setDescription(pDesc);
      setStatus(pStatus as ProductStatus);
      const pModeration = rawProduct?.moderation;
      setModeration(
        pModeration?.status
          ? {
              status: pModeration.status as ModerationStatus,
              reason: pModeration.reason ?? null,
            }
          : null
      );
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
        slug:
          t.slug ||
          (typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '-') : ''),
        type: (t.type as 'system' | 'custom') || 'system',
      }));

      // Legacy products may have product_type='customisable' or 'ready-made'
      // which don't exist in the taxonomy. Clear them so the vendor re-selects.
      const legacyTypes = [
        'customisable',
        'ready-made',
        'ready_made',
        'customize',
        'non_customize',
      ];
      const validProductType =
        pProductType && !legacyTypes.includes(pProductType.toLowerCase())
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
              hotspots: img?.hotspots || [],
            };
          })
        );
      }

      // Restore variants
      if (inner?.color_variants && inner.color_variants.length > 0) {
        const loadedVariants = inner.color_variants.map(
          (cv: any, idx: number) => {
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

            const matchingFabric = inner?.fabrics?.find(
              (f: any) => f.name === cv.name
            );

            let imgUrl = undefined;
            if (
              matchingFabric &&
              matchingFabric.images &&
              matchingFabric.images.length > 0
            ) {
              imgUrl =
                typeof matchingFabric.images[0] === 'string'
                  ? matchingFabric.images[0]
                  : matchingFabric.images[0].url;
            }

            const fallbackImages = cv.variants?.[0]?.images || [];
            const sourceImages =
              cv.images && cv.images.length > 0 ? cv.images : fallbackImages;

            if (!imgUrl && sourceImages && sourceImages.length > 0) {
              imgUrl =
                typeof sourceImages[0] === 'string'
                  ? sourceImages[0]
                  : sourceImages[0].url;
            }

            return {
              id: `loaded-var-${idx}`,
              colorHex: cv.hex || '',
              label: cv.name || '',
              imageUrl: imgUrl,
              availableSizes: sizes,
              details,
              images:
                sourceImages?.map((i: any) =>
                  typeof i === 'string' ? i : i.url
                ) || [],
              expanded: false,
              selected: false,
            };
          }
        );
        setVariants(loadedVariants);
      }

      // Restore customizations (styles, fabrics, accessories)
      const newSections = DEFAULT_CUSTOMIZATION_SECTIONS.map((s) => ({
        ...s,
        items: s.items ? [...s.items] : undefined,
        subGroups: s.subGroups
          ? s.subGroups.map((sg) => ({ ...sg, items: [...sg.items] }))
          : [],
      }));

      const mapCustomItems = (
        backendItems: any[] | undefined
      ): CustomComponentItem[] => {
        return (backendItems || []).map((bItem: any, idx: number) => {
          const img = bItem.images?.[0];
          const imgUrl = typeof img === 'string' ? img : img?.url;
          return {
            id: `loaded-item-${Math.random()}`,

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
        const styleSec = newSections.find((s) => s.key === 'style');
        if (styleSec) styleSec.items = mapCustomItems(inner.styles);
      }
      if (inner?.accessories && inner.accessories.length > 0) {
        const accSec = newSections.find((s) => s.key === 'accessory');
        if (accSec) accSec.items = mapCustomItems(inner.accessories);
      }
      if (inner?.fabrics && inner.fabrics.length > 0) {
        const fabSec = newSections.find((s) => s.key === 'fabric');
        if (fabSec) {
          fabSec.items = (inner.fabrics || []).map(
            (bItem: any, idx: number) => {
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
            }
          );
        }
      }

      // Restore addons sub-groups
      if (inner?.addons && inner.addons.length > 0) {
        const addonsSec = newSections.find((s) => s.key === 'addons');
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

      const sg = rawProduct?.size_guide;
      setSizeGuideId(
        sg ? String(typeof sg === 'object' && sg?._id ? sg._id : sg) : null
      );
      setLoadedAt(Date.now());
    }
  }, [productData]);

  const descriptionChars = visibleText(description).length;

  const hasCustomItems = customizationSections.some(
    (sec) =>
      (sec.items && sec.items.length > 0) ||
      sec.subGroups?.some((sg) => sg.items && sg.items.length > 0)
  );
  const optionCount = customizationSections.reduce(
    (n, sec) =>
      n +
      (sec.items?.length ?? 0) +
      (sec.subGroups?.reduce((m, sg) => m + sg.items.length, 0) ?? 0),
    0
  );

  const snapshot = JSON.stringify({
    title,
    description,
    photos: defaultImages.map((i) => i.url),
    variants: variants.map((v) => ({
      c: v.colorHex,
      l: v.label,
      s: v.availableSizes,
      d: v.details,
      i: v.images,
    })),
    organization,
    price,
    customizationEnabled,
    turnaroundDays,
    yardagePerSize,
    externalFabricOverride,
    sizeGuideId,
    options: customizationSections.map((sec) => ({
      k: sec.key,
      i: sec.items?.map((it) => [it.productId, it.label, it.price]),
      g: sec.subGroups?.map((sg) => [sg.title, sg.items.length]),
    })),
  });
  useEffect(() => {
    // Runs on mount (new listing: empty baseline) and again once an edited
    // product has been poured into state (loadedAt changes in that pass).
    setBaseline(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedAt]);
  const dirty = baseline !== null && snapshot !== baseline && !saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const leave = () => {
    if (
      dirty &&
      !window.confirm(
        'Leave without saving? The changes on this page will be lost.'
      )
    )
      return;
    router.push(APP_ROUTES.productsCloth);
  };

  // The server's publish rules, live. Publish is enabled only when this is
  // ready; a draft can always be saved.
  const readiness = listingReadiness({
    title,
    descriptionHtml: description,
    photoCount: defaultImages.length,
    price,
    productType: organization.productType,
    audience: organization.audience,
    variants: variants.map((v) => ({
      sizes: v.availableSizes.map((size) => ({
        stock: v.details[size]?.stock ?? 0,
      })),
    })),
    madeToOrder: customizationEnabled,
    turnaroundDays,
    optionCount,
  });

  const addVariant = (descriptor: VariantDescriptor, sizeKeys: string[]) => {
    // Keep sizes in the order the size list gives them (the guide's order,
    // or XS → XXL), whatever order they were picked in; unknown sizes last.
    const SIZE_ORDER = sizeOptions.map((o) => o.value);
    const sortSizes = (arr: string[]) =>
      [...arr].sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(a);
        const ib = SIZE_ORDER.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });

    // Same colour/fabric added again → merge the new sizes into that existing
    // row instead of creating a duplicate colour. Sizes already present stay as
    // they are (their stock/price aren't reset).
    const matches = (v: VariantRow) => {
      if (descriptor.colorHex && v.colorHex)
        return v.colorHex.toLowerCase() === descriptor.colorHex.toLowerCase();
      if (descriptor.label && v.label) return v.label === descriptor.label;
      return false;
    };

    setVariants((prev) => {
      const idx = prev.findIndex(matches);

      if (idx >= 0) {
        const existing = prev[idx];
        const newSizes = sizeKeys.filter(
          (s) => !existing.availableSizes.includes(s)
        );
        if (newSizes.length === 0) return prev; // every size already exists
        const details = { ...existing.details };
        newSizes.forEach((size) => {
          details[size] = makeSizeDetail();
        });
        const merged: VariantRow = {
          ...existing,
          availableSizes: sortSizes([...existing.availableSizes, ...newSizes]),
          details,
          expanded: true,
        };
        const next = [...prev];
        next[idx] = merged;
        return next;
      }

      // New colour/fabric → new row.
      const details: Record<string, SizeDetail> = {};
      sizeKeys.forEach((size) => {
        details[size] = makeSizeDetail();
      });
      const key = descriptor.colorHex ?? descriptor.label ?? 'variant';
      return [
        ...prev,
        {
          id: `${key}-${prev.length}-${sizeKeys.join('')}`,
          colorHex: descriptor.colorHex ?? '',
          imageUrl: descriptor.imageUrl,
          label: descriptor.label,
          availableSizes: sortSizes(sizeKeys),
          details,
          images: [],
          expanded: true,
          selected: false,
        },
      ];
    });
  };

  const handleSave = async (isDraft = false) => {
    // A draft is a workbench: only what the API cannot store without is
    // required. Publishing is gated by the readiness list - the same rules
    // the server enforces, so a listing that is green here is accepted there.
    if (!title.trim()) {
      toast.error('Give the product a title first.');
      return;
    }
    // Backend requires a non-empty taxonomy.product_type even on a draft.
    const productType = organization.productType;
    if (!productType) {
      toast.error('Choose a product type first.');
      return;
    }
    if (isDraft && !organization.audience) {
      toast.error('Choose an audience first.');
      return;
    }
    if (!isDraft && !readiness.ready) {
      toast.error(readiness.firstProblem ?? 'The listing is not ready yet.');
      return;
    }

    const colorVariants: ColorVariantDto[] = await Promise.all(
      variants.map(async (v) => {
        const name = v.label || v.colorHex || 'Unknown';

        let uploadedVariantImages: { url: string; public_id: string }[] = [];
        if (v.imageFiles && v.imageFiles.length > 0) {
          const res = await uploadSequentially(v.imageFiles, (file) =>
            uploadImage(file).unwrap()
          );
          uploadedVariantImages = res
            .map((r) => ({
              url: r.data?.url || '',
              public_id: r.data?.public_id || 'unknown',
            }))
            .filter((img) => Boolean(img.url));
        }

        // Hotspots belong to the photo they were drawn on. These used to be
        // copied from the product photos by position, so a colour's second
        // image inherited the hotspots of the second cover photo.
        const finalVariantImages = [
          ...v.images
            .filter((url) => !url.startsWith('blob:'))
            .map((url) => ({ url, public_id: 'unknown' })),
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
      })
    );

    try {
      const localDefaultImages = defaultImages.filter(
        (img) => img.isLocal && img.file
      );
      const uploadedDefaults = await uploadSequentially(
        localDefaultImages,
        async (img) => {
          const res = await uploadImage(img.file!).unwrap();
          return {
            url: res.data?.url || '',
            public_id: res.data?.public_id || 'unknown',
          };
        }
      );

      const defaultImageUrls = [
        ...defaultImages
          .filter((img) => !img.isLocal)
          .map((img) => ({
            url: img.url,
            public_id: 'unknown',
            hotspots:
              img.hotspots && img.hotspots.length > 0
                ? img.hotspots
                : undefined,
          })),
        ...uploadedDefaults
          .filter((img) => !!img.url)
          .map((img, idx) => ({
            ...img,
            hotspots:
              localDefaultImages[idx].hotspots &&
              localDefaultImages[idx].hotspots.length > 0
                ? localDefaultImages[idx].hotspots
                : undefined,
          })),
      ];

      const finalImages: any[] = [...defaultImageUrls];

      // Prepare customization objects
      const styles: any[] = [];
      const accessories: any[] = [];
      const fabrics: any[] = [];

      await Promise.all(
        customizationSections.map(async (sec) => {
          const allItems = [
            ...(sec.items || []),
            ...(sec.subGroups?.flatMap((sg) => sg.items) || []),
          ];
          const fullObjects = await Promise.all(
            allItems.map(async (it) => {
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
                  const styleItem = res.styles.find(
                    (s) => s._id === it.productId
                  );
                  if (styleItem) {
                    return {
                      name: styleItem.name,
                      style_code: styleItem.style_code || '',
                      categories: styleItem.category
                        ? [styleItem.category]
                        : [],
                      images: styleItem.image_url
                        ? [{ url: styleItem.image_url, public_id: 'unknown' }]
                        : [],
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
                  console.error('Failed to fetch style for custom section', e);
                  return null;
                }
              }

              // Fabric items: fetch full product data, ensure variants is an array
              if (sec.key === 'fabric') {
                try {
                  const res = await getProduct(it.productId).unwrap();
                  const prodData = (res as any)?.data || res;
                  const finalData = prodData?.kind
                    ? prodData[prodData.kind]
                    : prodData;
                  return {
                    ...finalData,
                    // Ensure variants is always an array (yard_per_order is set per-size in SetVariantsTable)
                    variants: Array.isArray(finalData.variants)
                      ? finalData.variants
                      : [],
                  };
                } catch (e) {
                  console.error('Failed to fetch fabric for custom section', e);
                  return null;
                }
              }

              try {
                const res = await getProduct(it.productId).unwrap();
                const prodData = (res as any)?.data || res;
                const finalData = prodData?.kind
                  ? prodData[prodData.kind]
                  : prodData;
                return {
                  ...finalData,
                  price: Math.max(1, Number(it.price) || 1),
                };
              } catch (e) {
                console.error('Failed to fetch product for custom section', e);
                return null;
              }
            })
          );

          const validObjects = fullObjects.filter(Boolean);
          if (sec.key === 'style') validObjects.forEach((o) => styles.push(o));
          if (sec.key === 'accessory')
            validObjects.forEach((o) => accessories.push(o));
          if (sec.key === 'fabric')
            validObjects.forEach((o) => fabrics.push(o));
        })
      );

      // Build addons from the addons section's sub-groups
      const addonsSection = customizationSections.find(
        (s) => s.key === 'addons'
      );
      const addons = (addonsSection?.subGroups ?? [])
        .filter((sg) => sg.displayType && sg.items.length > 0)
        .map((sg) => ({
          name: sg.title,
          display_type: sg.displayType as 'colour' | 'picture',
          variants: sg.items.map((item) => ({
            name: item.label || 'Variant',
            price: item.price || 0,
            ...(sg.displayType === 'colour' && item.colorHex
              ? { color_hex: item.colorHex }
              : {}),
            ...(sg.displayType === 'picture' && item.imageUrl
              ? { image_url: item.imageUrl }
              : {}),
          })),
        }));

      const payload: CreateClothingDto = {
        ...(editId ? { product_id: editId } : {}),
        size_guide: sizeGuideId,
        seo: { title: title.trim() },
        metafields: {
          base_price: price ? Number(price) : undefined,
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
          ...(Object.keys(yardagePerSize).length > 0
            ? {
                yardage_per_size: Object.entries(yardagePerSize)
                  .filter(([, yards]) => yards > 0)
                  .map(([size, yards]) => ({ size, yards })),
              }
            : {}),
          ...(addons.length > 0 ? { addons } : {}),
          accepts_external_fabric: externalFabricOverride,
        },
      };

      await createClothing(payload).unwrap();
      setSaved(true);

      // Say what actually happened: a published listing is not live until
      // Qlozet has reviewed it, and an edit is not a creation.
      if (isDraft) {
        toast.success(editId ? 'Draft saved.' : 'Saved as a draft.');
      } else if (editId) {
        toast.success('Changes saved.');
      } else {
        toast.success(
          "Submitted for review. We'll let you know when it is live."
        );
      }
      router.push(APP_ROUTES.productsCloth);
    } catch (err) {
      // The server explains WHY (an image too small, a field rejected). A bare
      // catch turned every one of those into "try again", which fails
      // identically forever and tells the vendor nothing.
      toast.error(
        readApiError(err, 'Failed to create product. Please try again.')
      );
    }
  };

  /**
   * The garment's bill of materials: yards of fabric per size. Lives in the
   * customer-supplied fabric card, because that is when it is used: the shop
   * lets a customer apply their own cloth to any garment that accepts it,
   * and without this the order fell back to the fabric's minimum cut.
   */
  const garmentSizes = Array.from(
    new Set(variants.flatMap((v) => v.availableSizes || []))
  );
  const acceptsCustomerFabric =
    externalFabricOverride === null
      ? businessProfile?.accepts_external_fabric !== false
      : externalFabricOverride;
  const yardageEditor =
    garmentSizes.length > 0 && acceptsCustomerFabric ? (
      <div className="mt-4 border-t border-border pt-4">
        <FieldLabel
          tooltip="How much cloth each size takes. Sets what a shopper is charged for fabric and what a fabric vendor is paid."
          className="font-normal"
        >
          Yards of fabric per size
        </FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {garmentSizes.map((size) => (
            <div key={size}>
              <span className="text-xs text-muted-foreground">{size}</span>
              <Input
                type="number"
                min={0}
                step={0.5}
                placeholder="yds"
                value={yardagePerSize[size] ?? ''}
                onChange={(e) =>
                  setYardagePerSize((prev) => ({
                    ...prev,
                    [size]: Number(e.target.value) || 0,
                  }))
                }
                className="bg-background"
              />
            </div>
          ))}
        </div>
      </div>
    ) : null;

  // Section numbers shift with the mode: made-to-order gets an Options step
  // and a Making-it step that ready-to-wear does not have.
  const steps = {
    garment: 1,
    photos: 2,
    options: 3,
    sizes: customizationEnabled ? 4 : 3,
    making: 5,
  };

  const publishLabel = isSaving
    ? editId
      ? 'Saving…'
      : 'Submitting…'
    : editId && status === 'active'
      ? 'Save changes'
      : 'Publish';

  const sizeSource = activeGuide ? (
    <>
      Sizes from your size guide “{activeGuide.title}”. Shoppers see its chart
      on the product page.
    </>
  ) : (
    <>
      Standard sizes.{' '}
      <Link
        href={APP_ROUTES.productsSizeGuidesCreate}
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        Create a size guide
      </Link>{' '}
      to sell in your own sizes and show shoppers a chart.
    </>
  );

  return (
    <div className="w-full min-h-screen h-fit pb-28 lg:pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {isLoadingProduct ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Loading product data...
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <GoBackButton onClick={leave} label="Back to clothing" />
              <h2 className="text-base font-semibold text-grey-black dark:text-white">
                {editId ? 'Edit clothing' : 'Add clothing'}
              </h2>
            </div>

            {/* The one choice that shapes the rest of the form. */}
            <div className="surface-card p-4 sm:p-6">
              <p className="text-sm font-semibold text-grey-black dark:text-white">
                What are you listing?
              </p>
              <div
                role="radiogroup"
                aria-label="Listing type"
                className="mt-3 grid gap-3 sm:grid-cols-2"
              >
                {(
                  [
                    {
                      value: false,
                      title: 'Ready to wear',
                      lead: 'Already made. Shoppers pick a colour and size and you ship it from stock.',
                    },
                    {
                      value: true,
                      title: 'Made to order',
                      lead: 'Shoppers choose styles, fabrics and add-ons, and you make it for them.',
                    },
                  ] as const
                ).map((mode) => {
                  const selected = customizationEnabled === mode.value;
                  return (
                    <button
                      key={mode.title}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setCustomizationEnabled(mode.value)}
                      className={cn(
                        'rounded-lg border p-4 text-left transition-colors',
                        selected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="text-sm font-medium text-grey-black dark:text-white">
                        {mode.title}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {mode.lead}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left column: the garment, in the order a vendor thinks */}
              <div className="space-y-6 lg:col-span-2">
                <div className="surface-card p-6">
                  <SectionHeader
                    step={steps.garment}
                    title="The garment"
                    lead="A clear name and a description that covers the fabric, the fit and the care."
                  />
                  <FieldLabel
                    htmlFor="product-title"
                    tooltip="What shoppers see first. Name the garment, not the brand: style, fabric, one detail."
                  >
                    Title
                  </FieldLabel>
                  <Input
                    id="product-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Hand-finished Ankara kaftan with lined collar"
                    maxLength={LISTING_RULES.TITLE_MAX}
                    className="bg-background"
                  />
                  <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                    {title.trim().length}/{LISTING_RULES.TITLE_MAX} characters
                  </p>

                  <div className="mt-5">
                    <FieldLabel tooltip="Shoppers cannot touch it, so tell them what it feels like and how it falls.">
                      Description
                    </FieldLabel>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                    />
                    <p
                      className={cn(
                        'mt-2 text-xs tabular-nums',
                        descriptionChars >= LISTING_RULES.DESCRIPTION_MIN
                          ? 'text-muted-foreground'
                          : 'text-amber-600'
                      )}
                    >
                      {descriptionChars}/{LISTING_RULES.DESCRIPTION_MIN}{' '}
                      characters
                    </p>
                  </div>
                </div>

                <div className="surface-card p-6">
                  <SectionHeader
                    step={steps.photos}
                    title="Photos"
                    lead={`At least ${LISTING_RULES.MIN_PHOTOS}. The first one is the cover. JPG, PNG or WebP, shortest side 800px or more, under 10MB. A plain, light background sells best.`}
                  />
                  <DefaultImagesUploader
                    images={defaultImages}
                    onChange={setDefaultImages}
                    onConfigureHotspots={
                      customizationEnabled
                        ? async (index) => {
                            const image = defaultImages[index];
                            if (!image) return;
                            const result = await NiceModal.show(
                              HotspotEditorModal,
                              {
                                imageUrl: image.url,
                                hotspots: image.hotspots || [],
                                sections: customizationSections,
                              }
                            );
                            if (result !== undefined) {
                              const newImages = [...defaultImages];
                              newImages[index] = {
                                ...image,
                                hotspots: result as StyleHotspotDto[],
                              };
                              setDefaultImages(newImages);
                            }
                          }
                        : undefined
                    }
                  />
                  {customizationEnabled && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Hover a photo to mark where each style option sits on the
                      garment, so shoppers see what they are choosing.
                    </p>
                  )}
                </div>

                {(customizationEnabled || hasCustomItems) && (
                  <div className="surface-card p-6">
                    <SectionHeader
                      step={steps.options}
                      title="Options the customer can choose"
                      lead="Styles are tailoring choices such as a collar or sleeve. Fabrics are the cloths you offer it in. Add-ons are extras with their own price, shown as colours or pictures."
                    />
                    <CustomizationBuilder
                      sections={customizationSections}
                      onChange={setCustomizationSections}
                    />
                  </div>
                )}

                <div className="surface-card p-6">
                  <SectionHeader
                    step={steps.sizes}
                    title="Colours and sizes"
                    lead={
                      customizationEnabled
                        ? 'Optional for made-to-order. Add colours and sizes if you also keep finished pieces in stock.'
                        : 'Every colour you sell, the sizes it comes in, and how many of each you have.'
                    }
                  />
                  <div className="mb-4">
                    <FieldLabel
                      htmlFor="size-guide"
                      tooltip="A size guide gives this garment its sizes and shows shoppers a measurement chart. Guides can also attach themselves to products that match their rules."
                      className="font-normal"
                    >
                      Size guide
                    </FieldLabel>
                    <Select
                      value={sizeGuideId ?? 'none'}
                      onValueChange={(v) =>
                        setSizeGuideId(v === 'none' ? null : v)
                      }
                    >
                      <SelectTrigger
                        id="size-guide"
                        className="w-full bg-background dark:bg-muted dark:border-white/10"
                      >
                        <SelectValue placeholder="No size guide" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          No size guide (standard XS to XXL)
                        </SelectItem>
                        {sizeGuides.map((g) => (
                          <SelectItem key={g._id} value={g._id}>
                            {g.title}
                            {g.sizes?.length
                              ? ` · ${g.sizes
                                  .map((sz) => sz.label)
                                  .slice(0, 6)
                                  .join(', ')}${g.sizes.length > 6 ? '…' : ''}`
                              : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <VariantSelectOptions
                    onAddVariant={addVariant}
                    sizeOptions={sizeOptions}
                    sizeSource={sizeSource}
                  />
                </div>

                {variants.length > 0 && (
                  <SetVariantsTable
                    variants={variants}
                    onChange={setVariants}
                    productName={title}
                  />
                )}

                {customizationEnabled && (
                  <div className="surface-card p-6">
                    <SectionHeader
                      step={steps.making}
                      title="Making it"
                      lead="What you promise the customer once they order."
                    />
                    <div className="max-w-xs">
                      <FieldLabel
                        htmlFor="turnaround-days"
                        tooltip="A promise to the customer. Late orders are penalised, so allow for your real workload."
                        className="font-normal"
                      >
                        Days to make it
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

              {/* Right column: how it is filed and priced, and whether it is ready */}
              <div className="lg:col-span-1">
                <div className="space-y-6 lg:sticky lg:top-6">
                  {editId && (
                    <div className="surface-card p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-grey-black dark:text-white">
                          Listing status
                        </span>
                        <StatusPill status={status} />
                      </div>
                      {status === 'active' &&
                        moderation?.status === 'pending' && (
                          <PendingReviewNote />
                        )}
                      {status === 'active' &&
                        moderation?.status === 'approved' && (
                          <p className="mt-2 text-xs text-emerald-600">
                            Live in the shop.
                          </p>
                        )}
                      {moderation?.status === 'rejected' && (
                        <div className="mt-2 rounded-md bg-rose-50 p-2.5 text-xs text-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
                          <p className="font-medium">
                            Changes requested before this can go live.
                          </p>
                          {moderation.reason && (
                            <p className="mt-1">{moderation.reason}</p>
                          )}
                        </div>
                      )}
                      {status === 'draft' && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Not visible to shoppers. Publish when it is ready.
                        </p>
                      )}
                    </div>
                  )}

                  <ProductOrganizationSection
                    value={organization}
                    onChange={setOrganization}
                  />

                  <ProductPricingSection
                    price={price}
                    onPriceChange={setPrice}
                    discountsHref={APP_ROUTES.productsDiscounts}
                  />

                  <div className="surface-card p-6">
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-grey-black dark:text-white">
                        Customer-supplied fabric
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Can a shopper send their own cloth for this garment?
                        Your store setting applies unless you choose otherwise
                        here.
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
                        else if (val === 'always')
                          setExternalFabricOverride(true);
                        else setExternalFabricOverride(false);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inherit" id="ef-inherit" />
                        <Label
                          htmlFor="ef-inherit"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Use my store setting{' '}
                          <span className="text-xs text-muted-foreground">
                            (currently{' '}
                            {businessProfile?.accepts_external_fabric !== false
                              ? 'yes'
                              : 'no'}
                            )
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="always" id="ef-always" />
                        <Label
                          htmlFor="ef-always"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Yes, for this garment
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="never" id="ef-never" />
                        <Label
                          htmlFor="ef-never"
                          className="text-sm font-normal cursor-pointer"
                        >
                          No, not for this garment
                        </Label>
                      </div>
                    </RadioGroup>
                    {yardageEditor}
                  </div>

                  <ListingReadinessCard readiness={readiness} />

                  <div className="hidden flex-col gap-3 lg:flex">
                    <Button
                      type="button"
                      onClick={() => handleSave(false)}
                      disabled={isSaving || !readiness.ready}
                      className="h-12 w-full"
                    >
                      {publishLabel}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSave(true)}
                      disabled={isSaving}
                      className="h-12 w-full bg-transparent"
                    >
                      {isSaving ? 'Saving…' : 'Save as draft'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Phones and tablets: the two actions stay within reach. */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
              <div className="mx-auto flex max-w-7xl items-center gap-3">
                <span
                  className={cn(
                    'hidden text-xs tabular-nums sm:block',
                    readiness.ready
                      ? 'text-emerald-600'
                      : 'text-muted-foreground'
                  )}
                >
                  {readiness.done} of {readiness.total} ready
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="h-11 flex-1 bg-transparent"
                >
                  {isSaving ? 'Saving…' : 'Save draft'}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSaving || !readiness.ready}
                  className="h-11 flex-1"
                >
                  {publishLabel}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
