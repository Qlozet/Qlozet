'use client';

// Design Templates — the platform-curated starting points customers open in
// the shop's bespoke studio. This list mirrors the shop's template cards
// (image, name, real uses counter) plus admin-only state: status + delete.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Sparkles, TrendingUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import {
  useGetBespokeTemplatesQuery,
  useDeleteBespokeTemplateMutation,
  type BespokeTemplate,
} from '@/redux/services/bespoke-templates/bespoke-templates.api-slice';

const TemplateCard = ({ template }: { template: BespokeTemplate }) => {
  const router = useRouter();
  const [deleteTemplate, { isLoading: deleting }] =
    useDeleteBespokeTemplateMutation();

  const cover = template.design_images?.[0];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete the template “${template.name}”?`)) return;
    try {
      await deleteTemplate(template._id).unwrap();
      toast.success('Template deleted');
    } catch {
      toast.error('Could not delete the template.');
    }
  };

  return (
    <button
      type="button"
      onClick={() =>
        router.push(`${APP_ROUTES.productsTemplateStudio}?id=${template._id}`)
      }
      className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-card custom-card-shadow"
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
        <span
          role="button"
          tabIndex={0}
          onClick={handleDelete}
          onKeyDown={(e) => {
            if (e.key === 'Enter')
              handleDelete(e as unknown as React.MouseEvent);
          }}
          className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-gray-500 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 dark:bg-black/60 dark:text-gray-300"
        >
          {deleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 p-3">
        <p className="truncate text-sm font-semibold text-grey-black dark:text-white">
          {template.name}
        </p>
        <p className="text-xs text-grey3 dark:text-gray-400">
          {template.category} · {template.gender === 'men' ? 'Men' : 'Women'}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-grey3 dark:text-gray-400">
          <TrendingUp className="size-3 text-emerald-500" />
          {template.uses.toLocaleString()} use{template.uses === 1 ? '' : 's'}
        </p>
      </div>
    </button>
  );
};

export default function TemplatesTemplate() {
  const { data, isLoading, isError } = useGetBespokeTemplatesQuery();
  const templates = data?.data ?? [];

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

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-grey3 dark:text-gray-400">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading templates…
        </div>
      ) : isError ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-grey3 dark:text-gray-400">
          Could not load templates.
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
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {templates.map((t) => (
            <TemplateCard key={t._id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}
