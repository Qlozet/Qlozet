'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import {
  useCreatePlatformStyleMutation,
  useUpdatePlatformStyleMutation,
  type PlatformStyle,
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

interface StyleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit mode; absent → create. */
  style?: PlatformStyle | null;
}

const selectCls =
  'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200';
const labelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300';

export function StyleFormSheet({
  open,
  onOpenChange,
  style,
}: StyleFormSheetProps) {
  const editing = !!style;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [category, setCategory] = useState<StyleCategory>('neckline');
  const [type, setType] = useState<StyleType>('top');
  const [gender, setGender] = useState<StyleGender>('unisex');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploadImage, { isLoading: uploading }] =
    useUploadProductImageMutation();
  const [createStyle, { isLoading: creating }] =
    useCreatePlatformStyleMutation();
  const [updateStyle, { isLoading: updating }] =
    useUpdatePlatformStyleMutation();
  const saving = creating || updating;

  useEffect(() => {
    if (!open) return;
    setName(style?.name ?? '');
    setCode(style?.style_code ?? '');
    setCodeTouched(editing);
    setCategory(style?.category ?? 'neckline');
    setType(style?.type ?? 'top');
    setGender(style?.gender ?? 'unisex');
    setDescription(style?.description ?? '');
    setPrice(
      typeof style?.price_suggestion === 'number' && style.price_suggestion > 0
        ? String(style.price_suggestion)
        : ''
    );
    setImageUrl(style?.image_url ?? '');
  }, [open, style, editing]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const res: any = await uploadImage(file).unwrap();
      const url = res?.url ?? res?.data?.url;
      if (!url) throw new Error('no url');
      setImageUrl(url);
    } catch {
      toast.error('Image upload failed.');
    }
  };

  const submit = async () => {
    if (!name.trim()) return toast.error('Name is required.');
    const style_code = (code.trim() || suggestStyleCode(name)).toUpperCase();
    const payload = {
      name: name.trim(),
      category,
      type,
      gender,
      description: description.trim() || undefined,
      image_url: imageUrl || undefined,
      price_suggestion: price ? Number(price) : undefined,
    };
    try {
      if (editing && style) {
        // style_code is immutable server-side — don't send it on update.
        await updateStyle({ id: style._id, data: payload }).unwrap();
        toast.success('Style updated');
      } else {
        await createStyle({ ...payload, style_code }).unwrap();
        toast.success(
          imageUrl
            ? 'Style created'
            : 'Style created — an image will be generated automatically'
        );
      }
      onOpenChange(false);
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error(
        (Array.isArray(msg) ? msg[0] : msg) || 'Could not save the style.'
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit style' : 'Add style'}</SheetTitle>
          <SheetDescription>
            Platform styles are visible to every vendor&apos;s style library.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          {/* Image */}
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                  No image
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImagePlus className="size-4" />
                )}
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
              {!editing && !imageUrl && (
                <p className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Sparkles className="size-3" /> Left empty, an image is
                  generated from the name &amp; description.
                </p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Name</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!codeTouched) setCode(suggestStyleCode(e.target.value));
              }}
              placeholder="e.g. Deep V-Neck"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              Style code{' '}
              {editing && <span className="text-gray-400">(immutable)</span>}
            </label>
            <Input
              value={code}
              disabled={editing}
              onChange={(e) => {
                setCodeTouched(true);
                setCode(e.target.value.toUpperCase());
              }}
              placeholder="DEEP_V_NECK"
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StyleCategory)}
                className={selectCls}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as StyleType)}
                className={selectCls}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Audience</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as StyleGender)}
                className={selectCls}
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Suggested price (₦)</label>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Shown to vendors; also used to auto-generate the image."
            />
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={saving || uploading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create style'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
