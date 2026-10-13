'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { create, useModal } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { readApiError } from '@/redux/services/types';
import { cn, uploadSequentially } from '@/lib/utils';
import {
  VariantSelectOptions,
  type SizeOption,
  type VariantDescriptor,
} from './clothing-variant-options';
import {
  SetVariantsTable,
  makeSizeDetail,
  type SizeDetail,
  type VariantRow,
} from './set-variants-table';
import {
  DefaultImagesUploader,
  type DefaultImage,
} from './default-images-uploader';
import {
  ProductOrganizationSection,
  type ProductOrganizationValue,
} from './clothing-organization-section';
import { StatusPill } from '../atoms/status-pill';
import { ListingReadinessCard } from '../molecules/listing-readiness-card';
import {
  accessoryReadiness,
  visibleText,
  LISTING_RULES,
} from '../lib/listing-readiness';
import {
  useCreateAccessoryMutation,
  useGetProductQuery,
} from '@/redux/services/products/products.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { useGetCategoriesForTypeQuery } from '@/redux/services/taxonomy/taxonomy.api-slice';

type ProductStatus = 'active' | 'draft' | 'archived';
type ModerationStatus = 'pending' | 'approved' | 'rejected';

/**
 * Most accessories come in one size. It is a label in this form only: a row
 * saved with it has no `size`, so the shop shows no size pills, and older
 * rows that never had a size load under it.
 */
const ONE_SIZE = 'One size';
const ACCESSORY_SIZE_OPTIONS: SizeOption[] = [
  { value: ONE_SIZE, label: ONE_SIZE },
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
];
const SIZE_ORDER = ACCESSORY_SIZE_OPTIONS.map((o) => o.value);
const sortSizes = (arr: string[]) =>
  [...arr].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

