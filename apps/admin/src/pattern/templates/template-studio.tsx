'use client';

// Template Studio — the admin's twin of the shop's bespoke studio.
// Same bones: a dotted canvas with the garment, a floating toolbar of tools,
// and a config DRAWER — a right-hand slide-in on desktop, a bottom sheet on
// mobile (mirroring the shop's MobileBottomSheet). Sections: Basics (gender,
// garment, fit), Styles, Finishing (the shop's embellishment catalogue),
// Photo & Notes (reference upload + AI analysis that suggests a prompt and
// applies matched styles), and Colour. What goes to the generator is built in
// template-request.ts, in step with the shop. Generation + analysis run the
// shared pipelines, free for platform users.

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
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
  Star,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { guardedLeave, useLeaveGuard } from '@/lib/leave-guard';
import { ConfirmActionModal } from '@/pattern/common/organisms/confirm-action-modal';
import {
  useGetBespokeTemplateQuery,
  useCreateBespokeTemplateMutation,
  useUpdateBespokeTemplateMutation,
  useGenerateTemplateOutfitMutation,
  useLazyGetGenerationJobQuery,
  useAnalyzeReferenceMutation,
} from '@/redux/services/bespoke-templates/bespoke-templates.api-slice';
import { useGetAdminStylesQuery } from '@/redux/services/style-library/style-library.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { EMBELLISHMENTS, filterEmbellishments } from './embellishments';
import {
  CATEGORIES,
  COLORS,
  EMPTY_SELECTIONS,
  FIT_OPTIONS,
  buildGenerationRequest,
  colourName,
  genderKeyFor,
  hasOptionalTrousers,
  keepFitting,
  scopeFor,
  styleFits,
  type Gender,
  type SelectionKey,
  type Selections,
} from './template-request';

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

type ToolKey = 'basics' | 'styles' | 'finishing' | 'reference' | 'colour';

const TOOLS: { key: ToolKey; label: string; icon: React.ElementType }[] = [
  { key: 'basics', label: 'Basics', icon: Settings2 },
  { key: 'styles', label: 'Styles', icon: Shirt },
  { key: 'finishing', label: 'Finishing', icon: Gem },
  { key: 'reference', label: 'Photo & Notes', icon: MessageSquare },
  { key: 'colour', label: 'Colour', icon: Palette },
];

const MAX_REFERENCES = 3;
const POLL_MS = 3000;
const POLL_TRIES = 60;
/** Poll requests that may fail in a row (a network blip) before giving up. */
const POLL_MISSES = 3;

class Cancelled extends Error {}

const jobIdOf = (res: any): string | undefined =>
  res?.data?.jobId ?? res?.jobId ?? res?.data?.job_id;

function StudioInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The id the studio opened with. After the first save of a new template
  // the studio keeps going on the saved one (currentId), without reloading.
  const [initialId] = useState(() => searchParams.get('id'));
  const [currentId, setCurrentId] = useState<string | null>(initialId);
  // False while an existing template is still loading.
  const [hydrated, setHydrated] = useState(!initialId);

  // ── Template state ──
  const [name, setName] = useState('Untitled Template');
  const [gender, setGender] = useState<Gender>('women');
  const [category, setCategory] = useState('Dresses');
  const [withTrousers, setWithTrousers] = useState(true);
  const [fit, setFit] = useState<string | null>(null);
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive');
  const [images, setImages] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [references, setReferences] = useState<string[]>([]);
  const [selections, setSelections] = useState<Selections>(EMPTY_SELECTIONS);
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

  // ── Unsaved changes ──
  // Everything Save writes. The studio is "dirty" when it differs from what
  // was last loaded or saved.
  const snapshot = JSON.stringify({
    name,
    gender,
    category,
    withTrousers,
    fit,
    status,
    images,
    references,
    selections,
    embellishments,
    color,
    prompt,
  });
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  // Set when the state was just loaded or saved: the next render's snapshot
  // becomes the clean one.
  const markClean = useRef(!initialId);
  useEffect(() => {
    if (!markClean.current) return;
    markClean.current = false;
    setSavedSnapshot(snapshot);
    // hydrated: a loaded template identical to the defaults still counts.
  }, [snapshot, hydrated]);
  const dirty = savedSnapshot !== null && snapshot !== savedSnapshot;

  useLeaveGuard(true, dirty, (go) => {
    NiceModal.show(ConfirmActionModal, {
      title: 'Leave without saving?',
      description:
        'Your changes to this template, including any images you generated, will be lost.',
      confirmLabel: 'Leave',
      destructive: true,
      onConfirm: go,
    });
  });

  // Polls and analyses stop touching state once the studio is gone.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // ── Load when editing ──
  const {
    data: existing,
    isError: loadFailed,
    refetch: retryLoad,
  } = useGetBespokeTemplateQuery(initialId ?? '', { skip: !initialId });
  useEffect(() => {
    const t = existing?.data;
    if (!t || hydrated) return;
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
        if (sel.fit) setFit(sel.fit);
        if (typeof sel.with_trousers === 'boolean')
          setWithTrousers(sel.with_trousers);
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
    markClean.current = true;
    setHydrated(true);
  }, [existing, hydrated]);

  // ── Style library ──
  const { data: styleData } = useGetAdminStylesQuery({ scope: 'platform' });
  const allStyles = useMemo(() => styleData?.styles ?? [], [styleData]);

  const garmentScope = scopeFor(category);
  const genderKey = genderKeyFor(gender);

  const sectionStyles = useMemo(
    () =>
      allStyles.filter(
        (s) =>
          s.category === styleSection && styleFits(s, genderKey, garmentScope)
      ),
    [allStyles, styleSection, genderKey, garmentScope]
  );

  const availableEmbellishments = useMemo(
    () => filterEmbellishments(garmentScope, genderKey),
    [garmentScope, genderKey]
  );

  // Switching gender or garment keeps the picks that still suit it, and
  // says which ones it dropped.
  const changeGarment = (nextGender: Gender, nextCategory: string) => {
    const kept = keepFitting(
      selections,
      embellishments,
      allStyles,
      genderKeyFor(nextGender),
      scopeFor(nextCategory)
    );
    setGender(nextGender);
    setCategory(nextCategory);
    setSelections(kept.selections);
    setEmbellishments(kept.embellishments);
    if (kept.dropped.length)
      toast(`Removed what doesn't suit ${nextCategory.toLowerCase()}`, {
        description: kept.dropped.join(', '),
      });
  };

  // ── Job polling (shared by generate + analyze) ──
  const [pollJob] = useLazyGetGenerationJobQuery();
  const waitForJob = async (jobId: string): Promise<any> => {
    let misses = 0;
    for (let attempt = 0; attempt < POLL_TRIES; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      if (!alive.current) throw new Cancelled();
      let job: any;
      try {
        const jobRes = await pollJob(jobId).unwrap();
        job = (jobRes as any)?.data ?? jobRes;
        misses = 0;
      } catch {
        // One failed check isn't a failed job: keep asking a few times.
        if (++misses >= POLL_MISSES)
          throw new Error('Lost touch with the AI job. Check your connection.');
        continue;
      }
      if (job?.status === 'completed') return job.result ?? {};
      if (job?.status === 'failed') {
        const err = new Error('The AI could not finish this one.');
        (err as any).detail = job?.error;
        throw err;
      }
    }
    throw new Error('The AI took too long. Try again.');
  };

  const showJobError = (title: string, err: any) => {
    if (err instanceof Cancelled) return;
    const detail =
      typeof err?.detail === 'string' ? err.detail.slice(0, 160) : undefined;
    toast.error(title, {
      description: [err?.message, detail].filter(Boolean).join(' '),
    });
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
      const { config, userPrompt } = buildGenerationRequest({
        gender,
        category,
        withTrousers,
        selections,
        styles: allStyles,
        embellishments,
        color,
        fit,
        prompt,
      });
      const res = await generate({
        config,
        userPrompt,
        reference_image_urls: references.length ? references : undefined,
      }).unwrap();
      const jobId = jobIdOf(res);
      if (!jobId) throw new Error('The AI did not take the job. Try again.');

      setGenStatus('AI is drawing the garment…');
      const result = await waitForJob(jobId);
      const url = result?.image_url ?? result?.fileUrl;
      if (!url) throw new Error('The AI finished without an image.');
      if (!alive.current) return;
      setImages((prev) => {
        const next = [...prev, url];
        setActiveIdx(next.length - 1);
        return next;
      });
    } catch (err: any) {
      showJobError('Generation failed', err);
    } finally {
      if (alive.current) {
        setGenStatus(null);
        setGenerating(false);
      }
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
      const jobId = jobIdOf(res);
      if (!jobId) throw new Error('The AI did not take the job.');
      const result = await waitForJob(jobId);
      if (!alive.current) return;

      // Apply the matched platform styles that suit this garment. A match
      // without a library id can't be used for generation, so it's skipped.
      const matched = result?.matched_styles ?? {};
      const applied: string[] = [];
      const updates: Partial<Selections> = {};
      for (const key of [
        'silhouette',
        'neckline',
        'sleeve',
        'collar',
      ] as SelectionKey[]) {
        const style = allStyles.find((s) => s._id === matched[key]?.style_id);
        if (!style || !styleFits(style, genderKey, garmentScope)) continue;
        updates[key] = style._id;
        applied.push(style.name);
      }
      if (applied.length) setSelections((prev) => ({ ...prev, ...updates }));

      // Fill an empty description; never overwrite what the admin wrote.
      const suggestion: string | undefined = result?.suggested_prompt;
      let promptNote = '';
      if (suggestion) {
        if (!prompt.trim()) {
          setPrompt(suggestion);
          promptNote = 'Description filled in from the photo.';
        } else {
          toast('The AI suggested a description', {
            description: suggestion.slice(0, 140),
            duration: 15000,
            action: {
              label: 'Use it',
              onClick: () => setPrompt(suggestion),
            },
          });
        }
      }
      toast.success(
        applied.length ? `Styles applied: ${applied.join(', ')}` : 'Photo read',
        promptNote ? { description: promptNote } : undefined
      );
    } catch (err: any) {
      showJobError('Could not read the photo. It was still kept.', err);
    } finally {
      if (alive.current) setAnalyzing(false);
    }
  };

  const addReference = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/'))
      return toast.error('That file is not an image.');
    if (references.length >= MAX_REFERENCES)
      return toast.error(`Up to ${MAX_REFERENCES} reference photos.`);
    try {
      const res = await uploadImage(file).unwrap();
      const url = (res as any)?.data?.url ?? (res as any)?.url;
      if (!url) throw new Error('Upload returned no URL');
      setReferences((prev) => [...prev, url].slice(0, MAX_REFERENCES));
      void runAnalyze(url);
    } catch (err: any) {
      toast.error('Reference upload failed.', {
        description: err?.data?.message ?? err?.message,
      });
    }
  };

  const [dragOver, setDragOver] = useState(false);

  // ── Canvas images ──
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
    } catch (err: any) {
      toast.error('Image upload failed.', {
        description: err?.data?.message ?? err?.message,
      });
    } finally {
      setUploadingCanvas(false);
    }
  };

  const removeImage = (i: number) => {
    const before = images;
    const beforeIdx = activeIdx;
    setImages(before.filter((_, x) => x !== i));
    setActiveIdx((idx) => Math.max(0, idx - (i <= idx ? 1 : 0)));
    toast('Image removed', {
      action: {
        label: 'Undo',
        onClick: () => {
          setImages(before);
          setActiveIdx(beforeIdx);
        },
      },
    });
  };

  // The first image is the cover customers see (the shop opens on it too).
  const makeCover = (i: number) => {
    setImages((prev) => [prev[i], ...prev.filter((_, x) => x !== i)]);
    setActiveIdx(0);
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
        ...(fit && { fit }),
        ...(hasOptionalTrousers(category) && { with_trousers: withTrousers }),
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
      if (currentId) {
        await updateTemplate({ id: currentId, data: payload }).unwrap();
        toast.success('Changes saved');
      } else {
        const res = await createTemplate(payload).unwrap();
        const id = (res as any)?.data?._id;
        if (id) {
          setCurrentId(id);
          // Keep the address in step so a refresh reopens this template.
          const url = new URL(window.location.href);
          url.searchParams.set('id', id);
          window.history.replaceState(window.history.state, '', url.href);
        }
        toast.success('Template created');
      }
      setSavedSnapshot(snapshot);
    } catch (err: any) {
      toast.error('Could not save the template.', {
        description: err?.data?.message ?? err?.message,
      });
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
                  onClick={() =>
                    g !== gender && changeGarment(g, CATEGORIES[g][0])
                  }
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
                  onClick={() => c !== category && changeGarment(gender, c)}
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

          {hasOptionalTrousers(category) && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
                Trousers
              </p>
              <div className="flex gap-2">
                {[
                  { on: true, label: 'With trousers' },
                  { on: false, label: 'Without' },
                ].map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setWithTrousers(o.on)}
                    className={cn(
                      'flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-medium transition-all hover:shadow-md',
                      withTrousers === o.on
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-grey3 hover:text-grey-black dark:text-gray-400 dark:hover:text-white'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey3 dark:text-gray-400">
              Fit
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FIT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFit(fit === f.id ? null : f.id)}
                  className={cn(
                    'cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-all hover:shadow-md',
                    fit === f.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-grey-black dark:text-white'
                  )}
                >
                  <span className="block text-xs font-semibold">{f.label}</span>
                  <span
                    className={cn(
                      'mt-0.5 block text-[11px]',
                      fit === f.id
                        ? 'text-primary-foreground/80'
                        : 'text-grey3 dark:text-gray-400'
                    )}
                  >
                    {f.desc}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-grey3 dark:text-gray-400">
              Optional. Customers start from this fit.
            </p>
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
              !uploading &&
              references.length < MAX_REFERENCES &&
              refInput.current?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (!uploading) void addReference(e.dataTransfer.files?.[0]);
            }}
            disabled={uploading || references.length >= MAX_REFERENCES}
            className={cn(
              'flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-[#F8F9FA] px-4 py-7 transition-colors hover:border-primary dark:bg-muted',
              dragOver && 'border-primary',
              (uploading || references.length >= MAX_REFERENCES) &&
                'cursor-not-allowed opacity-50'
            )}
          >
            {uploading ? (
              <Loader2 className="mb-2 size-6 animate-spin text-grey3" />
            ) : (
              <Upload className="mb-2 size-6 text-grey3 dark:text-gray-400" />
            )}
            <span className="text-xs font-semibold text-grey-black dark:text-white">
              {references.length >= MAX_REFERENCES
                ? `Up to ${MAX_REFERENCES} reference photos`
                : 'Drop a reference photo or choose a file'}
            </span>
            <span className="mt-1 text-[10px] text-grey3 dark:text-gray-400">
              PNG, JPG · {references.length}/{MAX_REFERENCES} · the AI picks out
              its styles
            </span>
          </button>
          <input
            ref={refInput}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              void addReference(file);
            }}
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
                  <p className="flex items-center gap-1 text-[10px] text-grey3 dark:text-gray-400">
                    <Check className="size-3" /> Sent with each generation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setReferences((prev) => prev.filter((_, x) => x !== idx))
                }
                aria-label={`Remove reference ${idx + 1}`}
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
              placeholder="Describe the look. A reference photo fills this in when it's empty."
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
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(color === c.hex ? null : c.hex)}
                  className={cn(
                    'size-9 cursor-pointer rounded-full border-2 transition-transform hover:scale-110',
                    color === c.hex
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-border'
                  )}
                  style={{ background: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={color === c.hex}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-grey3 dark:text-gray-400">
              {color ? (
                <>
                  <span className="font-semibold capitalize text-grey-black dark:text-white">
                    {colourName(color)}
                  </span>{' '}
                  · told to the AI and saved on the template.
                </>
              ) : (
                'Told to the AI by name and saved on the template.'
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        {loadFailed ? (
          <>
            <p className="text-sm font-semibold text-grey-black dark:text-white">
              Could not open this template.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push(APP_ROUTES.productsTemplates)}
                className="h-9 cursor-pointer rounded-lg border border-border px-4 text-sm font-medium text-grey-black dark:text-white"
              >
                Back to templates
              </button>
              <button
                type="button"
                onClick={() => void retryLoad()}
                className="h-9 cursor-pointer rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Try again
              </button>
            </div>
          </>
        ) : (
          <p className="flex items-center text-sm text-grey3 dark:text-gray-400">
            <Loader2 className="mr-2 size-4 animate-spin" /> Opening template…
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pb-6">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            guardedLeave(() => router.push(APP_ROUTES.productsTemplates))
          }
          aria-label="Back to templates"
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
          disabled={saving || (!!currentId && !dirty)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            currentId && !dirty && <Check className="size-4" />
          )}
          {!currentId ? 'Create template' : dirty ? 'Save changes' : 'Saved'}
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
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={name}
                className="max-h-[48vh] w-auto rounded-xl object-contain"
              />
              {activeIdx === 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <Star className="size-3" /> Cover · customers see this first
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(activeIdx)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-grey-black transition-colors hover:border-primary dark:bg-card dark:text-white"
                >
                  <Star className="size-3" /> Set as cover
                </button>
              )}
            </div>
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
                    aria-label={i === 0 ? 'Cover image' : `Image ${i + 1}`}
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
                  {i === 0 && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-black/55 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label={`Remove image ${i + 1}`}
                    className="absolute -right-1.5 -top-1.5 hidden size-5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white group-hover/thumb:flex [@media(hover:none)]:flex"
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
              disabled={generating || analyzing}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {generating || analyzing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {generating
                ? (genStatus ?? 'Generating…')
                : analyzing
                  ? 'Reading your photo…'
                  : 'Generate'}
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
                  aria-label={t.label}
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
                  aria-label={t.label}
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
