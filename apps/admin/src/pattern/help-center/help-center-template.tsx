'use client';

// Help Center — admin management of the article knowledge base that powers
// /help in the shop (customer articles) and the vendor console (vendor
// articles). One collection: FAQs are featured question-titled shorts,
// guides are categorized walkthroughs, policies interpolate live platform
// settings via {{placeholders}}.

import { useMemo, useState } from 'react';
import {
  BookOpen,
  Eye,
  Loader2,
  Pencil,
  Plus,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useGetHelpArticlesQuery,
  useCreateHelpArticleMutation,
  useUpdateHelpArticleMutation,
  useDeleteHelpArticleMutation,
  type HelpArticle,
  type SaveHelpArticleRequest,
} from '@/redux/services/help-center/help-center.api-slice';

const SUGGESTED_CATEGORIES = [
  'Orders & Delivery',
  'Returns & Refunds',
  'Bespoke & Measurements',
  'Payments & Wallet',
  'Payouts & Earnings',
  'Products & Moderation',
  'Quotes & Bespoke',
  'Policies',
];

const AUDIENCE_LABEL: Record<string, string> = {
  customer: 'Customers',
  vendor: 'Vendors',
  both: 'Both',
};

const EMPTY_FORM: SaveHelpArticleRequest = {
  title: '',
  body: '',
  category: SUGGESTED_CATEGORIES[0],
  audience: 'customer',
  published: false,
  featured: false,
  order: 0,
};

