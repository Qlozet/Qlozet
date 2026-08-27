'use client';

import { useEffect, useRef, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { Download, FileText, Loader2, Pencil, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadFile, filenameFromUrl } from '@/lib/download-file';
import { readApiError } from '@/redux/services/types';
import { useUploadProfileImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import {
  useUpdateVendorProfileMutation,
  type AdminVendorUpdate,
} from '@/redux/services/vendor-details/vendor-details.api-slice';

/** 5 MB — the cap the upload endpoint enforces. */
const MAX_BYTES = 5 * 1024 * 1024;

export interface VendorDocumentModalProps {
  /** e.g. "PNG Logo" or "CAC Document". */
  kind: string;
  /** Vendor/business name, appended to the title. */
  vendorName?: string;
  /** Resolved file URL; undefined when nothing has been uploaded. */
  url?: string;
  /** Label for the download button, e.g. "Download Logo". */
  downloadLabel?: string;
  /** Business to write to. Without it the modal stays read-only. */
  businessId?: string;
  /**
   * Which field the replacement URL is saved to. `cac_document_url` is a list
   * on the record, so it is sent as one.
   */
  field?: 'business_logo_url' | 'business_logo_svg_url' | 'cac_document_url';
  /** Prompt shown inside the empty dropzone, e.g. "Upload PNG Image". */
  uploadLabel?: string;
  /** What the picker will accept. Defaults to images. */
  accept?: string;
}

const isPdf = (url: string) => /\.pdf(\?|#|$)/i.test(url);

/**
 * Vendor document viewer (company logo, CAC certificate).
 *
 * Two modes: view — preview plus download — and edit, reached through the
 * pencil, which swaps the preview for a dropzone and a Save.
 *
 * Saving takes two calls against endpoints that already existed: POST
 * /uploads/profile for the file, then PATCH /admin/businesses/:id to attach the
 * returned URL. The second is what used to be missing — the admin DTO allowed
 * only the logo and cover, so a CAC certificate could be read but never
 * attached, and this modal was view-only as a result.
 */
export const VendorDocumentModal = create(
  ({
    kind,
    vendorName,
    url,
    downloadLabel,
    businessId,
    field,
    uploadLabel,
    accept = 'image/*',
  }: VendorDocumentModalProps) => {
    const modal = useModal();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [upload] = useUploadProfileImageMutation();
    const [updateVendor] = useUpdateVendorProfileMutation();

    // Editing is only offered when there is somewhere to write the result.
    const canEdit = Boolean(businessId && field);
    // A vendor with nothing on file opens straight into the dropzone — there is
    // no preview to show, and uploading is the only thing left to do.
    const [editing, setEditing] = useState(canEdit && !url);

    // The object URL is what the <img> is reading; revoking it on unmount only.
    useEffect(() => {
      if (!file) {
        setPreview(null);
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    if (!modal.visible) return null;

    const close = () => modal.remove();
    const title = vendorName ? `${kind} - ${vendorName}` : kind;

    const handleDownload = async () => {
      if (!url) return;
      setIsDownloading(true);
      const name = filenameFromUrl(
        url,
        `${(vendorName ?? 'vendor').replace(/\s+/g, '-').toLowerCase()}-${kind
          .replace(/\s+/g, '-')
          .toLowerCase()}`
      );
      const ok = await downloadFile(url, name);
      setIsDownloading(false);
      if (!ok) {
        toast.error(
          'Could not download the file. Allow pop-ups for this site and try again.'
        );
      }
    };

    const handlePick = (picked?: File) => {
      if (!picked) return;
      if (picked.size > MAX_BYTES) {
        toast.error('That file is over 5MB. Choose a smaller one.');
        return;
      }
      setFile(picked);
      // Clear the input so re-picking the same file fires change again.
      if (inputRef.current) inputRef.current.value = '';
    };

    const handleSave = async () => {
      if (!file || !businessId || !field) return;
      setSaving(true);
      try {
        const uploaded = await upload(file).unwrap();
        const uploadedUrl = uploaded?.data?.url;
        if (!uploadedUrl) {
          // Saving an empty string here would wipe whatever is already on file.
          toast.error('The upload returned no URL. Nothing was changed.');
          return;
        }
        const patch: AdminVendorUpdate =
          field === 'cac_document_url'
            ? { cac_document_url: [uploadedUrl] }
            : { [field]: uploadedUrl };
        await updateVendor({ businessId, patch }).unwrap();
        toast.success(`${kind} updated`);
        setFile(null);
        setEditing(false);
      } catch (error) {
        toast.error(readApiError(error));
      } finally {
        setSaving(false);
      }
    };

    const shownUrl = preview ?? url;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="relative z-10 flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white dark:bg-card p-5 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-base font-semibold text-grey-black dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-grey-black dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-muted/80"
            >
              <X className="size-4" />
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => handlePick(event.target.files?.[0])}
          />

          {/* Preview / dropzone */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-[#F2F2F2] dark:bg-muted">
            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  editing ? inputRef.current?.click() : setEditing(true)
                }
                aria-label={editing ? `Choose a ${kind}` : `Replace ${kind}`}
                title={editing ? `Choose a ${kind}` : `Replace ${kind}`}
                className="absolute right-3 top-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white/80 text-grey-black shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/40 dark:text-white dark:hover:bg-black/60"
              >
                <Pencil className="size-4" />
              </button>
            )}

            {editing && !preview ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-[320px] w-full cursor-pointer flex-col items-center justify-center gap-3 text-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-grey-black dark:text-white">
                  <Upload className="size-5" strokeWidth={1.5} aria-hidden />
                  {uploadLabel ?? `Upload ${kind}`}
                </span>
                <span className="text-xs text-grey3 dark:text-gray-400">
                  Up to 5MB
                </span>
              </button>
            ) : shownUrl ? (
              isPdf(shownUrl) ? (
                <iframe
                  src={shownUrl}
                  title={title}
                  className="h-[320px] w-full bg-white"
                />
              ) : (
                // Plain <img>: these are arbitrary vendor-supplied hosts, and
                // next/image would reject any not in remotePatterns.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shownUrl}
                  alt={title}
                  className="h-[320px] w-full object-contain"
                />
              )
            ) : (
              <div className="flex h-[320px] w-full flex-col items-center justify-center gap-3 text-center">
                <FileText
                  className="size-8 text-grey3 dark:text-gray-400"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium text-grey-black dark:text-white">
                    Nothing uploaded yet
                  </p>
                  <p className="mt-1 max-w-[240px] text-xs text-grey3 dark:text-gray-400">
                    This vendor hasn&apos;t provided a {kind.toLowerCase()}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          {editing ? (
            <Button
              type="button"
              size="lg"
              className="w-full gap-2"
              onClick={handleSave}
              disabled={!file || saving}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full gap-2"
              onClick={handleDownload}
              disabled={!url || isDownloading}
              title={url ? undefined : 'No file to download'}
            >
              {url && <Download className="size-4" />}
              {isDownloading
                ? 'Downloading...'
                : (downloadLabel ?? `Download ${kind}`)}
            </Button>
          )}
        </div>
      </div>
    );
  }
);
