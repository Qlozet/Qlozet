'use client';

import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Download, FileText, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';

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
 * TODO(api): the design also has an upload/replace mode. There is no endpoint
 * for it — `/admin/businesses/{id}` is GET-only and the upload routes are
 * profile/product/outfits, none of which target a business document. So the
 * edit affordance opens the shared work-in-progress modal, and a vendor with no
 * document gets an honest empty state rather than a dropzone that can't save.
 */
export const VendorDocumentModal = NiceModal.create(
  ({ kind, vendorName, url, downloadLabel }: VendorDocumentModalProps) => {
    const modal = useModal();

    if (!modal.visible) return null;

    const close = () => modal.remove();
    const title = vendorName ? `${kind} - ${vendorName}` : kind;

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
          className="relative z-10 flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-base font-semibold text-grey-black">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-grey-black transition-colors hover:bg-gray-100"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Preview */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-[#F2F2F2]">
            <button
              type="button"
              onClick={() => NiceModal.show(WorkInProgressModal)}
              aria-label={`Replace ${kind.toLowerCase()}`}
              className="absolute right-3 top-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-grey-black shadow-sm transition-colors hover:bg-white"
            >
              <Pencil className="size-4" />
            </button>

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
                  className="size-8 text-grey3"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium text-grey-black">
                    Nothing uploaded yet
                  </p>
                  <p className="mt-1 max-w-[240px] text-xs text-grey3">
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
            <Button asChild size="lg" className="w-full gap-2">
              {/* Cross-origin downloads ignore the `download` attribute, so this
                  opens in a new tab rather than silently doing nothing. */}
              <a href={url} target="_blank" rel="noreferrer" download>
                <Download className="size-4" />
                {downloadLabel ?? `Download ${kind}`}
              </a>
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
