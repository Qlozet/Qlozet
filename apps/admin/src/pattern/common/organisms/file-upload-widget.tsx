'use client';

import { useState, useRef } from 'react';
import type React from 'react';
import { ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadWidgetProps {
  /** Notifies the parent of the current file selection. */
  onFilesChange?: (files: File[]) => void;
}

// Drag-and-drop media uploader. Ported from the vendor app, adapted to the
// admin token set. Accepts images and mp4.
export const FileUploadWidget = ({ onFilesChange }: FileUploadWidgetProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFiles = (next: File[]) => {
    setFiles(next);
    onFilesChange?.(next);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/') || file.type === 'video/mp4'
    );
    updateFiles([...files, ...dropped]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) updateFiles([...files, ...Array.from(e.target.files)]);
  };

  const removeFile = (index: number) =>
    updateFiles(files.filter((_, i) => i !== index));

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors',
          isDragging
            ? 'border-primary bg-accent'
            : 'border-input bg-transparent hover:bg-accent/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,video/mp4"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-brown1">
            <ImageIcon className="size-6 text-primary" />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">
              Drag your images here
            </p>
            <p className="text-xs text-muted-foreground">
              (Only *.jpeg, *.png, *.mp4 be accepted)
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-input bg-accent p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded bg-brown1">
                  <ImageIcon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="rounded p-1 transition-colors hover:bg-brown1"
              >
                <X className="size-4 text-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
