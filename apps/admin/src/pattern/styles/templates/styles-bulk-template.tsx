'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Loader2, Plus, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { Input } from '@/components/ui/input';
import {
  useBulkCreatePlatformStylesMutation,
  useRegenerateStyleImagesMutation,
  type BulkCreateResult,
  type StyleCategory,
  type StyleGender,
  type StyleType,
} from '@/redux/services/style-library/style-library.api-slice';
import {
  CATEGORY_OPTIONS,
  GENDER_OPTIONS,
  TYPE_OPTIONS,
  suggestStyleCode,
} from '../lib/style-options';

interface Row {
  name: string;
  code: string;
  codeTouched: boolean;
  category: StyleCategory;
  type: StyleType;
  gender: StyleGender;
  price: string;
}

const emptyRow = (): Row => ({
  name: '',
  code: '',
  codeTouched: false,
  category: 'neckline',
  type: 'top',
  gender: 'unisex',
  price: '',
});

const selectCls =
  'h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200';

export default function StylesBulkTemplate() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [result, setResult] = useState<BulkCreateResult | null>(null);
  const [bulkCreate, { isLoading: submitting }] =
    useBulkCreatePlatformStylesMutation();
  const [regenerateImages, { isLoading: regenerating }] =
    useRegenerateStyleImagesMutation();

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    );

  const submit = async () => {
    const filled = rows.filter((r) => r.name.trim());
    if (filled.length === 0) {
      toast.error('Add at least one style with a name.');
      return;
    }
    // Duplicate codes WITHIN the batch would all try to insert — catch early.
    const codes = filled.map((r) =>
      (r.code.trim() || suggestStyleCode(r.name)).toUpperCase()
    );
    const dupInBatch = codes.find((c, i) => codes.indexOf(c) !== i);
    if (dupInBatch) {
      toast.error(`Duplicate style code in this batch: ${dupInBatch}`);
      return;
    }
    try {
      const res = await bulkCreate({
        items: filled.map((r, i) => ({
          name: r.name.trim(),
          style_code: codes[i],
          category: r.category,
          type: r.type,
          gender: r.gender,
          price_suggestion: r.price ? Number(r.price) : undefined,
        })),
      }).unwrap();
      setResult(res);
      if (res.inserted > 0) {
        toast.success(
          `${res.inserted} style${res.inserted === 1 ? '' : 's'} created${
            res.skipped ? `, ${res.skipped} skipped` : ''
          }`
        );
      } else {
        toast.error('Nothing was created — every code already exists.');
      }
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error((Array.isArray(msg) ? msg[0] : msg) || 'Bulk create failed.');
    }
  };

  const backfillImages = async () => {
    try {
      await regenerateImages().unwrap();
      toast.success('Image generation started for the new styles.');
    } catch {
      toast.error('Could not start the image backfill.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(APP_ROUTES.productsStyles)}
            className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Back to styles"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Bulk add styles
            </h1>
            <p className="text-sm text-gray-500">
              Create many platform styles at once. Duplicate codes are skipped;
              images are generated afterwards with one click.
            </p>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="min-w-[860px]">
          <div className="mb-2 grid grid-cols-[1.4fr_1.1fr_1fr_1fr_1fr_0.8fr_72px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            <span>Name</span>
            <span>Code</span>
            <span>Category</span>
            <span>Type</span>
            <span>Audience</span>
            <span>Price ₦</span>
            <span />
          </div>
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.4fr_1.1fr_1fr_1fr_1fr_0.8fr_72px] items-center gap-2"
              >
                <Input
                  value={row.name}
                  onChange={(e) =>
                    setRow(i, {
                      name: e.target.value,
                      ...(row.codeTouched
                        ? {}
                        : { code: suggestStyleCode(e.target.value) }),
                    })
                  }
                  placeholder="Style name"
                  className="h-9"
                />
                <Input
                  value={row.code}
                  onChange={(e) =>
                    setRow(i, {
                      code: e.target.value.toUpperCase(),
                      codeTouched: true,
                    })
                  }
                  placeholder="CODE"
                  className="h-9 font-mono text-xs"
                />
                <select
                  value={row.category}
                  onChange={(e) =>
                    setRow(i, { category: e.target.value as StyleCategory })
                  }
                  className={selectCls}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={row.type}
                  onChange={(e) =>
                    setRow(i, { type: e.target.value as StyleType })
                  }
                  className={selectCls}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={row.gender}
                  onChange={(e) =>
                    setRow(i, { gender: e.target.value as StyleGender })
                  }
                  className={selectCls}
                >
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={0}
                  value={row.price}
                  onChange={(e) => setRow(i, { price: e.target.value })}
                  placeholder="0"
                  className="h-9"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Duplicate row"
                    onClick={() =>
                      setRows((prev) => [
                        ...prev.slice(0, i + 1),
                        { ...row, name: '', code: '', codeTouched: false },
                        ...prev.slice(i + 1),
                      ])
                    }
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                  >
                    <Copy className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove row"
                    onClick={() =>
                      setRows((prev) =>
                        prev.length === 1
                          ? prev
                          : prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, emptyRow()])}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Plus className="size-4" /> Add row
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {result.inserted} created · {result.skipped} skipped
          </p>
          {result.skipped_codes.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Skipped (code already exists):{' '}
              <span className="font-mono">
                {result.skipped_codes.join(', ')}
              </span>
            </p>
          )}
          {result.inserted > 0 && (
            <button
              type="button"
              onClick={backfillImages}
              disabled={regenerating}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Wand2 className="size-4" />
              {regenerating ? 'Generating…' : 'Generate images for new styles'}
            </button>
          )}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? 'Creating…' : 'Create styles'}
        </button>
      </div>
    </div>
  );
}
