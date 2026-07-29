// Vendor Profile Card - Molecule
// Card showing vendor profile information and document upload options
// Uploads go to Cloudinary via POST /uploads/profile, then URL is saved to Business via PATCH /business/profile

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Upload, Loader2, Palette } from 'lucide-react';
import Image from 'next/image';

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
  '#8D7F72', '#2C1810', '#1B4332', '#3A0CA3', '#7C2D12',
  '#0F766E', '#9D174D', '#1E3A8A', '#B45309', '#111827',
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
  themeColor?: string;
  className?: string;
}

export const VendorProfileCard: React.FC<VendorProfileCardProps> = ({
  vendorName,
  registrationId,
  website,
  status,
  logoUrl,
  svgLogoUrl,
  coverImageUrl,
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
  // Optimistic theme colour, so the preview updates instantly on select.
  const [localTheme, setLocalTheme] = useState<string | null>(null);
  const [savingTheme, setSavingTheme] = useState(false);

  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
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

  const handleImageUpload = async (
    file: File,
    type: 'logo' | 'svg_logo' | 'cover' | 'cac'
  ) => {
    try {
      const result = await uploadImage(file).unwrap();
      const imageUrl = result?.data?.url || (result as any)?.url;

      if (!imageUrl) {
        toast.error('Upload failed — no URL returned');
        return;
      }

      const payloadKey =
        type === 'logo' ? 'business_logo_url'
        : type === 'svg_logo' ? 'business_logo_svg_url'
        : type === 'cover' ? 'cover_image_url'
        : 'cac_document_url';
      
      // Save URL to business profile
      await updateBusinessDetails({ [payloadKey]: type === 'cac' ? [imageUrl] : imageUrl } as any).unwrap();

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
        toast.success('CAC document uploaded successfully!');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload image');
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'svg_logo' | 'cover' | 'cac'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
    e.target.value = '';
  };

  const displayLogo = localLogo || logoUrl;
  const displaySvgLogo = localSvgLogo || svgLogoUrl;
  const displayCover = localCover || coverImageUrl;

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
      <div className='bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] custom-card-shadow overflow-hidden pb-6'>
      {/* Hidden file inputs */}
      <input
        ref={logoInputRef}
        type='file'
        accept='image/png,image/svg+xml,image/jpeg,image/webp'
        className='hidden'
        onChange={(e) => handleFileChange(e, 'logo')}
      />
      <input
        ref={svgLogoInputRef}
        type='file'
        accept='image/png,image/svg+xml,image/jpeg,image/webp'
        className='hidden'
        onChange={(e) => handleFileChange(e, 'svg_logo')}
      />
      <input
        ref={coverInputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp'
        className='hidden'
        onChange={(e) => handleFileChange(e, 'cover')}
      />
      <input
        ref={cacInputRef}
        type='file'
        accept='image/png,image/jpeg,application/pdf'
        className='hidden'
        onChange={(e) => handleFileChange(e, 'cac')}
      />

      {/* Cover Image Section (Touches edges). Backed by the theme colour so it
          previews the storefront accent — the shop paints its whole page with a
          darkened theme_color, matched here via coverTint. */}
      <div
        className='relative h-32'
        style={{ background: `linear-gradient(135deg, ${effectiveTheme}, ${coverTint})` }}
      >
        {displayCover ? (
          <>
            <Image
              src={displayCover}
              alt='Cover'
              fill
              className='object-cover'
              unoptimized={displayCover?.includes('/raw/')}
            />
            {/* Theme-tinted overlay so the logo/buttons pop and the accent reads
                through even with a cover photo. */}
            <div
              className='absolute inset-0 pointer-events-none'
              style={{ background: `linear-gradient(to bottom, transparent 30%, ${coverTint}cc 100%)` }}
            />
          </>
        ) : null}

        {/* Scaled SVG/PNG logo in top-left corner */}
        {displaySvgLogo && (
          <div className='absolute top-2 left-4 z-10'>
            <div className='size-10'>
              <Image
                src={displaySvgLogo}
                alt={vendorName}
                width={100}
                height={100}
                quality={100}
                className='size-full object-contain'
                unoptimized={displaySvgLogo?.toLowerCase().includes('.svg') || displaySvgLogo?.includes('/raw/')}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={isUploading}
          className='absolute top-2 right-2 bg-white dark:bg-muted p-2 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-muted/80'
        >
          {isUploading ? (
            <Loader2 className='w-4 h-4 text-gray-600 animate-spin' />
          ) : (
            <Camera className='w-4 h-4 text-gray-600' />
          )}
        </button>
      </div>

      {/* Logo Section */}
      <div className='px-6 flex flex-col items-center -mt-16'>
        <div className='relative'>
          <div className='w-24 h-24 bg-white dark:bg-muted rounded-full border-4 border-white dark:border-card shadow-lg flex items-center justify-center overflow-hidden'>
            {displayLogo ? (
              <Image
                src={displayLogo}
                alt={vendorName}
                width={200}
                height={200}
                quality={100}
                className='object-cover size-full'
                unoptimized={displayLogo?.includes('/raw/')}
              />
            ) : (
              <div className='w-full h-full bg-white dark:bg-muted flex items-center justify-center'>
                <span className='text-3xl font-bold text-gray-800 dark:text-gray-200'>
                  {vendorName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => logoInputRef.current?.click()}
            disabled={isUploading}
            className='absolute bottom-0 right-0 bg-[#3d2817] p-2 rounded-full shadow-md border-2 border-white hover:bg-[#2c1d11]'
          >
            {isUploading ? (
              <Loader2 className='w-4 h-4 text-gray-600 animate-spin' />
            ) : (
              <Camera className='w-4 h-4 text-white' />
            )}
          </button>
        </div>

        {/* Vendor Info */}
        <h3 className='text-lg font-semibold text-[#1C1C1E] dark:text-white mt-4'>
          {vendorName}
        </h3>
        <p className='text-sm text-gray-400 mt-1 uppercase tracking-wider'>{registrationId}</p>
        <p className='text-sm text-[#5C2D0D] dark:text-amber-400 mt-1'>{website}</p>
        <p className={cn('text-xs font-semibold mt-1', getStatusColor())}>
          {getStatusText()}
        </p>

        {/* Storefront theme colour picker — previews live in the cover above */}
        <div className='mt-5 w-full px-2 pb-1'>
          <div className='mb-2.5 flex items-center justify-center gap-1.5'>
            <Palette className='size-3.5 text-gray-400' />
            <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
              Storefront theme
            </span>
            {savingTheme && <Loader2 className='size-3 animate-spin text-gray-400' />}
          </div>
          <div className='flex flex-wrap items-center justify-center gap-2'>
            {THEME_PRESETS.map((c) => {
              const active = effectiveTheme.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type='button'
                  disabled={savingTheme}
                  onClick={() => handleSelectTheme(c)}
                  aria-label={`Theme colour ${c}`}
                  className='size-7 rounded-full transition-transform hover:scale-110 disabled:opacity-60'
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
              className='relative size-7 cursor-pointer overflow-hidden rounded-full border border-white shadow-sm'
              title='Custom colour'
              style={{
                background:
                  'conic-gradient(from 0deg, #ef4444, #f59e0b, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)',
              }}
            >
              <input
                type='color'
                value={effectiveTheme}
                onChange={(e) => handleSelectTheme(e.target.value)}
                disabled={savingTheme}
                className='absolute inset-0 cursor-pointer opacity-0'
              />
            </label>
          </div>
          <p className='mt-2.5 text-center text-[11px] leading-relaxed text-gray-400'>
            This colours your storefront background for customers.
          </p>
        </div>
      </div>
      </div>

      {/* Upload Buttons - Separated */}
      <div className='space-y-4'>
        <button
          onClick={() => svgLogoInputRef.current?.click()}
          disabled={isUploading}
          className='w-full flex items-center gap-3 px-6 py-4 bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] custom-card-shadow transition-colors hover:bg-gray-50 dark:hover:bg-muted disabled:opacity-50'
        >
          <Upload className='w-5 h-5 text-gray-400' />
          <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Upload SVG/PNG logo</span>
        </button>

        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={isUploading}
          className='w-full flex items-center gap-3 px-6 py-4 bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] custom-card-shadow transition-colors hover:bg-gray-50 dark:hover:bg-muted disabled:opacity-50'
        >
          <Upload className='w-5 h-5 text-gray-400' />
          <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Upload Cover image</span>
        </button>

        <button
          onClick={() => cacInputRef.current?.click()}
          disabled={isUploading}
          className='w-full flex items-center gap-3 px-6 py-4 bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] custom-card-shadow transition-colors hover:bg-gray-50 dark:hover:bg-muted disabled:opacity-50'
        >
          <Upload className='w-5 h-5 text-gray-400' />
          <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Upload CAC Document</span>
        </button>
      </div>
    </div>
  );
};
