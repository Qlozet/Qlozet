'use client';

import { useRef, useState } from 'react';
import type React from 'react';
import { Upload, X, Layers } from 'lucide-react';

interface DefaultImage {
  url: string;
  /** Local object-URL previews can't be submitted (no upload endpoint yet). */
  isLocal: boolean;
  file?: File;
  hotspots?: any[];
}

interface DefaultImagesUploaderProps {
  images: DefaultImage[];
  onChange: (next: DefaultImage[]) => void;
  onConfigureHotspots?: (index: number) => void;
}

// "Upload Default Images" — one dashed container holding the image thumbnails
// plus an "Add image" cell (file picker, local preview) and an inline
// "Add from URL" entry (hosted images we can actually submit).
export const DefaultImagesUploader = ({
  images,
  onChange,
  onConfigureHotspots,
}: DefaultImagesUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const next = Array.from(e.target.files).map((file) => ({
      url: URL.createObjectURL(file),
      isLocal: true,
      file,
    }));
    onChange([...images, ...next]);
  };

  const addUrl = () => {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    onChange([...images, { url: trimmed, isLocal: false }]);
    setUrlValue('');
    setShowUrlInput(false);
  };

  const removeImage = (index: number) =>
    onChange(images.filter((_, i) => i !== index));

  return (
    <div className="rounded-xl border border-dashed border-input p-4">
      <div className="flex flex-wrap items-stretch gap-4">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="group relative h-[130px] w-[100px] overflow-hidden rounded-lg bg-accent"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
            {onConfigureHotspots && (
              <button
                type="button"
                onClick={() => onConfigureHotspots(index)}
                className="absolute bottom-1 right-1 rounded-md bg-background/80 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100 shadow-sm"
                title="Configure Hotspots"
              >
                <Layers className="size-3.5" />
              </button>
            )}
            {image.hotspots && image.hotspots.length > 0 && (
              <div className="absolute bottom-1 left-1 flex items-center justify-center rounded-md bg-primary/90 px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground shadow-sm">
                {image.hotspots.length} {image.hotspots.length === 1 ? 'hotspot' : 'hotspots'}
              </div>
            )}
          </div>
        ))}

        {/* Add cell */}
        <div className="flex h-[130px] w-[120px] flex-col items-center justify-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Upload className="size-5" />
            <span className="text-sm font-medium text-foreground">Add image</span>
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

      {showUrlInput && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addUrl()}
            placeholder="https://image-url.com/photo.jpg"
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
  );
};

export type { DefaultImage };
