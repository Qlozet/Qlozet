'use client';

// Template Studio — the admin's twin of the shop's bespoke studio.
// Same bones: a dotted canvas with the garment, a floating toolbar of tools,
// and a config DRAWER — a right-hand slide-in on desktop, a bottom sheet on
// mobile (mirroring the shop's MobileBottomSheet). Sections: Basics, Styles,
// Finishing (the shop's embellishment catalogue), Photo & Notes (reference
// upload + AI analysis that writes the prompt and auto-applies matched
// styles), and Colour & Prompt. Generation + analysis run the shared
// pipelines, free for platform users.

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Gem,
  ImagePlus,
  Loader2,
  MessageSquare,
  Palette,
  Settings2,
  Shirt,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
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
  useAnalyzeReferenceMutation,
} from '@/redux/services/bespoke-templates/bespoke-templates.api-slice';
import { useGetAdminStylesQuery } from '@/redux/services/style-library/style-library.api-slice';
import type { PlatformStyle } from '@/redux/services/style-library/style-library.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { EMBELLISHMENTS, filterEmbellishments } from './embellishments';

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

type SelectionKey = 'silhouette' | 'neckline' | 'sleeve' | 'collar';

const STYLE_SECTIONS: {
  key: string;
  label: string;
  selection: SelectionKey;
}[] = [
  { key: 'full_body', label: 'Silhouette', selection: 'silhouette' },
  { key: 'neckline', label: 'Neckline', selection: 'neckline' },
  { key: 'sleeve', label: 'Sleeve', selection: 'sleeve' },
  { key: 'collar', label: 'Collar', selection: 'collar' },
];

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

type ToolKey = 'basics' | 'styles' | 'finishing' | 'reference' | 'colour';