export default function HelpCenterTemplate() {
  const { data, isLoading, isError } = useGetHelpArticlesQuery();
  const [createArticle, { isLoading: creating }] =
    useCreateHelpArticleMutation();
  const [updateArticle, { isLoading: updating }] =
    useUpdateHelpArticleMutation();
  const [deleteArticle] = useDeleteHelpArticleMutation();

  const articles = useMemo(() => data?.data ?? [], [data]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SaveHelpArticleRequest>(EMPTY_FORM);
  const saving = creating || updating;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setEditorOpen(true);
  };
  const openEdit = (a: HelpArticle) => {
    setEditingId(a._id);
    setForm({
      title: a.title,
      body: a.body,
      category: a.category,
      audience: a.audience,
      published: a.published,
      featured: a.featured,
      order: a.order,
    });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) return toast.error('Give the article a title.');
    if (!form.body?.trim()) return toast.error('Write the article body.');
    if (!form.category?.trim()) return toast.error('Pick a category.');
    try {
      if (editingId) {
        await updateArticle({ id: editingId, data: form }).unwrap();
        toast.success('Article updated');
      } else {
        await createArticle(form).unwrap();
        toast.success('Article created');
      }
      setEditorOpen(false);
    } catch {
      toast.error('Could not save the article.');
    }
  };

  const handleDelete = async (a: HelpArticle) => {
    if (!window.confirm(`Delete “${a.title}”?`)) return;
    try {
      await deleteArticle(a._id).unwrap();
      toast.success('Article deleted');
    } catch {
      toast.error('Could not delete the article.');
    }
  };

  // Group by category for a scannable list.
  const grouped = useMemo(() => {
    const map = new Map<string, HelpArticle[]>();
    for (const a of articles) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return [...map.entries()];
  }, [articles]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-grey-black dark:text-white">
            Help Center
          </h1>
          <p className="mt-1 text-sm text-grey3 dark:text-gray-400">
            FAQs, guides and policies shown at /help in the shop and vendor
            console. Bodies are markdown;{' '}
            <code className="rounded bg-[#F8F9FA] px-1 dark:bg-muted">
              {'{{platform_setting_key}}'}
            </code>{' '}
            placeholders render live settings values, so policy numbers never
            drift.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          New article
        </button>
      </div>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-grey3 dark:text-gray-400">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading articles…
        </div>
      ) : isError ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-grey3 dark:text-gray-400">
          Could not load articles.
        </div>
      ) : articles.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
          <BookOpen className="mb-2 size-8 text-grey2 dark:text-gray-500" />
          <p className="text-sm font-semibold text-grey-black dark:text-white">
            No articles yet
          </p>
          <p className="mt-1 max-w-sm text-xs text-grey3 dark:text-gray-400">
            Start with the questions support answers most — returns, delivery
            times, how bespoke quotes work, when vendors get paid.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, list]) => (
            <div
              key={category}
              className="overflow-hidden rounded-xl border border-border bg-white custom-card-shadow dark:bg-card"
            >
              <div className="border-b border-border/60 px-5 py-3">
                <p className="text-sm font-bold text-grey-black dark:text-white">
                  {category}
                  <span className="ml-2 text-xs font-normal text-grey3 dark:text-gray-400">
                    {list.length} article{list.length === 1 ? '' : 's'}
                  </span>
                </p>
              </div>
              <div className="divide-y divide-border/40">
                {list.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#F8F9FA] dark:hover:bg-muted/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-grey-black dark:text-white">
                        {a.title}
                        {a.featured && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            FAQ
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 flex items-center gap-3 text-xs text-grey3 dark:text-gray-400">
                        <span>{AUDIENCE_LABEL[a.audience]}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" /> {a.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="size-3" /> {a.helpful_yes}/
                          {a.helpful_yes + a.helpful_no}
                        </span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                        a.published
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}
                    >
                      {a.published ? 'Published' : 'Draft'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-grey3 transition-colors hover:bg-white hover:text-grey-black dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a)}
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-grey3 transition-colors hover:bg-white hover:text-red-600 dark:hover:bg-gray-800"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Editor sheet ── */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl"
        >
          <SheetHeader className="pb-4">
            <SheetTitle>
              {editingId ? 'Edit article' : 'New article'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                Title
              </label>
              <input
                value={form.title ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. How do returns work?"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-grey-black outline-none focus:border-primary dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                  Category
                </label>
                <input
                  value={form.category ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  list="help-categories"
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-grey-black outline-none focus:border-primary dark:bg-gray-900 dark:text-white"
                />
                <datalist id="help-categories">
                  {SUGGESTED_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                  Audience
                </label>
                <select
                  value={form.audience ?? 'customer'}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      audience: e.target.value as HelpArticle['audience'],
                    }))
                  }
                  className="h-10 w-full cursor-pointer rounded-lg border border-border bg-white px-3 text-sm text-grey-black outline-none focus:border-primary dark:bg-gray-900 dark:text-white"
                >
                  <option value="customer">Customers (shop)</option>
                  <option value="vendor">Vendors (console)</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                Body (markdown)
              </label>
              <textarea
                value={form.body ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
                }
                rows={14}
                placeholder={
                  'You can return items within {{return_window_days}} days of delivery…'
                }
                className="w-full resize-y rounded-lg border border-border bg-white p-3 font-mono text-[13px] leading-relaxed text-grey-black outline-none focus:border-primary dark:bg-gray-900 dark:text-white"
              />
              <p className="mt-1.5 text-[11px] text-grey3 dark:text-gray-400">
                Placeholders pull live values on the public pages:{' '}
                {'{{return_window_days}}'}, {'{{late_penalty_percent_per_day}}'}
                , {'{{reservation_fee_percent}}'}, {'{{payout_delay_days}}'},{' '}
                {'{{delivery_transit_max_days}}'} … (any platform-settings key).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-grey-black dark:text-white">
                <input
                  type="checkbox"
                  checked={!!form.published}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, published: e.target.checked }))
                  }
                  className="size-4 accent-primary"
                />
                Published
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-grey-black dark:text-white">
                <input
                  type="checkbox"
                  checked={!!form.featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                  className="size-4 accent-primary"
                />
                Featured (FAQ row)
              </label>
              <label className="flex items-center gap-2 text-sm text-grey-black dark:text-white">
                Order
                <input
                  type="number"
                  value={form.order ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: Number(e.target.value) }))
                  }
                  className="h-9 w-20 rounded-lg border border-border bg-white px-2 text-sm text-grey-black outline-none dark:bg-gray-900 dark:text-white"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-grey-black transition-colors hover:bg-[#F8F9FA] dark:text-white dark:hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingId ? 'Save changes' : 'Create article'}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