const Section = ({
  step,
  title,
  lead,
  children,
}: {
  step: number;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) => (
  <section>
    <div className="mb-3 flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary tabular-nums">
        {step}
      </span>
      <h3 className="text-sm font-semibold text-grey-black dark:text-white">
        {title}
      </h3>
    </div>
    {lead && <p className="-mt-2 mb-3 text-xs text-muted-foreground">{lead}</p>}
    {children}
  </section>
);

/**
 * Add / edit an accessory: what it is, photos, price, colours and stock,
 * description. The readiness list gates Publish; drafts always save.
 * Accessories are priced at their base price, so the colour table carries
 * stock and SKU only - the old form asked for an "extra cost" per size that
 * checkout never charged, and opened with a price of ₦100,000 already typed.
 */
export const AddAccessoryModal = create(({ editId }: { editId?: string }) => {
  const modal = useModal();
  const { data: productData, isLoading: isLoadingProduct } = useGetProductQuery(
    editId as string,
    { skip: !editId }
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [organization, setOrganization] = useState<ProductOrganizationValue>({
    productType: '',
    category: [],
    tags: [],
    audience: '',
  });
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<DefaultImage[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [status, setStatus] = useState<ProductStatus>('draft');
  const [moderation, setModeration] = useState<{
    status: ModerationStatus;
    reason?: string | null;
  } | null>(null);

  const [createAccessory, { isLoading: isCreating }] =
    useCreateAccessoryMutation();
  const [uploadImage, { isLoading: isUploading }] =
    useUploadProductImageMutation();
  const isSaving = isCreating || isUploading;

  // Attributes for the chosen type travel with the taxonomy on save.
  const { data: categoryData } = useGetCategoriesForTypeQuery(
    { kind: 'accessory', product_type: organization.productType },
    { skip: !organization.productType }
  );

  useEffect(() => {
    if (!productData) return;
    const rawProduct = (productData as any)?.data || productData;
    const inner = rawProduct?.kind ? rawProduct[rawProduct.kind] : rawProduct;

    setName(inner?.name || rawProduct?.name || '');
    setDescription(inner?.description || rawProduct?.description || '');
    const taxonomy = inner?.taxonomy || rawProduct?.taxonomy || {};
    const rawTags = rawProduct?.tags || [];
    setOrganization({
      productType:
        taxonomy.product_type && taxonomy.product_type !== 'accessory'
          ? taxonomy.product_type
          : '',
      category: taxonomy.categories || [],
      tags: rawTags.map((t: any) => ({
        name: t.name || t,
        slug:
          t.slug ||
          (typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '-') : ''),
        type: (t.type as 'system' | 'custom') || 'system',
      })),
      audience: (taxonomy.audience ||
        '') as ProductOrganizationValue['audience'],
    });
    setPrice(
      inner?.price != null
        ? String(inner.price)
        : rawProduct?.base_price
          ? String(rawProduct.base_price)
          : ''
    );
    setStatus((rawProduct?.status as ProductStatus) || 'draft');
    const pModeration = rawProduct?.moderation;
    setModeration(
      pModeration?.status
        ? {
            status: pModeration.status as ModerationStatus,
            reason: pModeration.reason ?? null,
          }
        : null
    );

    // Every photo, not only the first.
    const pImages = inner?.images || rawProduct?.images || [];
    setImages(
      (pImages as any[])
        .map((img) => (typeof img === 'string' ? img : img?.url))
        .filter(Boolean)
        .map((url: string) => ({
          url: url.replace(/^http:\/\//i, 'https://'),
          isLocal: false,
        }))
    );

    // The API keeps variants as a flat list, one row per colour+size; the
    // table groups them by colour. A row without a size is "One size".
    const rawVariants: any[] = inner?.variants ?? [];
    const rows = new Map<string, VariantRow>();
    rawVariants.forEach((v: any, idx: number) => {
      const hex = v?.color?.hex || '';
      const label = v?.color?.name || '';
      const key = (hex || label || 'unspecified').toLowerCase();
      let row = rows.get(key);
      if (!row) {
        row = {
          id: `loaded-acc-${idx}`,
          colorHex: hex,
          label,
          availableSizes: [],
          details: {},
          images: (v?.images ?? [])
            .map((i: any) => (typeof i === 'string' ? i : i?.url))
            .filter(Boolean),
          expanded: false,
          selected: false,
        };
        rows.set(key, row);
      }
      const size =
        typeof v?.size === 'string' && v.size.trim() ? v.size.trim() : ONE_SIZE;
      if (!row.availableSizes.includes(size)) row.availableSizes.push(size);
      row.details[size] = {
        ...makeSizeDetail(),
        stock: v?.stock || 0,
        sku: v?.sku || '',
      };
    });
    setVariants(
      Array.from(rows.values()).map((r) => ({
        ...r,
        availableSizes: sortSizes(r.availableSizes),
      }))
    );
  }, [productData]);

  const [closing, setClosing] = useState(false);
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => modal.remove(), 280);
  }, [modal]);

  const addVariant = (descriptor: VariantDescriptor, sizeKeys: string[]) => {
    const matches = (v: VariantRow) =>
      descriptor.colorHex && v.colorHex
        ? v.colorHex.toLowerCase() === descriptor.colorHex.toLowerCase()
        : Boolean(descriptor.label && v.label && descriptor.label === v.label);
    setVariants((prev) => {
      const idx = prev.findIndex(matches);
      if (idx >= 0) {
        const existing = prev[idx];
        const newSizes = sizeKeys.filter(
          (s) => !existing.availableSizes.includes(s)
        );
        if (!newSizes.length) return prev;
        const details: Record<string, SizeDetail> = { ...existing.details };
        newSizes.forEach((s) => {
          details[s] = makeSizeDetail();
        });
        const next = [...prev];
        next[idx] = {
          ...existing,
          availableSizes: sortSizes([...existing.availableSizes, ...newSizes]),
          details,
          expanded: true,
        };
        return next;
      }
      const details: Record<string, SizeDetail> = {};
      sizeKeys.forEach((s) => {
        details[s] = makeSizeDetail();
      });
      return [
        ...prev,
        {
          id: `${descriptor.colorHex ?? descriptor.label ?? 'variant'}-${prev.length}`,
          colorHex: descriptor.colorHex ?? '',
          label: descriptor.label,
          imageUrl: descriptor.imageUrl,
          availableSizes: sortSizes(sizeKeys),
          details,
          images: [],
          expanded: true,
          selected: false,
        },
      ];
    });
  };

  const readiness = accessoryReadiness({
    title: name,
    description,
    photoCount: images.length,
    price,
    productType: organization.productType,
    audience: organization.audience,
    variants: variants.map((v) => ({
      sizes: v.availableSizes.map((s) => ({ stock: v.details[s]?.stock ?? 0 })),
    })),
  });
  const descriptionChars = visibleText(description).length;

  if (!modal.visible) return null;

  const handleSubmit = async (isDraft: boolean) => {
    if (!name.trim()) {
      toast.error('Give the accessory a name first.');
      return;
    }
    // The API needs a product type even on a draft.
    if (!organization.productType) {
      toast.error('Choose a product type first.');
      return;
    }
    if (!isDraft && !readiness.ready) {
      toast.error(readiness.firstProblem ?? 'The listing is not ready yet.');
      return;
    }

    try {
      const local = images.filter((img) => img.isLocal && img.file);
      const uploaded = await uploadSequentially(local, async (img) => {
        const res = await uploadImage(img.file!).unwrap();
        return {
          url: res.data?.url || '',
          public_id: res.data?.public_id || 'unknown',
        };
      });
      const finalImages = [
        ...images
          .filter((img) => !img.isLocal)
          .map((img) => ({ url: img.url, public_id: 'unknown' })),
        ...uploaded.filter((img) => !!img.url),
      ];

      const variantsToSubmit = (
        await Promise.all(
          variants.map(async (v) => {
            let uploadedVariantImages: { url: string; public_id: string }[] =
              [];
            if (v.imageFiles?.length) {
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
            const variantImages = [
              ...v.images
                .filter((url) => !url.startsWith('blob:'))
                .map((url) => ({ url, public_id: 'unknown' })),
              ...uploadedVariantImages,
            ];
            return v.availableSizes.map((size) => {
              const detail = v.details[size] || makeSizeDetail();
              return {
                color: { name: v.label || v.colorHex, hex: v.colorHex },
                ...(size === ONE_SIZE ? {} : { size }),
                stock: detail.stock || 0,
                price: 0,
                sku: detail.sku || undefined,
                images: variantImages,
              };
            });
          })
        )
      ).flat();

      await createAccessory({
        ...(editId ? { product_id: editId } : {}),
        seo: { title: name.trim() },
        metafields: {
          base_price: Number(price) || undefined,
          tags: organization.tags,
        },
        status: isDraft ? 'draft' : 'active',
        accessory: {
          name: name.trim(),
          description: description.trim() || undefined,
          price: Number(price) || 0,
          taxonomy: {
            product_type: organization.productType,
            categories: organization.category,
            attributes: categoryData?.attributes?.length
              ? categoryData.attributes
              : [],
            audience: organization.audience || 'unisex',
          },
          variants: variantsToSubmit,
          images: finalImages,
        },
      }).unwrap();

      if (isDraft) toast.success(editId ? 'Draft saved.' : 'Saved as a draft.');
      else if (editId) toast.success('Changes saved.');
      else
        toast.success(
          "Submitted for review. We'll let you know when it is live."
        );
      handleClose();
    } catch (err) {
      toast.error(
        readApiError(err, 'Could not save the accessory. Please try again.')
      );
    }
  };

  const publishLabel = isSaving
    ? editId
      ? 'Saving…'
      : 'Submitting…'
    : editId && status === 'active'
      ? 'Save changes'
      : 'Publish';

  const actions = (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        onClick={() => handleSubmit(false)}
        disabled={isSaving || !readiness.ready}
        className="h-11 w-full"
      >
        {publishLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSubmit(true)}
        disabled={isSaving}
        className="h-11 w-full bg-transparent"
      >
        {isSaving ? 'Saving…' : 'Save as draft'}
      </Button>
    </div>
  );

  return (
    <Dialog
      open={modal.visible && !closing}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="p-0 overflow-hidden sm:max-w-5xl sm:rounded-[16px]">
        <div className="flex max-h-[90vh] flex-col md:flex-row md:overflow-hidden">
          {/* Left: the accessory */}
          <div className="flex-1 space-y-7 overflow-y-auto bg-card p-4 sm:p-6 custom-scrollbar">
            <DialogTitle className="text-xl font-semibold text-grey-black dark:text-white">
              {editId ? 'Edit accessory' : 'Add accessory'}
            </DialogTitle>

            {isLoadingProduct ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <Section
                  step={1}
                  title="What it is"
                  lead="Name it the way a shopper would search for it, then file it so they can find it."
                >
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="accessory-name"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Name
                      </label>
                      <Input
                        id="accessory-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Woven raffia market bag"
                        maxLength={LISTING_RULES.TITLE_MAX}
                      />
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {name.trim().length}/{LISTING_RULES.TITLE_MAX}{' '}
                        characters
                      </p>
                    </div>
                    <ProductOrganizationSection
                      kind="accessory"
                      value={organization}
                      onChange={setOrganization}
                    />
                  </div>
                </Section>

                <Section
                  step={2}
                  title="Photos"
                  lead={`At least ${LISTING_RULES.MIN_PHOTOS}, on a plain, light background. The first is the cover; add one being worn or carried if you can.`}
                >
                  <DefaultImagesUploader images={images} onChange={setImages} />
                </Section>

                <Section
                  step={3}
                  title="Price"
                  lead="One price for every colour and size. Sales are set up on the Discounts page."
                >
                  <div className="relative max-w-xs">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₦
                    </span>
                    <Input
                      id="accessory-price"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={100}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </Section>

                <Section
                  step={4}
                  title="Colours and stock"
                  lead="Add each colour you sell. Leave the size as One size unless it genuinely comes in sizes, then set how many you have."
                >
                  <div className="space-y-4">
                    <VariantSelectOptions
                      onAddVariant={addVariant}
                      sizeOptions={ACCESSORY_SIZE_OPTIONS}
                      defaultSizes={[ONE_SIZE]}
                      allowFabric={false}
                    />
                    {variants.length > 0 && (
                      <SetVariantsTable
                        variants={variants}
                        onChange={setVariants}
                        productName={name}
                        kind="accessory"
                      />
                    )}
                  </div>
                </Section>

                <Section
                  step={5}
                  title="Description"
                  lead="Materials, size in centimetres where it matters, how to care for it."
                >
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Hand-woven raffia with a leather-trimmed handle…"
                    rows={5}
                  />
                  <p
                    className={cn(
                      'mt-1.5 text-xs tabular-nums',
                      descriptionChars >= LISTING_RULES.DESCRIPTION_MIN
                        ? 'text-muted-foreground'
                        : 'text-amber-600'
                    )}
                  >
                    {descriptionChars}/{LISTING_RULES.DESCRIPTION_MIN}{' '}
                    characters
                  </p>
                </Section>

                <div className="md:hidden">{actions}</div>
              </>
            )}
          </div>

          {/* Right: where it stands, and whether it is ready */}
          <aside className="hidden w-[300px] shrink-0 space-y-4 overflow-y-auto border-l border-border bg-muted/30 p-5 md:block custom-scrollbar">
            {editId && !isLoadingProduct && (
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-grey-black dark:text-white">
                    Listing status
                  </span>
                  <StatusPill status={status} />
                </div>
                {status === 'active' && moderation?.status === 'pending' && (
                  <p className="mt-2 text-xs text-amber-600">
                    Under review by Qlozet. It goes live once approved.
                  </p>
                )}
                {status === 'active' && moderation?.status === 'approved' && (
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
            <ListingReadinessCard readiness={readiness} className="p-4" />
            {actions}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
});
