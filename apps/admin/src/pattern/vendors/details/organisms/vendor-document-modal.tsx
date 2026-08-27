'use client';

import { useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { Download, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadFile, filenameFromUrl } from '@/lib/download-file';

interface VendorDocumentModalProps {
  /** e.g. "PNG Logo" or "CAC Document". */
  kind: string;
  /** Vendor/business name, appended to the title. */
  vendorName?: string;
  /** Resolved file URL; undefined when nothing has been uploaded. */
  url?: string;
  /** Label for the download button, e.g. "Download Logo". */
  downloadLabel?: string;
}

const isPdf = (url: string) => /\.pdf(\?|#|$)/i.test(url);

/**
 * Vendor document viewer (company logo, CAC certificate).
 *
 * View + download are fully wired against the URL on the business record.
 *
 * The design also has an upload/replace mode, which is deliberately absent: the
 * backend has no endpoint for it. `/admin/businesses/{id}` is GET-only, and the
 * only upload routes (`/uploads/{profile,product,outfits}`) return a URL with
 * nothing to attach it to on another business's record — `PATCH /business/profile`
 * writes to the *caller's* own business. A vendor with no document therefore gets
 * an honest empty state rather than a dropzone that can't save.
 */
export const VendorDocumentModal = create(
  ({ kind, vendorName, url, downloadLabel }: VendorDocumentModalProps) => {
    const modal = useModal();
    const [isDownloading, setIsDownloading] = useState(false);

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

          {/* Preview */}
          {/* No replace/upload affordance: the admin console cannot write to a
              vendor's business record. /admin/businesses/{id} is read-only and
              PATCH /business/profile acts on the *caller's* own business, so a
              replace control here could only ever mislead. */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-[#F2F2F2] dark:bg-muted">
            {url ? (
              isPdf(url) ? (
                <iframe
                  src={url}
                  title={title}
                  className="h-[320px] w-full bg-white"
                />
              ) : (
                // Plain <img>: these are arbitrary vendor-supplied hosts, and
                // next/image would reject any not in remotePatterns.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
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
                    Uploading on their behalf isn&apos;t available from the
                    admin console yet.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          {url ? (
            <Button
              type="button"
              size="lg"
              className="w-full gap-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="size-4" />
              {isDownloading
                ? 'Downloading...'
                : (downloadLabel ?? `Download ${kind}`)}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled
              title="No file to download"
            >
              {downloadLabel ?? `Download ${kind}`}
            </Button>
          )}
        </div>
      </div>
    );
  }
);
