'use client';

// Edit a vendor's listing as the Qlozet team: the name, description,
// category and photos only, with a reason the vendor is told.
//
// Deliberately not the vendor's product form. Price, stock, sizes, options
// and making time are the vendor's to set (they drive their money and their
// deadlines); a listing that gets them wrong is rejected with a reason so the
// vendor fixes it. PATCH /admin/products/:id refuses anything else.

import { useMemo, useState } from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/pattern/common/organisms/rich-text-editor';
import { cn } from '@/lib/utils';
import { getKindDetail } from '@/lib/products';
import { readApiError } from '@/redux/services/types';
import { useUpdateAdminProductMutation } from '@/redux/services/products/admin-products.api-slice';
import type { Product } from '@/redux/services/products/products.api-slice';

const AUDIENCES = ['men', 'women', 'unisex', 'kids'];

const imageUrl = (img: unknown): string | null =>
  typeof img === 'string'
    ? img
    : ((img as { url?: string } | null)?.url ?? null);

const Field = ({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium text-grey-black dark:text-white"
    >
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const EditListingSheet = create<{ product: Product }>(({ product }) => {
  const { visible, resolve, remove } = useModal();
  const [update, { isLoading }] = useUpdateAdminProductMutation();

  const kind = (product.kind ?? 'clothing') as string;
  const isFabric = kind === 'fabric';
  const detail = getKindDetail(product) as Record<string, any>;
  const taxonomy = (detail.taxonomy ?? {}) as Record<string, any>;
  const startImages = useMemo(
    () =>
      ((detail.images as unknown[]) ?? [])
        .map(imageUrl)
        .filter((u): u is string => Boolean(u)),
    [detail.images]
  );

  const [name, setName] = useState<string>(detail.name ?? '');
  const [description, setDescription] = useState<string>(
    detail.description ?? ''
  );
  const [productType, setProductType] = useState<string>(
    (isFabric ? detail.product_type : taxonomy.product_type) ?? ''
  );
  const [categories, setCategories] = useState<string>(
    ((taxonomy.categories as string[]) ?? []).join(', ')
  );
  const [audience, setAudience] = useState<string>(taxonomy.audience ?? '');
  const [pattern, setPattern] = useState<string>(detail.pattern ?? '');
  const [takeDown, setTakeDown] = useState<string[]>([]);
  const [reason, setReason] = useState('');

  const close = () => {
    resolve();
    remove();
  };

  const save = async () => {
    const body: Record<string, unknown> = { reason: reason.trim() };
    if (name.trim() !== (detail.name ?? '')) body.name = name.trim();
    if (description !== (detail.description ?? ''))
      body.description = description;
    if (isFabric) {
      if (productType !== (detail.product_type ?? ''))
        body.product_type = productType;
      if (pattern !== (detail.pattern ?? '')) body.pattern = pattern;
    } else {
      if (productType !== (taxonomy.product_type ?? ''))
        body.product_type = productType;
      const cats = categories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      if (
        cats.join('|') !== ((taxonomy.categories as string[]) ?? []).join('|')
      )
        body.categories = cats;
      if (audience !== (taxonomy.audience ?? '')) body.audience = audience;
    }
    if (takeDown.length) body.remove_images = takeDown;

    if (Object.keys(body).length === 1) {
      toast.error('Nothing has changed.');
      return;
    }
    if (reason.trim().length < 10) {
      toast.error('Say why you changed the listing. The vendor sees it.');
      return;
    }
    try {
      await update({ id: String(product._id), ...body }).unwrap();
      toast.success('Listing updated. The vendor has been told what changed.');
      close();
    } catch (err) {
      toast.error(readApiError(err, 'Could not update the listing.'));
    }
  };

  const keptCount = startImages.length - takeDown.length;

  return (
    <Sheet open={visible} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px]"
      >
        <SheetHeader className="shrink-0 border-b border-border px-6 py-5">
          <SheetTitle>Edit listing</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Fix the wording, category or photos. Price, stock, sizes and options
            are the vendor’s — reject the listing with a reason to have those
            changed.
          </p>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <Field label="Name" htmlFor="edit-listing-name">
            <Input
              id="edit-listing-name"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Description">
            <RichTextEditor value={description} onChange={setDescription} />
          </Field>

          {isFabric ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Material" htmlFor="edit-listing-material">
                <Input
                  id="edit-listing-material"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                />
              </Field>
              <Field
                label="Fabric type"
                htmlFor="edit-listing-pattern"
                hint="e.g. Wax Print, Adire, Lace"
              >
                <Input
                  id="edit-listing-pattern"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                />
              </Field>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Product type" htmlFor="edit-listing-type">
                  <Input
                    id="edit-listing-type"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                  />
                </Field>
                <Field label="Audience" htmlFor="edit-listing-audience">
                  <select
                    id="edit-listing-audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
                  >
                    <option value="">—</option>
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field
                label="Categories"
                htmlFor="edit-listing-categories"
                hint="Separate with commas, e.g. Kaftan, Traditional"
              >
                <Input
                  id="edit-listing-categories"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                />
              </Field>
            </>
          )}

          {startImages.length > 0 && (
            <Field
              label="Photos"
              hint="Select a photo to take it down (for example, contact details or a watermark). At least one stays."
            >
              <div className="grid grid-cols-4 gap-2">
                {startImages.map((url) => {
                  const down = takeDown.includes(url);
                  const lastOne = !down && keptCount <= 1;
                  return (
                    <button
                      key={url}
                      type="button"
                      disabled={lastOne}
                      onClick={() =>
                        setTakeDown((prev) =>
                          down ? prev.filter((u) => u !== url) : [...prev, url]
                        )
                      }
                      aria-pressed={down}
                      title={
                        lastOne
                          ? 'A listing needs at least one photo.'
                          : down
                            ? 'Keep this photo'
                            : 'Take this photo down'
                      }
                      className={cn(
                        'relative aspect-square overflow-hidden rounded-lg border',
                        down
                          ? 'border-destructive ring-2 ring-destructive'
                          : 'border-border',
                        lastOne && 'cursor-not-allowed'
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className={cn(
                          'size-full object-cover',
                          down && 'opacity-40'
                        )}
                      />
                      {down && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <X className="size-6 text-destructive" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          <Field
            label="Why are you changing it?"
            htmlFor="edit-listing-reason"
            hint="The vendor is told what changed and why."
          >
            <Textarea
              id="edit-listing-reason"
              value={reason}
              maxLength={500}
              rows={3}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Removed a phone number from the description; listings can’t carry contact details."
            />
          </Field>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Save and tell the vendor'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
});

/** Open the sheet for a product. */
export const openEditListing = (product: Product) =>
  NiceModal.show(EditListingSheet, { product });
