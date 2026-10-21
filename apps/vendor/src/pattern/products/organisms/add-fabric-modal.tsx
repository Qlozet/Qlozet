'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { readApiError } from '@/redux/services/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn, uploadSequentially } from '@/lib/utils';
import { LabeledSelect } from '../molecules/labeled-select';
import { ColourSelect } from '../molecules/colour-select';
import { StatusPill } from '../atoms/status-pill';
import { ListingReadinessCard } from '../molecules/listing-readiness-card';
import {
  DefaultImagesUploader,
  type DefaultImage,
} from './default-images-uploader';
import {
  fabricReadiness,
  visibleText,
  LISTING_RULES,
} from '../lib/listing-readiness';
import {
  useCreateFabricMutation,
  useGetProductQuery,
} from '@/redux/services/products/products.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import {
  useGetProductTypesQuery,
  useGetCategoriesForTypeQuery,
} from '@/redux/services/taxonomy/taxonomy.api-slice';
import { PendingReviewNote } from '../molecules/listing-review-copy';

type ProductStatus = 'active' | 'draft' | 'archived';
type ModerationStatus = 'pending' | 'approved' | 'rejected';
interface FabricColour {
  name: string;
  hex: string;
}

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

// A typed number with its unit shown, instead of a plus/minus stepper that
// only moved in whole units (no half yards, 49 clicks for a 50-yard bolt).
const UnitInput = ({
  id,
  label,
  unit,
  value,
  onChange,
  step = 0.5,
  min = 0,
  hint,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  step?: number;
  min?: number;
  hint?: string;
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      {label}
    </label>
    <div className="relative">
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="pr-14"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        {unit}
      </span>
    </div>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;

/**
 * Add / edit a fabric. One bolt: what it is, what it looks like, how it is
 * sold. The same readiness list as clothing gates Publish; a draft can
 * always be saved. Colours go on the fabric itself, which is where the shop
 * reads them (they used to be saved into metafields and never shown).
 */
export const AddFabricModal = NiceModal.create(
  ({ editId }: { editId?: string }) => {
    const modal = useModal();

    const { data: productData, isLoading: isLoadingProduct } =
      useGetProductQuery(editId as string, { skip: !editId });

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [material, setMaterial] = useState('');
    const [fabricType, setFabricType] = useState('');
    const [colours, setColours] = useState<FabricColour[]>([]);
    const [yards, setYards] = useState('');
    const [width, setWidth] = useState('45');
    const [minCut, setMinCut] = useState('4');
    const [price, setPrice] = useState('');
    // Selling by the piece (Ankara in 6-yard pieces, lace in 5): whole pieces
    // at their own price, instead of or as well as by the yard.
    const [soldBy, setSoldBy] = useState<'yard' | 'piece' | 'both'>('yard');
    const [pieceYards, setPieceYards] = useState('6');
    const [piecePrice, setPiecePrice] = useState('');
    const [images, setImages] = useState<DefaultImage[]>([]);
    const [status, setStatus] = useState<ProductStatus>('draft');
    const [moderation, setModeration] = useState<{
      status: ModerationStatus;
      reason?: string | null;
    } | null>(null);

    const [createFabric, { isLoading: isCreating }] = useCreateFabricMutation();
    const [uploadImage, { isLoading: isUploading }] =
      useUploadProductImageMutation();
    const isSaving = isCreating || isUploading;

    // Material is the fabric product type (Cotton, Lace, Silk...); the type
    // under it (Wax Print, Adire, French Lace...) is its category.
    const { data: fabricTypes, isLoading: isLoadingTypes } =
      useGetProductTypesQuery('fabric');
    const { data: categoryData, isLoading: isLoadingCategories } =
      useGetCategoriesForTypeQuery(
        { kind: 'fabric', product_type: material },
        { skip: !material }
      );
    const materialOptions = fabricTypes?.map((pt) => pt.name) || [];
    const typeOptions = categoryData?.categories || [];

    useEffect(() => {
      if (!productData) return;
      const rawProduct = (productData as any)?.data || productData;
      const inner = rawProduct?.kind ? rawProduct[rawProduct.kind] : rawProduct;

      setName(inner?.name || rawProduct?.name || '');
      setDescription(inner?.description || rawProduct?.description || '');
      setMaterial(
        inner?.product_type ||
          inner?.taxonomy?.product_type ||
          rawProduct?.product_type ||
          ''
      );
      setFabricType(inner?.pattern || '');
      setYards(inner?.yard_length != null ? String(inner.yard_length) : '');
      setWidth(inner?.width != null ? String(inner.width) : '45');
      setMinCut(inner?.min_cut != null ? String(inner.min_cut) : '4');
      setPrice(
        inner?.price_per_yard != null
          ? String(inner.price_per_yard)
          : rawProduct?.base_price
            ? String(rawProduct.base_price)
            : ''
      );
      setSoldBy(
        inner?.sold_by === 'piece' || inner?.sold_by === 'both'
          ? inner.sold_by
          : 'yard'
      );
      if (inner?.piece_yards) setPieceYards(String(inner.piece_yards));
      if (inner?.piece_price) setPiecePrice(String(inner.piece_price));
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

      // Colours: the fabric's own list first; older products only have the
      // single metafield colour the old modal wrote.
      const loaded: FabricColour[] = Array.isArray(inner?.colors)
        ? inner.colors
            .filter((c: any) => c?.hex)
            .map((c: any) => ({ name: c.name || c.hex, hex: c.hex }))
        : [];
      if (!loaded.length && rawProduct?.metafields?.colour) {
        loaded.push({
          name: rawProduct.metafields.colour,
          hex: rawProduct.metafields.swatch || '#000000',
        });
      }
      setColours(loaded);

      // Every photo, not only the first: editing used to save a one-image
      // list back and drop the rest.
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
    }, [productData]);

    const [closing, setClosing] = useState(false);
    const handleClose = useCallback(() => {
      setClosing(true);
      setTimeout(() => modal.remove(), 280);
    }, [modal]);

    const readiness = fabricReadiness({
      title: name,
      description,
      photoCount: images.length,
      material,
      pricePerYard: price,
      yardsInStock: yards,
      minCut,
      widthInches: width,
      soldBy,
      pieceYards,
      piecePrice,
    });
    const descriptionChars = visibleText(description).length;
    const minCutCost = (Number(minCut) || 0) * (Number(price) || 0);
    const byYard = soldBy !== 'piece';
    const byPiece = soldBy !== 'yard';
    // What a piece saves against buying the same yards loose.
    const pieceSaving =
      soldBy === 'both'
        ? (Number(pieceYards) || 0) * (Number(price) || 0) -
          (Number(piecePrice) || 0)
        : 0;

    if (!modal.visible) return null;

    const addColour = (colourName: string, hex: string) => {
      setColours((prev) =>
        prev.some((c) => c.hex.toLowerCase() === hex.toLowerCase())
          ? prev
          : [...prev, { name: colourName, hex }]
      );
    };

    const handleSubmit = async (isDraft: boolean) => {
      // A draft needs only what the API cannot store without.
      if (!name.trim()) {
        toast.error('Give the fabric a name first.');
        return;
      }
      if (!material) {
        toast.error('Choose a material first.');
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

        const first = colours[0];
        await createFabric({
          ...(editId ? { product_id: editId } : {}),
          seo: { title: name.trim() },
          metafields: {
            // Kept for the vendor list, which still reads the first colour here.
            colour: first?.name,
            swatch: first?.hex,
            // Listings show the piece price for a piece-only fabric.
            base_price:
              (soldBy === 'piece' ? Number(piecePrice) : Number(price)) ||
              undefined,
          },
          status: isDraft ? 'draft' : 'active',
          fabric: {
            name: name.trim(),
            description: description.trim() || undefined,
            product_type: material,
            material,
            pattern: fabricType || undefined,
            colors: colours,
            yard_length: Number(yards) || 0,
            width: Number(width) || 0,
            // A piece-only fabric's per-yard price and minimum cut come from
            // the piece (the backend derives them the same way).
            min_cut:
              soldBy === 'piece'
                ? Number(pieceYards) || 0
                : Number(minCut) || 0,
            price_per_yard:
              soldBy === 'piece'
                ? Math.round(
                    ((Number(piecePrice) || 0) / (Number(pieceYards) || 1)) *
                      100
                  ) / 100
                : Number(price) || 0,
            sold_by: soldBy,
            ...(soldBy !== 'yard'
              ? {
                  piece_yards: Number(pieceYards) || undefined,
                  piece_price: Number(piecePrice) || undefined,
                }
              : {}),
            images: finalImages.length ? finalImages : undefined,
            // The API validates this as an array; a bolt has no size variants.
            variants: [],
          },
        }).unwrap();

        if (isDraft)
          toast.success(editId ? 'Draft saved.' : 'Saved as a draft.');
        else if (editId) toast.success('Changes saved.');
        else
          toast.success(
            "Submitted for review. We'll let you know when it is live."
          );
        handleClose();
      } catch (err) {
        toast.error(
          readApiError(err, 'Could not save the fabric. Please try again.')
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
            {/* Left: the fabric */}
            <div className="flex-1 space-y-7 overflow-y-auto bg-card p-4 sm:p-6 custom-scrollbar">
              <DialogTitle className="text-xl font-semibold text-grey-black dark:text-white">
                {editId ? 'Edit fabric' : 'Add fabric'}
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
                    lead="Name it the way a shopper would search for it: colour, material, print."
                  >
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="fabric-name"
                          className="text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                          Name
                        </label>
                        <Input
                          id="fabric-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Royal blue Holland wax print"
                          maxLength={LISTING_RULES.TITLE_MAX}
                        />
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {name.trim().length}/{LISTING_RULES.TITLE_MAX}{' '}
                          characters
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {isLoadingTypes ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <LabeledSelect
                            label="Material"
                            value={material}
                            options={materialOptions}
                            placeholder="Cotton, lace, silk…"
                            onChange={(v) => {
                              setMaterial(v);
                              setFabricType('');
                            }}
                          />
                        )}
                        {isLoadingCategories && material ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <LabeledSelect
                            label="Type"
                            value={fabricType}
                            options={typeOptions}
                            placeholder={
                              material
                                ? typeOptions.length
                                  ? 'Wax print, Adire, plain…'
                                  : 'No types for this material'
                                : 'Choose a material first'
                            }
                            onChange={setFabricType}
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Colours
                        </label>
                        {colours.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {colours.map((c) => (
                              <span
                                key={c.hex}
                                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                              >
                                <span
                                  className="size-3.5 rounded-full border border-border"
                                  style={{ backgroundColor: c.hex }}
                                />
                                {c.name}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setColours((prev) =>
                                      prev.filter((x) => x.hex !== c.hex)
                                    )
                                  }
                                  className="text-muted-foreground hover:text-foreground"
                                  aria-label={`Remove ${c.name}`}
                                >
                                  <X className="size-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <ColourSelect
                          value=""
                          hex="#000000"
                          placeholder={
                            colours.length
                              ? 'Add another colour'
                              : 'Add a colour'
                          }
                          onChange={addColour}
                        />
                        <p className="text-xs text-muted-foreground">
                          The main colours in the print. Shoppers filter by
                          these.
                        </p>
                      </div>
                    </div>
                  </Section>

                  <Section
                    step={2}
                    title="Photos"
                    lead={`At least ${LISTING_RULES.MIN_PHOTOS}: a flat, well-lit shot of the fabric alone, then close-ups of the print and the texture. The first is the cover.`}
                  >
                    <DefaultImagesUploader
                      images={images}
                      onChange={setImages}
                    />
                  </Section>

                  <Section
                    step={3}
                    title="The bolt"
                    lead="How much you have, how you sell it, and what it costs."
                  >
                    <div
                      role="radiogroup"
                      aria-label="How you sell it"
                      className="mb-4 grid grid-cols-3 gap-2"
                    >
                      {(
                        [
                          {
                            key: 'yard',
                            title: 'By the yard',
                            sub: 'Any length',
                          },
                          {
                            key: 'piece',
                            title: 'By the piece',
                            sub: 'Whole pieces only',
                          },
                          {
                            key: 'both',
                            title: 'Both',
                            sub: 'Yards or a full piece',
                          },
                        ] as const
                      ).map((o) => (
                        <button
                          key={o.key}
                          type="button"
                          role="radio"
                          aria-checked={soldBy === o.key}
                          onClick={() => setSoldBy(o.key)}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-left transition-colors',
                            soldBy === o.key
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          )}
                        >
                          <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                            {o.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {o.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <UnitInput
                        id="fabric-yards"
                        label="Yards in stock"
                        unit="yards"
                        value={yards}
                        onChange={setYards}
                        hint="Goes down as orders come in."
                      />
                      <UnitInput
                        id="fabric-width"
                        label="Width"
                        unit="inches"
                        value={width}
                        onChange={setWidth}
                        step={1}
                        min={10}
                        hint="Most African prints are 45 or 46; lace is often 50 to 60."
                      />
                      {byPiece && (
                        <UnitInput
                          id="fabric-piece-yards"
                          label="Yards in one piece"
                          unit="yards"
                          value={pieceYards}
                          onChange={setPieceYards}
                          hint="For example 6 for Ankara, 5 for lace."
                        />
                      )}
                      {byPiece && (
                        <div className="space-y-1.5">
                          <label
                            htmlFor="fabric-piece-price"
                            className="text-sm font-medium text-gray-700 dark:text-gray-200"
                          >
                            Price per piece
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              ₦
                            </span>
                            <Input
                              id="fabric-piece-price"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={100}
                              value={piecePrice}
                              onChange={(e) => setPiecePrice(e.target.value)}
                              placeholder="0"
                              className="pl-7"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {pieceSaving > 0
                              ? `A full piece saves a shopper ${naira(pieceSaving)} against buying ${pieceYards} yards loose.`
                              : 'Shoppers buy whole pieces at this price.'}
                          </p>
                        </div>
                      )}
                      {byYard && (
                        <UnitInput
                          id="fabric-min-cut"
                          label="Minimum cut"
                          unit="yards"
                          value={minCut}
                          onChange={setMinCut}
                          hint="The least a shopper can buy at once."
                        />
                      )}
                      {byYard && (
                        <div className="space-y-1.5">
                          <label
                            htmlFor="fabric-price"
                            className="text-sm font-medium text-gray-700 dark:text-gray-200"
                          >
                            Price per yard
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              ₦
                            </span>
                            <Input
                              id="fabric-price"
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
                          <p className="text-xs text-muted-foreground">
                            {minCutCost > 0
                              ? `A shopper buying the minimum cut pays ${naira(minCutCost)}.`
                              : 'Shoppers pay this times the yards they choose.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </Section>

                  <Section
                    step={4}
                    title="Description"
                    lead="The weight, the feel, how it washes, what it is good for."
                  >
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Heavyweight 100% cotton wax print with a crisp hand…"
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
                    <PendingReviewNote />
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
  }
);
