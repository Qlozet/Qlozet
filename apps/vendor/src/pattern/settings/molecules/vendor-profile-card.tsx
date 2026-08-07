// Vendor Profile Card - Molecule
// Card showing vendor profile information and document upload options
// Uploads go to Cloudinary via POST /uploads/profile, then URL is saved to Business via PATCH /business/profile

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Camera,
  Loader2,
  Palette,
  FileUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';

type UploadType = 'logo' | 'svg_logo' | 'cover' | 'cac';

// Local overrides: `null` = no local change yet (use whatever the API returned),
// `''` = the vendor removed the file, anything else = just-uploaded URL.
const resolveFile = (local: string | null, remote?: string) =>
  local === null ? remote : local || undefined;

const payloadKeyFor = (type: UploadType): string =>
  type === 'logo'
    ? 'business_logo_url'
    : type === 'svg_logo'
      ? 'business_logo_svg_url'
      : type === 'cover'
        ? 'cover_image_url'
        : 'cac_document_url';

// Cloudinary URLs end in the stored file name — good enough to confirm to the
// vendor *which* file is on record.
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

// Darken a hex colour — mirrors the shop storefront, which paints its page
// background with darkenHex(theme_color), so the preview here matches what
// customers actually see.
function darkenHex(hex: string, amount = 0.55): string {
  const clean = (hex || '').replace('#', '');
  if (clean.length !== 6) return hex;
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * (1 - amount));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// Curated storefront-friendly presets.
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
import { useUploadProfileImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { useUpdateBusinessProfileDetailsMutation } from '@/redux/services/settings/settings.api-slice';
import { toast } from 'sonner';

interface VendorProfileCardProps {
  vendorName: string;
  registrationId: string;
  website: string;
  status: 'pending' | 'approved' | 'rejected';
  logoUrl?: string;
  svgLogoUrl?: string;
  coverImageUrl?: string;
  /** CAC documents already on the business profile (`cac_document_url`). */
  cacDocumentUrls?: string[];
  themeColor?: string;
  className?: string;
}

// One row in the upload list. Empty state is the plain "Upload X" button; once
// a file exists the row keeps that label and gains a green tick plus a chip
// naming the stored file, which can be opened or removed.
const UploadRow = ({
  label,
  fileUrl,
  uploading,
  removing,
  disabled,
  verified = false,
  onSelect,
  onRemove,
}: {
  label: string;
  fileUrl?: string | null;
  uploading: boolean;
  removing: boolean;
  disabled: boolean;
  /**
   * Back-office confirmation that the document is genuine. No endpoint exposes
   * per-document verification yet, so nothing passes this today.
   * TODO(api): wire once the business profile returns a verification flag.
   */
  verified?: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) => {
  const busy = uploading || removing;

  return (
    <div className="w-full px-6 py-4 bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] custom-card-shadow">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 shrink-0 animate-spin text-gray-400" />
          ) : (
            <FileUp className="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400" />
          )}
          <span className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">
            {uploading ? 'Uploading…' : `Upload ${label}`}
          </span>
        </button>

        {fileUrl && !busy && (
          <span className="shrink-0">
            {verified ? (
              <span className="text-xs font-bold text-green-700 dark:text-green-500">
                Verified
              </span>
            ) : (
              <CheckCircle2 className="size-5 fill-green-600 text-white dark:text-card" />
            )}
          </span>
        )}
      </div>

      {fileUrl && !uploading && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            title={fileNameFromUrl(fileUrl) ?? undefined}
            className="min-w-0 flex-1 truncate text-sm text-gray-500 hover:underline dark:text-gray-400"
          >
            {fileNameFromUrl(fileUrl) ?? 'View file'}
          </a>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${label}`}
            className="shrink-0 cursor-pointer text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 dark:hover:text-gray-200"
          >
            {removing ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <XCircle className="size-5" />
            )}
          </button>
        </div>
      )}
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
  cacDocumentUrls,
  themeColor,
  className,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const svgLogoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const cacInputRef = useRef<HTMLInputElement>(null);

  // Local state for uploaded images (shown immediately after upload)
  const [localLogo, setLocalLogo] = useState<string | null>(null);
  const [localSvgLogo, setLocalSvgLogo] = useState<string | null>(null);
  const [localCover, setLocalCover] = useState<string | null>(null);
  const [localCac, setLocalCac] = useState<string | null>(null);
  // Which upload is in flight — the mutation's own isLoading is shared by all
  // four, which would otherwise spin every control at once.
  const [uploadingType, setUploadingType] = useState<UploadType | null>(null);
  const [removingType, setRemovingType] = useState<UploadType | null>(null);
  // Optimistic theme colour, so the preview updates instantly on select.
  const [localTheme, setLocalTheme] = useState<string | null>(null);
  const [savingTheme, setSavingTheme] = useState(false);

  const [uploadImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const [updateBusinessDetails] = useUpdateBusinessProfileDetailsMutation();

  const effectiveTheme = localTheme || themeColor || '#8D7F72';
  const coverTint = darkenHex(effectiveTheme, 0.45);

  const handleSelectTheme = async (color: string) => {
    if (!color) return;
    const prev = localTheme;
    setLocalTheme(color);
    setSavingTheme(true);
    try {
      await updateBusinessDetails({ theme_color: color }).unwrap();
      toast.success('Storefront theme colour updated');
    } catch (error: any) {
      setLocalTheme(prev); // revert on failure
      toast.error(error?.data?.message || 'Failed to update theme colour');
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
        toast.error('Upload failed — no URL returned');
        return;
      }

      // Save URL to business profile
      await updateBusinessDetails({
        [payloadKeyFor(type)]: type === 'cac' ? [imageUrl] : imageUrl,
      } as any).unwrap();

      // Update local state to show the image immediately
      if (type === 'logo') {
        setLocalLogo(imageUrl);
        toast.success('Logo uploaded successfully!');
      } else if (type === 'svg_logo') {
        setLocalSvgLogo(imageUrl);
        toast.success('SVG/PNG logo uploaded successfully!');
      } else if (type === 'cover') {
        setLocalCover(imageUrl);
        toast.success('Cover image uploaded successfully!');
      } else {
        setLocalCac(imageUrl);
        toast.success('CAC document uploaded successfully!');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingType(null);
    }
  };

  // Clearing sends the empty value for that field — [] for the CAC list, '' for
  // the single-URL fields.
  const handleRemove = async (type: UploadType, label: string) => {
    setRemovingType(type);
    try {
      await updateBusinessDetails({
        [payloadKeyFor(type)]: type === 'cac' ? [] : '',
      } as any).unwrap();

      if (type === 'logo') setLocalLogo('');
      else if (type === 'svg_logo') setLocalSvgLogo('');
      else if (type === 'cover') setLocalCover('');
      else setLocalCac('');

      toast.success(`${label} removed`);
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to remove ${label}`);
    } finally {
      setRemovingType(null);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: UploadType
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
    e.target.value = '';
  };

  const busy = isUploading || removingType !== null;

  const displayLogo = resolveFile(localLogo, logoUrl);
  const displaySvgLogo = resolveFile(localSvgLogo, svgLogoUrl);
  const displayCover = resolveFile(localCover, coverImageUrl);
  // The API stores CAC as a list; the most recent upload is the one to show.
  const displayCac = resolveFile(
    localCac,
    cacDocumentUrls?.[cacDocumentUrls.length - 1]
  );

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
      default:
        return 'text-[#D4A574]';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending approval';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Vendor Card */}
      <div className="bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] custom-card-shadow overflow-hidden pb-6">
        {/* Hidden file inputs */}
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
        <input
          ref={cacInputRef}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'cac')}
        />

        {/* Cover Image Section (Touches edges). Backed by the theme colour so it
          previews the storefront accent — the shop paints its whole page with a
          darkened theme_color, matched here via coverTint. */}
        <div
          className="relative h-32"
          style={{
            background: `linear-gradient(135deg, ${effectiveTheme}, ${coverTint})`,
          }}
        >
          {displayCover ? (
            <>
              <Image
                src={displayCover}
                alt="Cover"
                fill
                className="object-cover"
                unoptimized={displayCover?.includes('/raw/')}
              />
              {/* Theme-tinted overlay so the logo/buttons pop and the accent reads
                through even with a cover photo. */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, transparent 30%, ${coverTint}cc 100%)`,
                }}
              />
            </>
          ) : null}

          {/* Scaled SVG/PNG logo in top-left corner */}
          {displaySvgLogo && (
            <div className="absolute top-2 left-4 z-10">
              <div className="size-10">
                <Image
                  src={displaySvgLogo}
                  alt={vendorName}
                  width={100}
                  height={100}
                  quality={100}
                  className="size-full object-contain"
                  unoptimized={
                    displaySvgLogo?.toLowerCase().includes('.svg') ||
                    displaySvgLogo?.includes('/raw/')
                  }
                />
              </div>
            </div>
          )}

          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploading}
            className="absolute top-2 right-2 bg-white dark:bg-muted p-2 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-muted/80"
          >
            {uploadingType === 'cover' ? (
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Logo Section */}
        <div className="px-6 flex flex-col items-center -mt-16">
          <div className="relative">
            <div className="w-24 h-24 bg-white dark:bg-muted rounded-full border-4 border-white dark:border-card shadow-lg flex items-center justify-center overflow-hidden">
              {displayLogo ? (
                <Image
                  src={displayLogo}
                  alt={vendorName}
                  width={200}
                  height={200}
                  quality={100}
                  className="object-cover size-full"
                  unoptimized={displayLogo?.includes('/raw/')}
                />
              ) : (
                <div className="w-full h-full bg-white dark:bg-muted flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {vendorName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-[#3d2817] p-2 rounded-full shadow-md border-2 border-white hover:bg-[#2c1d11]"
            >
              {uploadingType === 'logo' ? (
                <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Vendor Info */}
          <h3 className="text-lg font-semibold text-[#1C1C1E] dark:text-white mt-4">
            {vendorName}
          </h3>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider">
            {registrationId}
          </p>
          <p className="text-sm text-[#5C2D0D] dark:text-amber-400 mt-1">
            {website}
          </p>
          <p className={cn('text-xs font-semibold mt-1', getStatusColor())}>
            {getStatusText()}
          </p>

          {/* Storefront theme colour picker — previews live in the cover above */}
          <div className="mt-5 w-full px-2 pb-1">
            <div className="mb-2.5 flex items-center justify-center gap-1.5">
              <Palette className="size-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Storefront theme
              </span>
              {savingTheme && (
                <Loader2 className="size-3 animate-spin text-gray-400" />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {THEME_PRESETS.map((c) => {
                const active = effectiveTheme.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={savingTheme}
                    onClick={() => handleSelectTheme(c)}
                    aria-label={`Theme colour ${c}`}
                    className="size-7 rounded-full transition-transform hover:scale-110 disabled:opacity-60"
                    style={{
                      backgroundColor: c,
                      boxShadow: active
                        ? `0 0 0 2px #fff, 0 0 0 4px ${c}`
                        : '0 0 0 1px rgba(0,0,0,0.12)',
                    }}
                  />
                );
              })}
              {/* Custom colour — native picker behind a rainbow swatch */}
              <label
                className="relative size-7 cursor-pointer overflow-hidden rounded-full border border-white shadow-sm"
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
                />
              </label>
            </div>
            <p className="mt-2.5 text-center text-[11px] leading-relaxed text-gray-400">
              This colours your storefront background for customers.
            </p>
          </div>
        </div>
      </div>

      {/* Upload rows — each reflects whatever is already on the profile */}
      <div className="space-y-4">
        <UploadRow
          label="SVG/PNG logo"
          fileUrl={displaySvgLogo}
          uploading={uploadingType === 'svg_logo'}
          removing={removingType === 'svg_logo'}
          disabled={busy}
          onSelect={() => svgLogoInputRef.current?.click()}
          onRemove={() => handleRemove('svg_logo', 'SVG/PNG logo')}
        />

        <UploadRow
          label="Cover image"
          fileUrl={displayCover}
          uploading={uploadingType === 'cover'}
          removing={removingType === 'cover'}
          disabled={busy}
          onSelect={() => coverInputRef.current?.click()}
          onRemove={() => handleRemove('cover', 'Cover image')}
        />

        <UploadRow
          label="CAC Document"
          fileUrl={displayCac}
          uploading={uploadingType === 'cac'}
          removing={removingType === 'cac'}
          disabled={busy}
          onSelect={() => cacInputRef.current?.click()}
          onRemove={() => handleRemove('cac', 'CAC document')}
        />
      </div>
    </div>
  );
};
