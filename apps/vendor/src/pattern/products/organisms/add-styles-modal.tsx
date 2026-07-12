'use client';

import { useRef, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Camera, Plus, Trash2, Sparkles, Loader2, Info, Upload, X } from 'lucide-react';
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
import { useCreateVendorStyleMutation, useGenerateStyleImageMutation } from '@/redux/services/style-library/style-library.api-slice';

export interface CreatedStyle {
  id?: string;
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

const STYLE_TYPES = [
  'Neckline',
  'Sleeve',
  'Collar',
  'Skirt',
  'Trouser',
  'Full Body',
  'Bodice',
  'Hemline',
  'Back',
];

// "Add Styles" — two-panel modal (form + image preview). Resolves with the new
// style, or null if cancelled.
export const AddStylesModal = NiceModal.create(() => {
  const modal = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [styleCode, setStyleCode] = useState('');
  const [audience, setAudience] = useState<'men' | 'women'>('men');
  const [categories, setCategories] = useState<string[]>([]);
  const [styleType, setStyleType] = useState('Neckline');
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  const [createVendorStyle, { isLoading: isCreating }] = useCreateVendorStyleMutation();
  const [generateStyleImage, { isLoading: isGenerating }] = useGenerateStyleImageMutation();

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

  const handleGenerateAI = async () => {
    if (!name.trim()) {
      toast.error('Please enter a style name first to guide the AI.');
      return;
    }
    try {
      const res = await generateStyleImage({
        name: name.trim(),
        category: styleType.toLowerCase().replace(' ', '_'),
        description: description.trim() || undefined,
      }).unwrap();
      setImageUrl(res.url);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to generate AI image');
    }
  };

  const upload = async () => {
    if (!name.trim()) {
      toast.error('Please enter a style name.');
      return;
    }
    
    try {
      let mappedType = 'top';
      const cat = categories[0]?.toLowerCase();
      if (['bottoms', 'skirt'].includes(cat)) mappedType = 'bottom';
      else if (['dresses', 'outwear', 'traditional', 'kaftan'].includes(cat)) mappedType = 'full_body';

      // Save it to the vendor's library first
      const res = await createVendorStyle({
        name: name.trim(),
        style_code: styleCode.trim() || `STY-${Date.now()}`,
        category: styleType.toLowerCase().replace(' ', '_'),
        type: mappedType,
        description: description.trim() || undefined,
        gender: audience === 'men' ? 'male' : 'female',
        image_url: imageUrl ?? undefined,
        attributes: tags,
      }).unwrap();

      modal.resolve({
        id: res._id,
        name: res.name,
        styleCode: res.style_code,
        audience,
        categories,
        styleType: res.category,
        tags: res.attributes || [],
        imageUrl: res.image_url,
      } satisfies CreatedStyle);
      modal.remove();
      toast.success('Style successfully added to your library!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload style.');
    }
  };

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && cancel()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden sm:rounded-[16px]">
        <div className="grid max-h-[90vh] w-full grid-cols-1 overflow-y-auto sm:rounded-[16px] md:grid-cols-2 md:overflow-hidden">
        {/* Left: form */}
        <div className="space-y-4 p-6 bg-card md:overflow-y-auto custom-scrollbar">
          <DialogTitle className="text-xl font-semibold text-grey-black dark:text-white">
            Add Styles
          </DialogTitle>

          <div>
            <FieldLabel htmlFor="style-name">Style name</FieldLabel>
            <Input
              id="style-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Round Neck"
              className="bg-background dark:bg-muted dark:border-white/10"
            />
          </div>

          <div>
            <FieldLabel htmlFor="style-description">Style description</FieldLabel>
            <textarea
              id="style-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this style... (helps AI generate a better image!)"
              className="flex min-h-[80px] w-full rounded-md border border-input dark:border-white/10 bg-background dark:bg-muted dark:text-gray-200 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <FieldLabel htmlFor="style-code">
              Style Code (Optional)
            </FieldLabel>
            <Input
              id="style-code"
              value={styleCode}
              onChange={(e) => setStyleCode(e.target.value)}
              placeholder="BTM-WLP01"
              className="bg-background dark:bg-muted dark:border-white/10"
            />
          </div>

          <div>
            <FieldLabel tooltip="Target audience">Audience</FieldLabel>
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as 'men' | 'women')}
            >
              <SelectTrigger className="w-full bg-background dark:bg-muted dark:border-white/10 capitalize">
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
              <SelectTrigger className="w-full bg-background dark:bg-muted dark:border-white/10">
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
            disabled={isCreating}
            className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            {isCreating && <Loader2 className="size-4 animate-spin" />}
            Upload Style
          </button>
        </div>

        {/* Right: preview */}
        <div className="relative space-y-4 md:overflow-y-auto h-full bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-6 custom-scrollbar">

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
              <div className="flex w-[240px] flex-col items-center gap-2 rounded-lg border border-dashed border-input p-4 mx-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  Change image
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">or</span>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-sm font-medium text-[#2F80ED] hover:underline"
                  >
                    {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    Regenerate with AI
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-input p-6 text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Upload className="size-6" />
                <span className="text-sm font-medium text-foreground">
                  Upload image or sketch
                </span>
              </button>

              <div className="flex w-full items-center gap-4 py-2 opacity-50">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase text-muted-foreground">Or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 w-full max-w-[200px] h-10 rounded-md bg-accent text-sm font-medium hover:bg-accent/80 transition-colors border border-border"
              >
                {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-[#2F80ED]" />}
                Generate with AI
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput((s) => !s)}
                className="mt-2 text-sm font-medium text-[#2F80ED] hover:underline"
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
    </DialogContent>
  </Dialog>
);
});
