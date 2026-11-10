'use client';

// Design Templates — the platform-curated starting points customers open in
// the shop's bespoke studio. This list mirrors the shop's template cards
// (image, name, real uses counter) plus admin-only state: status, search,
// duplicate and delete.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import {
  Copy,
  Loader2,
  Plus,
  Repeat2,
  Search,
  Sparkles,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { ConfirmActionModal } from '@/pattern/common/organisms/confirm-action-modal';
import {
  useGetBespokeTemplatesQuery,
  useCreateBespokeTemplateMutation,
  useDeleteBespokeTemplateMutation,
  type BespokeTemplate,
} from '@/redux/services/bespoke-templates/bespoke-templates.api-slice';

const studioUrl = (id: string) =>
  `${APP_ROUTES.productsTemplateStudio}?id=${id}`;

const iconButton =
  'flex size-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition-opacity hover:text-grey-black focus-visible:opacity-100 disabled:cursor-wait dark:bg-black/60 dark:text-gray-200 dark:hover:text-white';

const TemplateCard = ({ template }: { template: BespokeTemplate }) => {
  const router = useRouter();
  const [deleteTemplate] = useDeleteBespokeTemplateMutation();
  const [createTemplate, { isLoading: duplicating }] =
    useCreateBespokeTemplateMutation();

  const cover = template.design_images?.[0];

  const handleDelete = () =>
    NiceModal.show(ConfirmActionModal, {
      title: `Delete “${template.name}”?`,
      description:
        'It disappears from the shop’s Templates tab. Designs customers already started from it are kept.',
      confirmLabel: 'Delete template',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteTemplate(template._id).unwrap();
          toast.success('Template deleted');
        } catch (err: any) {
          toast.error('Could not delete the template.', {
            description: err?.data?.message,
          });
          throw err;
        }
      },
    });

  // A copy starts inactive, so it never shows on the shop half-finished.
  const handleDuplicate = async () => {
    try {
      const res = await createTemplate({
        name: `${template.name} (copy)`,
        category: template.category,
        gender: template.gender,
        design_images: template.design_images ?? [],
        back_views: template.back_views ?? [],
        reference_images: template.reference_images ?? [],
        description: template.description ?? undefined,
        status: 'inactive',
      }).unwrap();
      toast.success('Copy made, opening it');
      const id = (res as any)?.data?._id;
      if (id) router.push(studioUrl(id));
    } catch (err: any) {
      toast.error('Could not copy the template.', {
        description: err?.data?.message,
      });
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-card custom-card-shadow">
      <Link
        href={studioUrl(template._id)}
        className="flex flex-col focus-visible:outline-none"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F8F9FA] dark:bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={template.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Sparkles className="size-8 text-grey2 dark:text-gray-500" />
            </div>
          )}
          <span
            className={cn(
              'absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
              template.status === 'active'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            {template.status}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 p-3">
          <p className="truncate text-sm font-semibold text-grey-black dark:text-white">
            {template.name}
          </p>
          <p className="text-xs text-grey3 dark:text-gray-400">
            {template.category} · {template.gender === 'men' ? 'Men' : 'Women'}
            {' · '}
            {template.design_images?.length ?? 0} image
            {template.design_images?.length === 1 ? '' : 's'}
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-grey3 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="size-3 text-emerald-500" />
              {template.uses.toLocaleString()} use
              {template.uses === 1 ? '' : 's'}
            </span>
            {(template.back_views?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Repeat2 className="size-3" /> back view
              </span>
            )}
          </p>
        </div>
      </Link>

      {/* Actions sit beside the link, not inside it. Always shown on touch. */}
      <div className="absolute right-2.5 top-2.5 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <button
          type="button"
          onClick={() => void handleDuplicate()}
          disabled={duplicating}
          aria-label={`Duplicate ${template.name}`}
          title="Duplicate"
          className={iconButton}
        >
          {duplicating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${template.name}`}
          title="Delete"
          className={cn(
            iconButton,
            'hover:text-red-600 dark:hover:text-red-400'
          )}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
};

type GenderFilter = 'all' | 'women' | 'men';
type StatusFilter = 'all' | 'active' | 'inactive';

function Chips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg border border-border bg-white p-0.5 dark:bg-card"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            value === o.value
              ? 'bg-primary text-primary-foreground'
              : 'text-grey3 hover:text-grey-black dark:text-gray-400 dark:hover:text-white'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function TemplatesTemplate() {
  const { data, isLoading, isError, refetch } = useGetBespokeTemplatesQuery();
  const templates = useMemo(() => data?.data ?? [], [data]);

  const [query, setQuery] = useState('');
  const [gender, setGender] = useState<GenderFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter(
      (t) =>
        (gender === 'all' || t.gender === gender) &&
        (status === 'all' || t.status === status) &&
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q))
    );
  }, [templates, query, gender, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-grey-black dark:text-white">
            Design Templates
          </h1>
          <p className="mt-1 text-sm text-grey3 dark:text-gray-400">
            Curated starting points for the shop&apos;s bespoke studio. Only{' '}
            <span className="font-medium">active</span> templates appear to
            customers.
          </p>
        </div>
        <Link
          href={APP_ROUTES.productsTemplateStudio}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          New template
        </Link>
      </div>

      {templates.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 sm:max-w-xs">
            <span className="sr-only">Search templates</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey3" />
            <input
              id="templates-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or garment"
              className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-grey-black outline-none placeholder:text-gray-400 focus:border-primary dark:bg-card dark:text-white"
            />
          </label>
          <Chips
            label="Who for"
            value={gender}
            onChange={setGender}
            options={[
              { value: 'all', label: 'All' },
              { value: 'women', label: 'Women' },
              { value: 'men', label: 'Men' },
            ]}
          />
          <Chips
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Any status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-grey3 dark:text-gray-400">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading templates…
        </div>
      ) : isError ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-grey3 dark:text-gray-400">
          Could not load templates.
          <button
            type="button"
            onClick={() => void refetch()}
            className="h-9 cursor-pointer rounded-lg border border-border px-4 text-sm font-medium text-grey-black dark:text-white"
          >
            Try again
          </button>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
          <Sparkles className="mb-2 size-8 text-grey2 dark:text-gray-500" />
          <p className="text-sm font-semibold text-grey-black dark:text-white">
            No templates yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-grey3 dark:text-gray-400">
            Create the first starting point — pick styles, generate imagery and
            publish it to the shop&apos;s Templates tab.
          </p>
        </div>
      ) : shown.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-grey3 dark:text-gray-400">
          No templates match.
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setGender('all');
              setStatus('all');
            }}
            className="h-9 cursor-pointer rounded-lg border border-border px-4 text-sm font-medium text-grey-black dark:text-white"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((t) => (
            <TemplateCard key={t._id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}
