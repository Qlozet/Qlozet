'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  useCreateTaxonomyTagMutation,
  useUpdateTaxonomyTagMutation,
  type SystemTag,
  type TagAssignableBy,
  type TaxonomyKind,
} from '@/redux/services/taxonomy/taxonomy.api-slice';
import {
  ASSIGNABLE_OPTIONS,
  KIND_OPTIONS,
  slugify,
} from '../lib/taxonomy-options';

interface TagFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit mode; absent → create. */
  tag?: SystemTag | null;
  /** Live products carrying this tag (edit mode). */
  usageCount?: number;
}

const selectCls =
  'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200';
const labelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300';

export function TagFormSheet({
  open,
  onOpenChange,
  tag,
  usageCount = 0,
}: TagFormSheetProps) {
  const editing = !!tag;
  const [name, setName] = useState('');
  const [kind, setKind] = useState<TaxonomyKind | ''>('');
  const [assignableBy, setAssignableBy] = useState<TagAssignableBy>('vendor');
  const [sortOrder, setSortOrder] = useState('0');

  const [createTag, { isLoading: creating }] = useCreateTaxonomyTagMutation();
  const [updateTag, { isLoading: updating }] = useUpdateTaxonomyTagMutation();
  const saving = creating || updating;

  useEffect(() => {
    if (!open) return;
    setName(tag?.name ?? '');
    setKind(tag?.kind ?? '');
    setAssignableBy(tag?.assignable_by ?? 'vendor');
    setSortOrder(String(tag?.sort_order ?? 0));
  }, [open, tag]);

  const renamed = editing && name.trim() !== (tag?.name ?? '');

  const submit = async () => {
    if (!name.trim()) return toast.error('Name is required.');
    const payload = {
      name: name.trim(),
      kind: kind || undefined,
      assignable_by: assignableBy,
      sort_order: Number(sortOrder) || 0,
    };
    try {
      if (editing && tag) {
        await updateTag({ id: tag._id, data: payload }).unwrap();
        toast.success('Tag updated');
      } else {
        await createTag(payload).unwrap();
        toast.success('Tag created');
      }
      onOpenChange(false);
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error(
        (Array.isArray(msg) ? msg[0] : msg) || 'Could not save the tag.'
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
          <SheetTitle>{editing ? 'Edit tag' : 'Add tag'}</SheetTitle>
          <SheetDescription>
            System tags are curated labels products can carry — some assignable
            by vendors, some reserved for admins.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Staff Pick"
            />
            {name.trim() && (
              <p className="font-mono text-[11px] text-gray-400">
                slug: {slugify(name)}
              </p>
            )}
            {renamed && usageCount > 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {usageCount.toLocaleString()} live product
                {usageCount === 1 ? '' : 's'} carry the old slug &ldquo;
                {tag?.slug}&rdquo;. Renaming changes the slug and does NOT
                update those products.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Kind</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as TaxonomyKind | '')}
                className={selectCls}
              >
                <option value="">All kinds</option>
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Assignable by</label>
              <select
                value={assignableBy}
                onChange={(e) =>
                  setAssignableBy(e.target.value as TagAssignableBy)
                }
                className={selectCls}
              >
                {ASSIGNABLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              Lower numbers appear first in tag pickers.
            </p>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create tag'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
