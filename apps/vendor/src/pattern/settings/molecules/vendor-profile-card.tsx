// Store hero: what the storefront looks like (cover, logo, theme), where the
// store stands (approval status, link to the live storefront) and how
// finished the profile is. Uploads go to Cloudinary via POST /uploads/profile,
// then the URL is saved to the business via PATCH /business/profile.
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Camera,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileUp,
  Loader2,
  Palette,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useUploadProfileImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { useUpdateBusinessProfileDetailsMutation } from '@/redux/services/settings/settings.api-slice';
import { toast } from 'sonner';
import { readApiError } from '@/redux/services/types';
import type { ProfileCompleteness } from '../lib/profile-completeness';

// No 'cac'. The CAC certificate is evidence for verification, not a
// storefront asset, and is filed from Get Verified.
type UploadType = 'logo' | 'svg_logo' | 'cover';

// Local overrides: `null` = no local change yet (use whatever the API returned),
// `''` = the vendor removed the file, anything else = just-uploaded URL.
const resolveFile = (local: string | null, remote?: string) =>
  local === null ? remote : local || undefined;

const payloadKeyFor = (type: UploadType): string =>
  type === 'logo'
    ? 'business_logo_url'
    : type === 'svg_logo'
      ? 'business_logo_svg_url'
      : 'cover_image_url';

const fileNameFromUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const path = url.split('?')[0].split('#')[0];
  const name = path.split('/').pop();
  if (!name) return null;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

// Darken a hex colour - mirrors the shop storefront, which paints its page
// background with darkenHex(theme_color), so the preview matches what
// customers actually see.
function darkenHex(hex: string, amount = 0.55): string {
  const clean = (hex || '').replace('#', '');
  if (clean.length !== 6) return hex;
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * (1 - amount));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const THEME_PRESETS = [
  '#8D7F72',
  '#2C1810',
  '#1B4332',
  '#3A0CA3',
  '#7C2D12',
  '#0F766E',
  '#9D174D',
  '#1E3A8A',
  '#B45309',
  '#111827',
];

interface VendorProfileCardProps {
  vendorName: string;
  registrationId: string;
  website: string;
  status: 'pending' | 'approved' | 'rejected' | 'verified' | string;
  logoUrl?: string;
  svgLogoUrl?: string;
  coverImageUrl?: string;
  themeColor?: string;
  /** Live storefront, when the store id is known. */
  storefrontUrl?: string;
  completeness?: ProfileCompleteness;
  className?: string;
}

