'use client';

import { useRef, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Info, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MultiSelectTagsDropdown,
  type TagGroup,
} from '@/pattern/common/organisms/multi-select-tag-dropdown';
import { FieldLabel } from '../atoms/field-label';

export interface CreatedStyle {
  name: string;
  styleCode?: string;
  audience: 'men' | 'women';
  categories: string[];
  styleType: string;
  tags: string[];
  imageUrl?: string;
}

const CATEGORY_GROUPS: TagGroup[] = [
  {
    label: 'Clothing Category',
    tags: [
      { value: 'tops', label: 'Tops' },
      { value: 'dresses', label: 'Dresses' },
      { value: 'bottoms', label: 'Bottoms' },
      { value: 'skirt', label: 'Skirt' },
      { value: 'outwear', label: 'Outwear' },
      { value: 'traditional', label: 'Traditional' },
      { value: 'kaftan', label: 'Kaftan' },
      { value: 'shirt', label: 'Shirt' },
    ],
  },
];

const TAG_GROUPS: TagGroup[] = [
  {
    label: 'Gender',
    tags: [
      { value: 'men', label: 'Men' },
      { value: 'women', label: 'Women' },
    ],
  },
  {
    label: 'Fit',
    tags: [
      { value: 'slim-fit', label: 'Slim-fit' },
      { value: 'regular', label: 'Regular' },
      { value: 'relaxed', label: 'Relaxed' },
    ],
  },
  {
    label: 'Occasion',
    tags: [
      { value: 'casual', label: 'Casual' },
      { value: 'formal', label: 'Formal' },
      { value: 'minimalistic', label: 'Minimalistic' },
      { value: 'bridal', label: 'Bridal' },
    ],
  },
];

const STYLE_TYPES = ['Neckline', 'Sleeve', 'Hemline', 'Collar', 'Fit', 'Waistline'];

// "Add Styles" — two-panel modal (form + image preview). Resolves with the new
// style, or null if cancelled.
export const AddStylesModal = NiceModal.create(() => {
  const modal = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [styleCode, setStyleCode] = useState('');
  const [audience, setAudience] = useState<'men' | 'women'>('men');
  const [categories, setCategories] = useState<string[]>([]);
  const [styleType, setStyleType] = useState('Neckline');
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  if (!modal.visible) return null;

  const cancel = () => {
    modal.resolve(null);
    modal.remove();
  };

  const handleFile = (file?: File) => {
    if (file) setImageUrl(URL.createObjectURL(file));
  };

  const addUrl = () => {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    setImageUrl(trimmed);
    setUrlValue('');
    setShowUrlInput(false);
  };

  const upload = () => {
    if (!name.trim()) {
      toast.error('Please enter a style name.');
      return;
    }
    modal.resolve({
      name: name.trim(),
      styleCode: styleCode.trim() || undefined,
      audience,
      categories,
      styleType,
      tags,
      imageUrl: imageUrl ?? undefined,
    } satisfies CreatedStyle);
    modal.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={cancel}
    >
      <div
        className="grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-card shadow-xl md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: form */}
        <div className="space-y-4 overflow-y-auto p-6">
          <h2 className="text-xl font-semibold text-grey-black dark:text-white">
            Add Styles
          </h2>

          <div>
            <FieldLabel htmlFor="style-name">Style name</FieldLabel>
            <Input
              id="style-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Round Neck"
              className="bg-background"
            />
          </div>

          <div>
            <FieldLabel htmlFor="style-code">Style-code</FieldLabel>
            <Input
              id="style-code"
              value={styleCode}
              onChange={(e) => setStyleCode(e.target.value)}
              placeholder="BTM-WLP01"
              className="bg-background"
            />
          </div>

          <div>
            <FieldLabel tooltip="Target audience">Audience</FieldLabel>
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as 'men' | 'women')}
            >
              <SelectTrigger className="w-full bg-background capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <FieldLabel tooltip="Applicable clothing categories">
              Clothing Category
            </FieldLabel>
            <MultiSelectTagsDropdown
              placeholder="Select categories"
              groups={CATEGORY_GROUPS}
              value={categories}
              onChange={setCategories}
            />
          </div>

          <div>
            <FieldLabel tooltip="What this style modifies">
              Style Option Type
            </FieldLabel>
            <Select value={styleType} onValueChange={setStyleType}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <FieldLabel tooltip="Descriptive tags">Tags</FieldLabel>
            <MultiSelectTagsDropdown
              placeholder="Select tags"
              groups={TAG_GROUPS}
              value={tags}
              onChange={setTags}
            />
          </div>

          <button
            type="button"
            onClick={upload}
            className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Upload Style
          </button>
        </div>

        {/* Right: preview */}
        <div className="relative space-y-4 overflow-y-auto bg-accent/40 p-6">
          <button
            type="button"
            onClick={cancel}
            className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <h2 className="text-xl font-semibold text-grey-black dark:text-white">
            Preview
          </h2>

          <div className="flex items-center gap-3 rounded-lg bg-[hsla(27,97%,12%,0.06)] p-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Info className="size-4" />
            </span>
            <p className="text-sm text-grey-black dark:text-white">
              Provide a clear visual example of the style (e.g. sketches, photos,
              or diagrams)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />

          {imageUrl ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Style preview"
                  className="max-h-72 w-full object-contain"
                />
              </div>
              <div className="flex w-[160px] flex-col items-center gap-1.5 rounded-lg border border-dashed border-input p-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Upload className="size-5" />
                  <span className="text-sm font-medium text-foreground">
                    Add image
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput((s) => !s)}
                  className="text-sm font-medium text-[#2F80ED] hover:underline"
                >
                  Add from URL
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input p-6 text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Upload className="size-6" />
                <span className="text-sm font-medium text-foreground">
                  Add image or sketch
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput((s) => !s)}
                className="text-sm font-medium text-[#2F80ED] hover:underline"
              >
                Add from URL
              </button>
            </div>
          )}

          {showUrlInput && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                placeholder="https://image-url.com/style.jpg"
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={addUrl}
                className="h-9 rounded-md bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
