'use client';

// Template Studio — the admin's version of the shop's bespoke studio.
// Same bones: a dotted canvas with the generated garment, a right-hand
// panel of style sections (tiles from the platform style library), a color
// row, a prompt, and a Generate button driving the shared AI pipeline
// (free for platform users — the backend skips the token charge).
// What comes out is a TEMPLATE: a curated starting point the shop's
// Templates tab offers to customers.

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import {
  useGetBespokeTemplateQuery,
  useCreateBespokeTemplateMutation,
  useUpdateBespokeTemplateMutation,
  useGenerateTemplateOutfitMutation,
  useLazyGetGenerationJobQuery,
} from '@/redux/services/bespoke-templates/bespoke-templates.api-slice';
import { useGetAdminStylesQuery } from '@/redux/services/style-library/style-library.api-slice';
import type { PlatformStyle } from '@/redux/services/style-library/style-library.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';

// Mirrors the shop studio's garment catalogue + its category→scope mapping.
const CATEGORIES: Record<'women' | 'men', string[]> = {
  women: ['Tops', 'Dresses', 'Skirts', 'Pants', 'Jumpsuits', 'Sets'],
  men: ['Kaftan', 'Agbada', 'Pants', 'Shirts', 'Suits', 'Sets'],
};

const TYPE_MAP: Record<string, 'top' | 'bottom' | 'full_body'> = {
  tops: 'top',
  shirts: 'top',
  blouses: 'top',
  dresses: 'full_body',
  jumpsuits: 'full_body',
  kaftan: 'full_body',
  agbada: 'full_body',
  sets: 'full_body',
  suits: 'full_body',
  skirts: 'bottom',
  pants: 'bottom',
  trousers: 'bottom',
};

// Style sections shown as tabs — the shop's SILHOUETTE/NECKLINE/SLEEVE/COLLAR.
const SECTIONS: { key: string; label: string; selection: SelectionKey }[] = [
  { key: 'full_body', label: 'Silhouette', selection: 'silhouette' },
  { key: 'neckline', label: 'Neckline', selection: 'neckline' },
  { key: 'sleeve', label: 'Sleeve', selection: 'sleeve' },
  { key: 'collar', label: 'Collar', selection: 'collar' },
];

type SelectionKey = 'silhouette' | 'neckline' | 'sleeve' | 'collar';

// The shop studio's fabric colour palette, verbatim.
const COLORS = [
  '#1B2A4A',
  '#8B4513',
  '#2C1810',
  '#D4AF37',
  '#800020',
  '#F5F0E8',
  '#3B5998',
  '#228B22',
  '#FF6347',
  '#4B0082',
  '#E8D5B7',
  '#1A1A1A',
];

function StudioInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');

  // ── Template state ──
  const [name, setName] = useState('Untitled Template');
  const [gender, setGender] = useState<'women' | 'men'>('women');
  const [category, setCategory] = useState('Dresses');
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive');
  const [images, setImages] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selections, setSelections] = useState<
    Record<SelectionKey, string | null>
  >({ silhouette: null, neckline: null, sleeve: null, collar: null });
  const [color, setColor] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const [panelTab, setPanelTab] = useState<'basics' | 'styles' | 'finish'>(
    'basics'
  );
  const [styleSection, setStyleSection] = useState<string>('full_body');

  // ── Load when editing ──
  const { data: existing } = useGetBespokeTemplateQuery(templateId ?? '', {
    skip: !templateId,
  });
  const hydrated = useRef(false);
  useEffect(() => {
    const t = existing?.data;
    if (!t || hydrated.current) return;
    hydrated.current = true;
    setName(t.name);
    setGender(t.gender === 'men' ? 'men' : 'women');
    setCategory(t.category);
    setStatus(t.status);
    setImages(t.design_images ?? []);
    if (t.description) {
      try {
        const parsed = JSON.parse(t.description);
        const sel = parsed?.selections ?? {};
        setSelections({
          silhouette: sel.silhouette ?? null,
          neckline: sel.neckline ?? null,
          sleeve: sel.sleeve ?? null,
          collar: sel.collar ?? null,
        });
        if (sel.color) setColor(sel.color);
        if (parsed?.userPrompt) setPrompt(parsed.userPrompt);
      } catch {
        /* legacy/plain description — fields stay at defaults */
      }
    }
  }, [existing]);

  // ── Style library ──
  const { data: styleData } = useGetAdminStylesQuery({ scope: 'platform' });
  const allStyles = useMemo(() => styleData?.styles ?? [], [styleData]);

  const garmentScope = TYPE_MAP[category.toLowerCase()] ?? 'full_body';
  const genderKey = gender === 'men' ? 'male' : 'female';

  const sectionStyles = useMemo(
    () =>
      allStyles.filter(
        (s) =>
          s.category === styleSection &&
          s.is_active !== false &&
          (s.gender === 'unisex' || s.gender === genderKey) &&
          (s.type === garmentScope || s.category !== 'full_body')
      ),
    [allStyles, styleSection, genderKey, garmentScope]
  );

  const styleById = (id: string | null): PlatformStyle | undefined =>
    id ? allStyles.find((s) => s._id === id) : undefined;

  // ── Generate ──
  const [generate] = useGenerateTemplateOutfitMutation();
  const [pollJob] = useLazyGetGenerationJobQuery();
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<string | null>(null);

  const runGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setGenStatus('Queuing generation…');
    try {
      const constructionSelections: Record<string, string> = {};
      const sil = styleById(selections.silhouette);
      const neck = styleById(selections.neckline);
      const slv = styleById(selections.sleeve);
      const col = styleById(selections.collar);
      if (sil) constructionSelections.silhouette = sil.name;
      if (neck) constructionSelections.neckline = neck.name;
      if (slv) constructionSelections.sleeve_style = slv.name;
      if (col) constructionSelections.collar = col.name;

      const config: Record<string, unknown> = {
        garmentType: `${genderKey}_${garmentScope}`,
        gender: genderKey,
        view: 'front',
        constructionSelections,
      };

      const colourNote = color ? ` Primary colour: ${color}.` : '';
      const res = await generate({
        config,
        userPrompt: `${prompt.trim()}${colourNote}`.trim() || undefined,
      }).unwrap();
      const jobId =
        (res as any)?.data?.jobId ??
        (res as any)?.jobId ??
        (res as any)?.data?.job_id;
      if (!jobId) throw new Error('No job id returned');

      setGenStatus('AI is drawing the garment…');
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));
        const jobRes = await pollJob(jobId).unwrap();
        const job: any = (jobRes as any)?.data ?? jobRes;
        if (job?.status === 'completed') {
          const url = job?.result?.image_url ?? job?.result?.fileUrl;
          if (!url) throw new Error('Job finished without an image');
          setImages((prev) => {
            const next = [...prev, url];
            setActiveIdx(next.length - 1);
            return next;
          });
          setGenStatus(null);
          setGenerating(false);
          return;
        }
        if (job?.status === 'failed') {
          throw new Error(job?.error || 'Generation failed');
        }
      }
      throw new Error('Generation timed out');
    } catch (err: any) {
      toast.error(err?.message || 'Generation failed. Please try again.');
      setGenStatus(null);
      setGenerating(false);
    }
  };

  // ── Upload ──
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [uploadImage, { isLoading: uploading }] =
    useUploadProductImageMutation();
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const res = await uploadImage(file).unwrap();
      const url = (res as any)?.data?.url ?? (res as any)?.url;
      if (!url) throw new Error('Upload returned no URL');
      setImages((prev) => {
        const next = [...prev, url];
        setActiveIdx(next.length - 1);
        return next;
      });
    } catch {
      toast.error('Image upload failed.');
    }
  };

  // ── Save ──
  const [createTemplate, { isLoading: creating }] =
    useCreateBespokeTemplateMutation();
  const [updateTemplate, { isLoading: updating }] =
    useUpdateBespokeTemplateMutation();
  const saving = creating || updating;

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Give the template a name.');
    if (images.length === 0)
      return toast.error('Add at least one image — generate or upload.');
    const description = JSON.stringify({
      notes: '',
      selections: {
        ...(selections.silhouette && { silhouette: selections.silhouette }),
        ...(selections.neckline && { neckline: selections.neckline }),
        ...(selections.sleeve && { sleeve: selections.sleeve }),
        ...(selections.collar && { collar: selections.collar }),
        ...(color && { color }),
      },
      userPrompt: prompt.trim() || undefined,
    });
    const payload = {
      name: name.trim(),
      category,
      gender,
      design_images: images,
      description,
      status,
    };
    try {
      if (templateId) {
        await updateTemplate({ id: templateId, data: payload }).unwrap();
        toast.success('Template updated');
      } else {
        await createTemplate(payload).unwrap();
        toast.success('Template created');
      }
      router.push(APP_ROUTES.productsTemplates);
    } catch {
      toast.error('Could not save the template.');
    }
  };

  const activeImage = images[activeIdx];

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col gap-4">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(APP_ROUTES.productsTemplates)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-grey-black transition-colors hover:bg-[#F8F9FA] dark:bg-card dark:text-white dark:hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-lg font-bold text-grey-black outline-none transition-colors focus:border-border dark:text-white"
          placeholder="Template name"
        />
        {/* Status — the mockup's Active/Inactive card, compacted */}
        <label className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm dark:bg-card">
          <span
            className={cn(
              'size-2 rounded-full',
              status === 'active' ? 'bg-emerald-500' : 'bg-red-400'
            )}
          />
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value === 'active' ? 'active' : 'inactive')
            }
            className="cursor-pointer bg-transparent text-sm font-medium text-grey-black outline-none dark:text-white [&>option]:dark:bg-card"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {templateId ? 'Save changes' : 'Create template'}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        {/* ── Canvas ── */}
        <div
          className="relative flex flex-1 flex-col items-center justify-center rounded-xl border border-border p-6"
          style={{
            backgroundImage:
              'radial-gradient(rgba(128,128,128,0.18) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        >
          {activeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage}
              alt={name}
              className="max-h-[52vh] w-auto rounded-xl object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <Sparkles className="mb-3 size-10 text-grey2 dark:text-gray-500" />
              <p className="text-sm font-semibold text-grey-black dark:text-white">
                No imagery yet
              </p>
              <p className="mt-1 max-w-xs text-xs text-grey3 dark:text-gray-400">
                Pick styles on the right and hit Generate, or upload an image.
              </p>
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="mt-4 flex max-w-full gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <div key={img + i} className="group/thumb relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      'block size-14 cursor-pointer overflow-hidden rounded-lg border-2',
                      i === activeIdx ? 'border-primary' : 'border-transparent'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImages((prev) => prev.filter((_, x) => x !== i));
                      setActiveIdx((idx) =>
                        Math.max(0, idx - (i <= idx ? 1 : 0))
                      );
                    }}
                    className="absolute -right-1.5 -top-1.5 hidden size-5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white group-hover/thumb:flex"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Generate bar — free for admins, so no token badge */}
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-grey-black transition-colors hover:bg-[#F8F9FA] disabled:opacity-50 dark:bg-card dark:text-white dark:hover:bg-muted"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              Upload
            </button>
            <button
              type="button"
              onClick={runGenerate}
              disabled={generating}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {generating ? (genStatus ?? 'Generating…') : 'Generate'}
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* ── Config panel ── */}
        <div className="flex w-full flex-col rounded-xl border border-border bg-white custom-card-shadow dark:bg-card lg:w-[400px]">
          {/* Panel tabs — Support-pill styling */}
          <div className="p-3">
            <div className="flex h-auto w-full gap-1 rounded-xl bg-[#F8F9FA] p-1 dark:bg-muted">
              {(
                [
                  ['basics', 'Basics'],
                  ['styles', 'Styles'],
                  ['finish', 'Colour & Prompt'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPanelTab(key)}
                  className={cn(
                    'flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    panelTab === key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-grey3 hover:text-grey-black dark:text-gray-400 dark:hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pt-1">
            {panelTab === 'basics' && (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                    Gender
                  </p>
                  <div className="flex gap-2">
                    {(['women', 'men'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setGender(g);
                          setCategory(CATEGORIES[g][0]);
                          setSelections({
                            silhouette: null,
                            neckline: null,
                            sleeve: null,
                            collar: null,
                          });
                        }}
                        className={cn(
                          'flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors',
                          gender === g
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-grey3 hover:text-grey-black dark:text-gray-400 dark:hover:text-white'
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                    Garment
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES[gender].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={cn(
                          'cursor-pointer rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors',
                          category === c
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-grey3 hover:text-grey-black dark:text-gray-400 dark:hover:text-white'
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {panelTab === 'styles' && (
              <div className="space-y-4">
                {/* Section tabs — SILHOUETTE · NECKLINE · SLEEVE · COLLAR */}
                <div className="flex flex-wrap gap-1.5">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setStyleSection(s.key)}
                      className={cn(
                        'cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors',
                        styleSection === s.key
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-grey3 hover:text-grey-black dark:text-gray-400 dark:hover:text-white'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {sectionStyles.length === 0 ? (
                  <p className="py-8 text-center text-xs text-grey3 dark:text-gray-400">
                    No{' '}
                    {SECTIONS.find(
                      (s) => s.key === styleSection
                    )?.label.toLowerCase()}{' '}
                    styles for this garment yet — add them under Products →
                    Styles.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {sectionStyles.map((s) => {
                      const selKey = SECTIONS.find(
                        (x) => x.key === styleSection
                      )!.selection;
                      const selected = selections[selKey] === s._id;
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() =>
                            setSelections((prev) => ({
                              ...prev,
                              [selKey]: selected ? null : s._id,
                            }))
                          }
                          className={cn(
                            'group/tile relative cursor-pointer overflow-hidden rounded-lg border p-1.5 transition-colors',
                            selected
                              ? 'border-primary ring-1 ring-primary'
                              : 'border-border hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <div className="mb-1 aspect-square w-full overflow-hidden rounded-md bg-[#F8F9FA] dark:bg-muted">
                            {s.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={s.image_url}
                                alt={s.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-grey2 dark:text-gray-500">
                                <Sparkles className="size-4" />
                              </div>
                            )}
                          </div>
                          <p className="truncate text-center text-[11px] font-medium text-grey-black dark:text-white">
                            {s.name}
                          </p>
                          {selected && (
                            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {panelTab === 'finish' && (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                    Colour
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(color === c ? null : c)}
                        className={cn(
                          'size-9 cursor-pointer rounded-full border-2 transition-transform hover:scale-110',
                          color === c
                            ? 'border-primary ring-2 ring-primary/40'
                            : 'border-border'
                        )}
                        style={{ background: c }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                    Prompt
                  </p>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="Describe the look — e.g. “elegant with rich ankara motifs and gold embroidery accents”"
                    className="w-full resize-y rounded-lg border border-border bg-white p-3 text-sm text-grey-black outline-none placeholder:text-gray-400 focus:border-primary dark:bg-gray-900 dark:text-white"
                  />
                  <p className="mt-1.5 text-[11px] text-grey3 dark:text-gray-400">
                    Saved with the template — customers inherit it as their
                    starting instructions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplateStudio() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-48 items-center justify-center text-sm text-grey3 dark:text-gray-400">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading studio…
        </div>
      }
    >
      <StudioInner />
    </Suspense>
  );
}
