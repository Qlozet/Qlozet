'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { APP_ROUTES } from '@/lib/routes';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import {
  useGetPlatformCollectionsAdminQuery,
  useCreatePlatformCollectionMutation,
  useUpdatePlatformCollectionMutation,
  type CollectionCondition,
  type CollectionConditionOperator,
} from '@/redux/services/collections/collections.api-slice';
import {
  CONDITION_FIELD_OPTIONS,
  CONDITION_OPERATOR_OPTIONS,
  KIND_OPTIONS,
} from '../lib/collection-condition-options';

const selectCls =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-primary';
const cardCls =
  'rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900';
const labelCls =
  'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

const emptyCondition = (): CollectionCondition => ({
  field: 'clothing.taxonomy.product_type',
  operator: 'is_equal_to',
  value: '',
});

export default function CollectionsCreateTemplate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') ?? undefined;
  const isEditing = !!editId;

  const { data: listData } = useGetPlatformCollectionsAdminQuery();
  const [createCollection, { isLoading: creating }] =
    useCreatePlatformCollectionMutation();
  const [updateCollection, { isLoading: updating }] =
    useUpdatePlatformCollectionMutation();
  const [uploadImage, { isLoading: uploading }] =
    useUploadProductImageMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [conditionMatch, setConditionMatch] = useState<'all' | 'any'>('all');
  const [conditions, setConditions] = useState<CollectionCondition[]>([
    emptyCondition(),
  ]);
  const [kinds, setKinds] = useState<string[]>([]);
  const [productTypesText, setProductTypesText] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Prefill once when editing (find in the admin list, which includes inactive).
  const prefilled = useRef(false);
  useEffect(() => {
    if (!isEditing || prefilled.current) return;
    const c = listData?.data?.find((x) => x._id === editId);
    if (!c) return;
    prefilled.current = true;
    setTitle(c.title ?? '');
    setDescription(c.description ?? '');
    setSlug(c.slug ?? '');
    setSortOrder(String(c.sort_order ?? 0));
    setIsActive(c.is_active ?? true);
    setConditionMatch(c.condition_match ?? 'all');
    setConditions(c.conditions?.length ? c.conditions : [emptyCondition()]);
    setKinds(c.kinds ?? []);
    setProductTypesText((c.product_types ?? []).join(', '));
    setCoverImage(c.cover_image ?? '');
  }, [isEditing, editId, listData]);

  const setCondition = (i: number, patch: Partial<CollectionCondition>) =>
    setConditions((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    );
  const addCondition = () =>
    setConditions((prev) => [...prev, emptyCondition()]);
  const removeCondition = (i: number) =>
    setConditions((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev
    );

  const toggleKind = (k: string) =>
    setKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );

  const handleFile = async (file: File) => {
    try {
      const res = (await uploadImage(file).unwrap()) as {
        url?: string;
        data?: { url?: string };
      };
      const url = res?.url ?? res?.data?.url;
      if (url) setCoverImage(url);
      else toast.error('Upload returned no URL.');
    } catch {
      toast.error('Image upload failed.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a collection title.');
      return;
    }
    const cleanConditions = conditions.filter(
      (c) => c.field && c.operator && String(c.value).trim()
    );
    if (cleanConditions.length === 0) {
      toast.error('Add at least one complete condition.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      condition_match: conditionMatch,
      conditions: cleanConditions,
      is_active: isActive,
      slug: slug.trim() || undefined,
      sort_order: Number(sortOrder) || 0,
      cover_image: coverImage || undefined,
      kinds,
      product_types: productTypesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing && editId) {
        await updateCollection({ id: editId, ...payload }).unwrap();
        toast.success('Collection updated');
      } else {
        await createCollection(payload).unwrap();
        toast.success('Collection created');
      }
      router.push(APP_ROUTES.productsCollections);
    } catch {
      toast.error('Could not save the collection.');
    }
  };

  const saving = creating || updating;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <button
        type="button"
        onClick={() => router.push(APP_ROUTES.productsCollections)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
      >
        <ArrowLeft className="size-4" />
        Back to Collections
      </button>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        {isEditing ? 'Edit collection' : 'Create collection'}
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Details */}
          <div className={cardCls}>
            <label className={labelCls}>Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Owambe Season"
            />
            <label className={`${labelCls} mt-4`}>Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this collection is about (optional)"
              rows={3}
            />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Slug (optional)</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="owambe-season"
                />
              </div>
              <div>
                <label className={labelCls}>Sort order</label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className={cardCls}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Product conditions
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={conditionMatch === 'all'}
                    onChange={() => setConditionMatch('all')}
                  />
                  All conditions
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={conditionMatch === 'any'}
                    onChange={() => setConditionMatch('any')}
                  />
                  Any condition
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {conditions.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <select
                      className={selectCls}
                      value={c.field}
                      onChange={(e) =>
                        setCondition(i, { field: e.target.value })
                      }
                    >
                      {CONDITION_FIELD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className={selectCls}
                      value={c.operator}
                      onChange={(e) =>
                        setCondition(i, {
                          operator: e.target
                            .value as CollectionConditionOperator,
                        })
                      }
                    >
                      {CONDITION_OPERATOR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={c.value}
                      onChange={(e) =>
                        setCondition(i, { value: e.target.value })
                      }
                      placeholder="value"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCondition(i)}
                    disabled={conditions.length === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-500 disabled:opacity-40 dark:hover:bg-gray-800"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCondition}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
            >
              <Plus className="size-4" />
              Add condition
            </button>
          </div>

          {/* Explore scope */}
          <div className={cardCls}>
            <h3 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Explore scope
            </h3>
            <p className="mb-3 text-xs text-gray-500">
              Which explore pages this collection shows on. Leave empty to show
              on every explore page.
            </p>
            <label className={labelCls}>Kinds</label>
            <div className="flex flex-wrap gap-2">
              {KIND_OPTIONS.map((k) => {
                const active = kinds.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleKind(k)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                      active
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
            <label className={`${labelCls} mt-4`}>
              Product types (comma-separated)
            </label>
            <Input
              value={productTypesText}
              onChange={(e) => setProductTypesText(e.target.value)}
              placeholder="agbada, kaftan, dress"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className={cardCls}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Status
                </h3>
                <p className="text-xs text-gray-500">
                  {isActive
                    ? 'Active — visible on explore'
                    : 'Inactive — hidden'}
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <div className={cardCls}>
            <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Cover image
            </h3>
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt="cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus className="size-6 text-gray-400" />
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              )}
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:opacity-80">
              <ImagePlus className="size-4" />
              {coverImage ? 'Replace image' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Save changes' : 'Create collection'}
            </button>
            <button
              type="button"
              onClick={() => router.push(APP_ROUTES.productsCollections)}
              className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