const TOOLS: { key: ToolKey; label: string; icon: React.ElementType }[] = [
  { key: 'basics', label: 'Basics', icon: Settings2 },
  { key: 'styles', label: 'Styles', icon: Shirt },
  { key: 'finishing', label: 'Finishing', icon: Gem },
  { key: 'reference', label: 'Photo & Notes', icon: MessageSquare },
  { key: 'colour', label: 'Colour', icon: Palette },
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
  const [references, setReferences] = useState<string[]>([]);
  const [selections, setSelections] = useState<
    Record<SelectionKey, string | null>
  >({ silhouette: null, neckline: null, sleeve: null, collar: null });
  const [embellishments, setEmbellishments] = useState<string[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  // Drawer: which tool is open (null = closed). Desktop slides from the
  // right; mobile rises as a bottom sheet like the shop studio. lastTool
  // keeps the panel content rendered through the CLOSE animation.
  const [openTool, setOpenTool] = useState<ToolKey | null>('basics');
  const [lastTool, setLastTool] = useState<ToolKey>('basics');
  useEffect(() => {
    if (openTool) setLastTool(openTool);
  }, [openTool]);
  const displayTool = openTool ?? lastTool;
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
    setReferences(t.reference_images ?? []);
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
        if (Array.isArray(sel.accessories)) {
          setEmbellishments(
            sel.accessories
              .map((a: { id?: string } | string) =>
                typeof a === 'string' ? a : a?.id
              )
              .filter((x: unknown): x is string => typeof x === 'string')
          );
        }
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

  const availableEmbellishments = useMemo(
    () => filterEmbellishments(garmentScope, genderKey),
    [garmentScope, genderKey]
  );

  const styleById = (id: string | null): PlatformStyle | undefined =>
    id ? allStyles.find((s) => s._id === id) : undefined;

  // ── Job polling (shared by generate + analyze) ──
  const [pollJob] = useLazyGetGenerationJobQuery();
  const waitForJob = async (jobId: string): Promise<any> => {
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      const jobRes = await pollJob(jobId).unwrap();
      const job: any = (jobRes as any)?.data ?? jobRes;
      if (job?.status === 'completed') return job.result ?? {};
      if (job?.status === 'failed') {
        throw new Error(job?.error || 'The AI job failed');
      }
    }
    throw new Error('The AI job timed out');
  };

  // ── Generate ──
  const [generate] = useGenerateTemplateOutfitMutation();
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
      const chosenEmb = embellishments
        .map((id) => EMBELLISHMENTS.find((e) => e.id === id)?.name)
        .filter(Boolean) as string[];
      if (chosenEmb.length) config.aestheticKeywords = chosenEmb;

      const colourNote = color ? ` Primary colour: ${color}.` : '';
      const res = await generate({
        config,
        userPrompt: `${prompt.trim()}${colourNote}`.trim() || undefined,
        reference_image_urls: references.length ? references : undefined,
      }).unwrap();
      const jobId =
        (res as any)?.data?.jobId ??
        (res as any)?.jobId ??
        (res as any)?.data?.job_id;
      if (!jobId) throw new Error('No job id returned');

      setGenStatus('AI is drawing the garment…');
      const result = await waitForJob(jobId);
      const url = result?.image_url ?? result?.fileUrl;
      if (!url) throw new Error('Job finished without an image');
      setImages((prev) => {
        const next = [...prev, url];
        setActiveIdx(next.length - 1);
        return next;
      });
    } catch (err: any) {
      toast.error(err?.message || 'Generation failed. Please try again.');
    } finally {
      setGenStatus(null);
      setGenerating(false);
    }
  };

  // ── Reference upload + analysis (the shop's Photo & Notes flow) ──
  const refInput = useRef<HTMLInputElement | null>(null);
  const [uploadImage, { isLoading: uploading }] =
    useUploadProductImageMutation();
  const [analyzeReference] = useAnalyzeReferenceMutation();
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalyze = async (imageUrl: string) => {
    setAnalyzing(true);
    try {
      const res = await analyzeReference({ image_url: imageUrl }).unwrap();
      const jobId =
        (res as any)?.data?.jobId ??
        (res as any)?.jobId ??
        (res as any)?.data?.job_id;
      if (!jobId) throw new Error('No job id returned');
      const result = await waitForJob(jobId);

      // Auto-apply matched platform styles, exactly like the shop overlay.
      const matched = result?.matched_styles ?? {};
      const applied: string[] = [];
      const applyIf = (key: SelectionKey, m: any) => {
        const id = m?.style_id ?? m?.style_name;
        if (!id) return;
        setSelections((prev) => ({ ...prev, [key]: id }));
        if (m?.style_name) applied.push(m.style_name);
      };
      applyIf('neckline', matched.neckline);
      applyIf('sleeve', matched.sleeve);
      applyIf('silhouette', matched.silhouette);
      applyIf('collar', matched.collar);

      if (result?.suggested_prompt) setPrompt(result.suggested_prompt);

      toast.success(
        applied.length
          ? `Styles detected: ${applied.join(', ')}`
          : 'Reference analyzed — prompt updated'
      );
    } catch (err: any) {
      toast.error(err?.message || 'Analysis failed — the photo was kept.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReferenceUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (references.length >= 3)
      return toast.error('Maximum 3 reference photos.');
    try {
      const res = await uploadImage(file).unwrap();
      const url = (res as any)?.data?.url ?? (res as any)?.url;
      if (!url) throw new Error('Upload returned no URL');
      setReferences((prev) => [...prev, url].slice(0, 3));
      // First photo also feeds the AI, like the shop's auto-analysis.
      void runAnalyze(url);
    } catch {
      toast.error('Reference upload failed.');
    }
  };

  // ── Canvas image upload ──
  const canvasInput = useRef<HTMLInputElement | null>(null);
  const [uploadingCanvas, setUploadingCanvas] = useState(false);
  const handleCanvasUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingCanvas(true);
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
    } finally {
      setUploadingCanvas(false);
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
    // Embellishments save enriched ({id, name, emoji}) — the same shape the
    // shop's own designs store, so vendors and the studio both understand it.
    const enriched = embellishments
      .map((id) => EMBELLISHMENTS.find((e) => e.id === id))
      .filter(Boolean)
      .map((e) => ({ id: e!.id, name: e!.name, emoji: e!.emoji }));
    const description = JSON.stringify({
      notes: '',
      selections: {
        ...(selections.silhouette && { silhouette: selections.silhouette }),
        ...(selections.neckline && { neckline: selections.neckline }),
        ...(selections.sleeve && { sleeve: selections.sleeve }),
        ...(selections.collar && { collar: selections.collar }),
        ...(color && { color }),
        ...(enriched.length && { accessories: enriched }),
      },
      userPrompt: prompt.trim() || undefined,
    });
    const payload = {
      name: name.trim(),
      category,
      gender,
      design_images: images,
      reference_images: references,
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
  const openToolMeta = TOOLS.find((t) => t.key === displayTool);

  // ── Drawer content (shared between desktop drawer + mobile sheet) ──
  const drawerContent = (
    <>
      {displayTool === 'basics' && (
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
                    setEmbellishments([]);
                  }}
                  className={cn(
                    'flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-all hover:shadow-md',
                    gender === g
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-grey3 hover:-translate-y-0.5 hover:text-grey-black dark:text-gray-400 dark:hover:text-white'
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
                    'cursor-pointer rounded-xl border px-2 py-2.5 text-xs font-medium transition-all hover:shadow-md',
                    category === c
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-grey3 hover:-translate-y-0.5 hover:text-grey-black dark:text-gray-400 dark:hover:text-white'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {displayTool === 'styles' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {STYLE_SECTIONS.map((s) => (
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
              {STYLE_SECTIONS.find(
                (s) => s.key === styleSection
              )?.label.toLowerCase()}{' '}
              styles for this garment yet — add them under Products → Styles.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Shop-style rows: thumbnail + name, lift + shadow on hover */}
              {sectionStyles.map((s) => {
                const selKey = STYLE_SECTIONS.find(
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
                      'flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-2 pr-3 transition-all hover:-translate-y-0.5 hover:shadow-md',
                      selected
                        ? 'border-primary bg-[#F8F9FA] dark:bg-muted'
                        : 'border-transparent bg-[#F8F9FA] dark:bg-muted'
                    )}
                  >
                    <div className="size-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
                      {s.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.image_url}
                          alt={s.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-grey2 dark:text-gray-500">
                          <Sparkles className="size-4" />
                        </div>
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-grey-black dark:text-white">
                      {s.name}
                    </span>
                    <span
                      className={cn(
                        'size-[18px] shrink-0 rounded-full border-2 transition-all',
                        selected
                          ? 'border-[5px] border-primary'
                          : 'border-border'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {displayTool === 'finishing' && (
        <div className="space-y-3">
          <p className="text-xs text-grey3 dark:text-gray-400">
            Tailor-applied finishing — customers inherit these and the tailor
            prices them in the quote.
          </p>
          <div className="flex flex-col gap-2">
            {availableEmbellishments.map((e) => {
              const selected = embellishments.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() =>
                    setEmbellishments((prev) =>
                      selected
                        ? prev.filter((x) => x !== e.id)
                        : [...prev, e.id]
                    )
                  }
                  className={cn(
                    'flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                    selected
                      ? 'border-primary bg-[#F8F9FA] dark:bg-muted'
                      : 'border-transparent bg-[#F8F9FA] dark:bg-muted'
                  )}
                >
                  <span className="text-xl leading-none">{e.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-grey-black dark:text-white">
                      {e.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-grey3 dark:text-gray-400">
                      {e.description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    )}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {displayTool === 'reference' && (
        <div className="space-y-4">
          {/* Upload zone — the shop's dashed drop area */}
          <button
            type="button"
            onClick={() =>
              !uploading && references.length < 3 && refInput.current?.click()
            }
            disabled={uploading || references.length >= 3}
            className={cn(
              'flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-[#F8F9FA] px-4 py-7 transition-colors hover:border-primary dark:bg-muted',
              (uploading || references.length >= 3) &&
                'cursor-not-allowed opacity-50'
            )}
          >
            {uploading ? (
              <Loader2 className="mb-2 size-6 animate-spin text-grey3" />
            ) : (
              <Upload className="mb-2 size-6 text-grey3 dark:text-gray-400" />
            )}
            <span className="text-xs font-semibold text-grey-black dark:text-white">
              {references.length >= 3
                ? 'Maximum 3 reference photos'
                : 'Drop a reference photo or choose a file'}
            </span>
            <span className="mt-1 text-[10px] text-grey3 dark:text-gray-400">
              PNG, JPG · {references.length}/3 · AI reads it into the prompt
            </span>
          </button>
          <input
            ref={refInput}
            type="file"
            accept="image/*"
            onChange={handleReferenceUpload}
            className="hidden"
          />

          {analyzing && (
            <p className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Loader2 className="size-3.5 animate-spin" /> Analyzing your
              reference…
            </p>
          )}

          {references.map((img, idx) => (
            <div
              key={img + idx}
              className="flex items-center justify-between rounded-xl bg-[#F8F9FA] p-2.5 dark:bg-muted"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Reference ${idx + 1}`}
                  className="size-10 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-grey-black dark:text-white">
                    Reference {idx + 1}
                  </p>
                  <p className="text-[10px] text-grey3 dark:text-gray-400">
                    ✓ Uploaded — sent with generation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setReferences((prev) => prev.filter((_, x) => x !== idx))
                }
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-grey3 transition-colors hover:text-red-600"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
              Additional instructions
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe the look — analysis fills this in automatically, then refine it"
              className="w-full resize-y rounded-xl border border-border bg-white p-3 text-sm text-grey-black outline-none placeholder:text-gray-400 focus:border-primary dark:bg-gray-900 dark:text-white"
            />
            <p className="mt-1.5 text-[11px] text-grey3 dark:text-gray-400">
              Saved with the template — customers inherit it as their starting
              instructions.
            </p>
          </div>
        </div>
      )}

      {displayTool === 'colour' && (
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
            <p className="mt-2 text-[11px] text-grey3 dark:text-gray-400">
              Woven into the generation prompt and saved on the template.
            </p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pb-6">
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

      <div className="relative flex min-h-0 flex-1 gap-4">
        {/* ── Canvas ── */}
        <div
          className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-border p-6 pb-24 lg:pb-6"
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
              className="max-h-[48vh] w-auto rounded-xl object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <Sparkles className="mb-3 size-10 text-grey2 dark:text-gray-500" />
              <p className="text-sm font-semibold text-grey-black dark:text-white">
                No imagery yet
              </p>
              <p className="mt-1 max-w-xs text-xs text-grey3 dark:text-gray-400">
                Pick styles from the tools and hit Generate, or upload an image.
              </p>
            </div>
          )}

          {images.length > 0 && (
            <div className="mt-4 flex max-w-full gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <div key={img + i} className="group/thumb relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      'block size-14 cursor-pointer overflow-hidden rounded-lg border-2 transition-transform hover:scale-105',
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

          {/* Generate bar */}
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => canvasInput.current?.click()}
              disabled={uploadingCanvas}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-grey-black transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 dark:bg-card dark:text-white"
            >
              {uploadingCanvas ? (
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
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
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
            ref={canvasInput}
            type="file"
            accept="image/*"
            onChange={handleCanvasUpload}
            className="hidden"
          />

          {/* Mobile floating toolbar — the shop studio's bottom tool row */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-border bg-white p-1.5 shadow-lg dark:bg-card lg:hidden">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const active = openTool === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  title={t.label}
                  onClick={() => setOpenTool(active ? null : t.key)}
                  className={cn(
                    'flex size-10 cursor-pointer items-center justify-center rounded-xl transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-grey3 hover:bg-[#F8F9FA] hover:text-grey-black dark:text-gray-400 dark:hover:bg-muted dark:hover:text-white'
                  )}
                >
                  <Icon className="size-4.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Desktop: toolbar rail + slide-in drawer. Same motion as the
            console's order/profile side sheets: in 0.4s cubic-bezier(0.16,1,
            0.3,1), out 0.25s cubic-bezier(0.4,0,0.2,1). Kept mounted so the
            exit actually animates. ── */}
        <div className="hidden h-full min-h-0 shrink-0 lg:flex lg:gap-3">
          <div
            className="h-full min-h-0 overflow-hidden"
            style={{
              width: openTool ? 380 : 0,
              opacity: openTool ? 1 : 0,
              transform: openTool ? 'translateX(0)' : 'translateX(24px)',
              transition: openTool
                ? 'width 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)'
                : 'width 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
            aria-hidden={!openTool}
          >
            <div className="flex h-full w-[380px] flex-col rounded-xl border border-border bg-white custom-card-shadow dark:bg-card">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <p className="text-sm font-bold uppercase tracking-wide text-grey-black dark:text-white">
                  {openToolMeta?.label}
                </p>
                <button
                  type="button"
                  onClick={() => setOpenTool(null)}
                  className="flex size-7 cursor-pointer items-center justify-center rounded-full text-grey3 transition-colors hover:bg-[#F8F9FA] hover:text-grey-black dark:hover:bg-muted dark:hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{drawerContent}</div>
            </div>
          </div>
          <div className="flex h-fit flex-col gap-1.5 rounded-2xl border border-border bg-white p-1.5 shadow-sm dark:bg-card">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const active = openTool === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  title={t.label}
                  onClick={() => setOpenTool(active ? null : t.key)}
                  className={cn(
                    'flex size-10 cursor-pointer items-center justify-center rounded-xl transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-grey3 hover:bg-[#F8F9FA] hover:text-grey-black dark:text-gray-400 dark:hover:bg-muted dark:hover:text-white'
                  )}
                >
                  <Icon className="size-4.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile: bottom-sheet drawer — the shop studio's sheet motion
          (slide up 0.4s cubic-bezier(0.16,1,0.3,1), settle down on close). ── */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 lg:hidden',
          !openTool && 'pointer-events-none'
        )}
        aria-hidden={!openTool}
      >
        <div
          className="absolute inset-0 -top-[100vh] bg-black/30 transition-opacity duration-300"
          style={{ opacity: openTool ? 1 : 0 }}
          onClick={() => setOpenTool(null)}
        />
        <div
          className="relative flex max-h-[70vh] flex-col rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] dark:bg-card"
          style={{
            transform: openTool ? 'translateY(0)' : 'translateY(110%)',
            transition: openTool
              ? 'transform 0.4s cubic-bezier(0.16,1,0.3,1)'
              : 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          <div className="flex justify-center pt-3">
            <div className="h-[5px] w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="flex items-center justify-between px-5 pb-2 pt-3">
            <p className="text-base font-black uppercase tracking-wide text-grey-black dark:text-white">
              {openToolMeta?.label}
            </p>
            <button
              type="button"
              onClick={() => setOpenTool(null)}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border text-grey3 transition-colors hover:text-grey-black dark:hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-1">
            {drawerContent}
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
