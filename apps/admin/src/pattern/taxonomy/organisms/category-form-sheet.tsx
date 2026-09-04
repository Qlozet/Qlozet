'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { Loader2, TriangleAlert, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  useCreateTaxonomyCategoryMutation,
  useUpdateTaxonomyCategoryMutation,
  type SystemCategory,
  type TaxonomyKind,
} from '@/redux/services/taxonomy/taxonomy.api-slice';
import { KIND_OPTIONS } from '../lib/taxonomy-options';

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit mode; absent → create. */
  category?: SystemCategory | null;
  /** Live products referencing this product_type (edit mode). */
  usageCount?: number;
}

const selectCls =
  'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200';
const labelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300';

/** Free-text chip editor: type, press Enter (or comma) to add. */
function ChipEditor({
  label,
  hint,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    if (!values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      onChange([...values, v]);
    }
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls}>{label}</label>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-800 dark:bg-gray-900">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="rounded-full p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label={`Remove ${v}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={values.length ? '' : placeholder}
          className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200"
        />
      </div>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  category,
  usageCount = 0,
}: CategoryFormSheetProps) {
  const editing = !!category;
  const [kind, setKind] = useState<TaxonomyKind>('clothing');
  const [productType, setProductType] = useState('');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [categories, setCategories] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);

  const [createCategory, { isLoading: creating }] =
    useCreateTaxonomyCategoryMutation();
  const [updateCategory, { isLoading: updating }] =
    useUpdateTaxonomyCategoryMutation();
  const saving = creating || updating;

  useEffect(() => {
    if (!open) return;
    setKind(category?.kind ?? 'clothing');
    setProductType(category?.product_type ?? '');
    setIcon(category?.icon ?? '');
    setSortOrder(String(category?.sort_order ?? 0));
    setCategories(category?.categories ?? []);
    setAttributes(category?.attributes ?? []);
  }, [open, category]);

  const renamed =
    editing && productType.trim() !== (category?.product_type ?? '');

  const submit = async () => {
    if (!productType.trim()) return toast.error('Product type is required.');
    const payload = {
      kind,
      product_type: productType.trim(),
      categories,
      attributes,
      icon: icon.trim() || undefined,
      sort_order: Number(sortOrder) || 0,
    };
    try {
      if (editing && category) {
        await updateCategory({ id: category._id, data: payload }).unwrap();
        toast.success('Product type updated');
      } else {
        await createCategory(payload).unwrap();
        toast.success('Product type created');
      }
      onOpenChange(false);
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error(
        (Array.isArray(msg) ? msg[0] : msg) ||
          'Could not save the product type.'
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg sm:!top-6 sm:!bottom-6 sm:!right-6 sm:!h-[calc(100vh-3rem)] sm:rounded-[15px] custom-card-shadow !bg-white dark:!bg-card border border-gray-100 dark:border-white/10"
      >
        <SheetHeader>
          <SheetTitle>
            {editing ? 'Edit product type' : 'Add product type'}
          </SheetTitle>
          <SheetDescription>
            Product types, sub-categories and attributes drive the dropdowns
            vendors see when listing products.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Kind</label>
              <select
                value={kind}
                disabled={editing}
                onChange={(e) => setKind(e.target.value as TaxonomyKind)}
                className={selectCls}
              >
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Icon (emoji)</label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="👗"
                maxLength={4}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Product type</label>
            <Input
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              placeholder="e.g. Dresses"
            />
            {renamed && usageCount > 0 && (
              <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                <TriangleAlert className="mt-0.5 size-3.5 flex-shrink-0" />
                <span>
                  {usageCount.toLocaleString()} live product
                  {usageCount === 1 ? '' : 's'} reference
                  {usageCount === 1 ? 's' : ''} &ldquo;
                  {category?.product_type}&rdquo; by name. Renaming here does
                  NOT update them — they will keep the old name until re-saved.
                </span>
              </p>
            )}
          </div>

          <ChipEditor
            label="Sub-categories"
            values={categories}
            onChange={setCategories}
            placeholder="Type and press Enter — e.g. Maxi Dress"
            hint="Shown as the second-level dropdown after the product type."
          />

          <ChipEditor
            label="Attributes"
            values={attributes}
            onChange={setAttributes}
            placeholder="Type and press Enter — e.g. Long Sleeve"
            hint="Optional descriptors vendors can attach to a product."
          />

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Sort order</label>
            <Input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
            <p className="text-[11px] text-gray-400">
              Lower numbers appear first in dropdowns.
            </p>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving
              ? 'Saving…'
              : editing
                ? 'Save changes'
                : 'Create product type'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