// One row in the brand list: empty state is the plain "Upload X" button; once
// a file exists the row keeps that label and gains a tick plus the file name.
const UploadRow = ({
  label,
  hint,
  fileUrl,
  uploading,
  removing,
  disabled,
  onSelect,
  onRemove,
}: {
  label: string;
  hint: string;
  fileUrl?: string;
  uploading: boolean;
  removing: boolean;
  disabled: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) => {
  const busy = uploading || removing;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 dark:bg-muted/40">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {fileUrl ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          ) : (
            <FileUp className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <p
          className="mt-0.5 truncate text-[11px] text-muted-foreground"
          title={fileNameFromUrl(fileUrl) ?? undefined}
        >
          {fileUrl ? (fileNameFromUrl(fileUrl) ?? 'Uploaded') : hint}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : fileUrl ? 'Replace' : 'Upload'}
        </button>
        {fileUrl && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${label}`}
            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            {removing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <XCircle className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const VendorProfileCard: React.FC<VendorProfileCardProps> = ({
  vendorName,
  registrationId,
  website,
  status,
  logoUrl,
  svgLogoUrl,
  coverImageUrl,
  themeColor,
  storefrontUrl,
  completeness,
  className,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const svgLogoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [localLogo, setLocalLogo] = useState<string | null>(null);
  const [localSvgLogo, setLocalSvgLogo] = useState<string | null>(null);
  const [localCover, setLocalCover] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<UploadType | null>(null);
  const [removingType, setRemovingType] = useState<UploadType | null>(null);
  const [localTheme, setLocalTheme] = useState<string | null>(null);
  const [savingTheme, setSavingTheme] = useState(false);
  const [copied, setCopied] = useState(false);

  const [uploadImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const [updateBusinessDetails] = useUpdateBusinessProfileDetailsMutation();

  const effectiveTheme = localTheme || themeColor || '#8D7F72';
  const coverTint = darkenHex(effectiveTheme, 0.45);

  const handleSelectTheme = async (color: string) => {
    const prev = localTheme;
    setLocalTheme(color);
    setSavingTheme(true);
    try {
      await updateBusinessDetails({ theme_color: color }).unwrap();
      toast.success('Storefront colour updated');
    } catch (error: any) {
      setLocalTheme(prev);
      toast.error(
        readApiError(error, 'Could not update the storefront colour')
      );
    } finally {
      setSavingTheme(false);
    }
  };

  const handleImageUpload = async (file: File, type: UploadType) => {
    setUploadingType(type);
    try {
      const result = await uploadImage(file).unwrap();
      const imageUrl = result?.data?.url || (result as any)?.url;
      if (!imageUrl) {
        toast.error('Upload failed - no URL returned');
        return;
      }
      await updateBusinessDetails({
        [payloadKeyFor(type)]: imageUrl,
      } as any).unwrap();
      if (type === 'logo') {
        setLocalLogo(imageUrl);
        toast.success('Logo updated');
      } else if (type === 'svg_logo') {
        setLocalSvgLogo(imageUrl);
        toast.success('Header logo updated');
      } else {
        setLocalCover(imageUrl);
        toast.success('Cover photo updated');
      }
    } catch (error: any) {
      toast.error(readApiError(error, 'Could not upload the image'));
    } finally {
      setUploadingType(null);
    }
  };

  const handleRemove = async (type: UploadType, label: string) => {
    setRemovingType(type);
    try {
      await updateBusinessDetails({
        [payloadKeyFor(type)]: '',
      } as any).unwrap();
      if (type === 'logo') setLocalLogo('');
      else if (type === 'svg_logo') setLocalSvgLogo('');
      else setLocalCover('');
      toast.success(`${label} removed`);
    } catch (error: any) {
      toast.error(
        readApiError(error, `Could not remove the ${label.toLowerCase()}`)
      );
    } finally {
      setRemovingType(null);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: UploadType
  ) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, type);
    e.target.value = '';
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(registrationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const busy = isUploading || removingType !== null;
  const displayLogo = resolveFile(localLogo, logoUrl);
  const displaySvgLogo = resolveFile(localSvgLogo, svgLogoUrl);
  const displayCover = resolveFile(localCover, coverImageUrl);

  const approved = status === 'approved' || status === 'verified';
  const statusChip = approved
    ? {
        text: 'Approved',
        className:
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      }
    : status === 'rejected'
      ? {
          text: 'Changes requested',
          className:
            'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        }
      : {
          text: 'Pending approval',
          className:
            'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        };

  return (
    <div className={cn('surface-card overflow-hidden', className)}>
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'logo')}
      />
      <input
        ref={svgLogoInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'svg_logo')}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'cover')}
      />

      {/* Cover, tinted with the storefront colour the way the shop paints it */}
      <div
        className="relative h-36 sm:h-44"
        style={{
          background: `linear-gradient(135deg, ${effectiveTheme}, ${coverTint})`,
        }}
      >
        {displayCover && (
          <>
            <Image
              src={displayCover}
              alt="Cover"
              fill
              className="object-cover"
              unoptimized={displayCover?.includes('/raw/')}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 30%, ${coverTint}cc 100%)`,
              }}
            />
          </>
        )}
        {/* Header logo, sized like the storefront shows it: a wide mark, not an icon. */}
        {displaySvgLogo && (
          <div className="absolute left-4 top-3 z-10 h-14 w-[200px] sm:h-20 sm:w-[280px]">
            <Image
              src={displaySvgLogo}
              alt={vendorName}
              width={400}
              height={160}
              quality={100}
              className="size-full object-contain object-left drop-shadow-md"
              unoptimized={
                displaySvgLogo?.toLowerCase().includes('.svg') ||
                displaySvgLogo?.includes('/raw/')
              }
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          disabled={busy}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-800 shadow-md hover:bg-white disabled:opacity-60 dark:bg-black/60 dark:text-white dark:hover:bg-black/70"
        >
          {uploadingType === 'cover' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Camera className="size-3.5" />
          )}
          <span className="hidden sm:inline">
            {displayCover ? 'Change cover' : 'Add cover photo'}
          </span>
        </button>
      </div>

      <div className="px-5 pb-5 sm:px-6">
        {/* Logo + identity + storefront link */}
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative shrink-0">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-white shadow-lg dark:bg-muted">
                {displayLogo ? (
                  <Image
                    src={displayLogo}
                    alt={vendorName}
                    width={200}
                    height={200}
                    quality={100}
                    className="size-full object-cover"
                    unoptimized={displayLogo?.includes('/raw/')}
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {vendorName.charAt(0)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={busy}
                aria-label={displayLogo ? 'Change logo' : 'Add logo'}
                className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-card bg-primary p-2 text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-60"
              >
                {uploadingType === 'logo' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {vendorName}
                </h2>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    statusChip.className
                  )}
                >
                  {statusChip.text}
                </span>
              </div>
              {website ? (
                <a
                  href={
                    website.startsWith('http') ? website : `https://${website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 block truncate text-sm text-primary hover:underline"
                >
                  {website}
                </a>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  No website yet
                </p>
              )}
              {registrationId && (
                <button
                  type="button"
                  onClick={copyId}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  title="Store ID - quote this to support"
                >
                  Store ID {registrationId.slice(-6).toUpperCase()}
                  {copied ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              )}
            </div>
          </div>
          {storefrontUrl && (
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-accent"
            >
              View storefront
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>

        {/* Completeness */}
        {completeness && (
          <div className="mt-5 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">
                {completeness.percent === 100
                  ? 'Profile complete'
                  : `Profile ${completeness.percent}% complete`}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {completeness.done} of {completeness.total}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  completeness.percent === 100 ? 'bg-emerald-500' : 'bg-primary'
                )}
                style={{ width: `${Math.max(4, completeness.percent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Storefront look */}
        <div
          id="profile-brand"
          className="mt-6 scroll-mt-24 border-t border-border pt-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Storefront look
            </h3>
            {savingTheme && (
              <Loader2 className="size-3 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Accent colour. It paints the cover above and your storefront
                background.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {THEME_PRESETS.map((c) => {
                  const active =
                    effectiveTheme.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={savingTheme}
                      onClick={() => handleSelectTheme(c)}
                      aria-label={`Theme colour ${c}`}
                      aria-pressed={active}
                      className="size-7 rounded-full transition-transform hover:scale-110 disabled:opacity-60"
                      style={{
                        backgroundColor: c,
                        boxShadow: active
                          ? `0 0 0 2px var(--card), 0 0 0 4px ${c}`
                          : '0 0 0 1px rgba(0,0,0,0.12)',
                      }}
                    />
                  );
                })}
                <label
                  className="relative size-7 cursor-pointer overflow-hidden rounded-full border border-card shadow-sm"
                  title="Custom colour"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #ef4444, #f59e0b, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)',
                  }}
                >
                  <input
                    type="color"
                    value={effectiveTheme}
                    onChange={(e) => handleSelectTheme(e.target.value)}
                    disabled={savingTheme}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Custom theme colour"
                  />
                </label>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <UploadRow
                label="Header logo"
                hint="Optional. A wide or transparent logo for the top of your storefront; the round logo is used elsewhere."
                fileUrl={displaySvgLogo}
                uploading={uploadingType === 'svg_logo'}
                removing={removingType === 'svg_logo'}
                disabled={busy}
                onSelect={() => svgLogoInputRef.current?.click()}
                onRemove={() => handleRemove('svg_logo', 'Header logo')}
              />
              <UploadRow
                label="Cover photo"
                hint="Wide photo behind your store name. 1600 by 600 or larger looks best."
                fileUrl={displayCover}
                uploading={uploadingType === 'cover'}
                removing={removingType === 'cover'}
                disabled={busy}
                onSelect={() => coverInputRef.current?.click()}
                onRemove={() => handleRemove('cover', 'Cover photo')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
