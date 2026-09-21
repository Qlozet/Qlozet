'use client';

// Pre-ship approval (bespoke): after finishing the piece, the tailor submits
// photos here; the customer approves before the order can be fulfilled.
// Shipping stays blocked until approval (or 72h of customer silence).

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Camera, Clock, Loader2, RotateCcw, X } from 'lucide-react';
import { useSubmitPreshipMutation } from '@/redux/services/orders/orders.api-slice';
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice';

export interface PreshipState {
  photos: string[];
  note?: string | null;
  status: 'pending_review' | 'approved' | 'changes_requested';
  submitted_at?: string;
  reviewed_at?: string | null;
  customer_note?: string | null;
}

const fmt = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString([], {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

export const PreshipPanel = ({
  reference,
  initial,
}: {
  reference: string;
  initial: PreshipState | null;
}) => {
  const [preship, setPreship] = useState<PreshipState | null>(initial);
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitPreship, { isLoading }] = useSubmitPreshipMutation();
  const [uploadImage] = useUploadProductImageMutation();

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 8 - photos.length)) {
        const res = await uploadImage(file).unwrap();
        const url = res?.data?.url;
        if (url) {
          setPhotos((prev) => [...prev, url]);
        } else {
          toast.error(`Could not upload ${file.name} — try again.`);
        }
      }
    } catch {
      toast.error('Photo upload failed — try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = async () => {
    try {
      const res = await submitPreship({
        reference,
        photos,
        note: note.trim() || undefined,
      }).unwrap();
      setPreship((res as any)?.data ?? null);
      setPhotos([]);
      setNote('');
      toast.success('Sent to the customer for approval.');
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error(
        (Array.isArray(msg) ? msg[0] : msg) || 'Could not submit — try again.'
      );
    }
  };

  const showForm = !preship || preship.status === 'changes_requested';

  return (
    <section className="space-y-3">
      <p className="text-sm font-bold text-grey-black dark:text-white">
        Pre-ship Approval
      </p>
      <div className="space-y-4 rounded-xl border border-border bg-white p-4 dark:bg-card">
        {/* Current state */}
        {preship?.status === 'approved' && (
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F973D]">
            <BadgeCheck className="size-4" />
            Customer approved
            {preship.reviewed_at ? ` · ${fmt(preship.reviewed_at)}` : ''} — you
            can ship.
          </div>
        )}
        {preship?.status === 'pending_review' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[#DD900D]">
              <Clock className="size-4" />
              Waiting for the customer&apos;s approval
            </div>
            <p className="text-xs text-grey2 dark:text-gray-400">
              Sent {fmt(preship.submitted_at)}. If they don&apos;t respond
              within 72 hours, shipping unlocks automatically.
            </p>
          </div>
        )}
        {preship?.status === 'changes_requested' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[#D42620]">
              <RotateCcw className="size-4" />
              Customer requested changes
            </div>
            {preship.customer_note && (
              <p className="rounded-lg bg-[#FEF3F2] p-3 text-xs text-[#B42318] dark:bg-red-950 dark:text-red-300">
                &ldquo;{preship.customer_note}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Submitted photos */}
        {preship?.photos?.length ? (
          <div className="flex flex-wrap gap-2">
            {preship.photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt={`finished piece ${i + 1}`}
                  className="h-16 w-16 rounded-lg border border-border object-cover"
                />
              </a>
            ))}
          </div>
        ) : null}

        {/* Submit / resubmit form */}
        {showForm && (
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
              {preship
                ? 'Address the feedback, then submit new photos — the customer reviews again before you ship.'
                : 'Photograph the finished piece (front, back, details). The customer approves before you can ship — catching issues now beats a return later.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="h-16 w-16 rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotos((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-grey-black text-white"
                    aria-label="Remove photo"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || photos.length >= 8}
                className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border text-grey2 transition-colors hover:border-grey2 disabled:opacity-50 dark:text-gray-400"
                aria-label="Add photos"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(e) => addPhotos(e.target.files)}
              />
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the customer should know (optional)…"
              rows={2}
              className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-card"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!photos.length || isLoading || uploading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? 'Sending…' : 'Send for approval'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
