import { cn } from '@/lib/utils';

interface QuestionMarkIconProps {
  className?: string;
  /** Rendered size in px. */
  size?: number;
}

/**
 * The red question-mark disc that heads a destructive confirmation.
 *
 * Ported from the vendor app, which carries the same mark as a 512×512 base64
 * PNG — ~30KB inlined into the bundle for a circle and a glyph. Drawn here
 * instead, so it stays sharp at any size and costs a few hundred bytes.
 */
export const QuestionMarkIcon = ({
  className,
  size = 120,
}: QuestionMarkIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    role="presentation"
    aria-hidden="true"
    className={cn('shrink-0', className)}
  >
    <circle cx="60" cy="60" r="60" fill="#EE4C48" />
    <path
      d="M60 28c-10.6 0-19.2 8.4-19.2 18.8a5.6 5.6 0 0 0 11.2 0c0-4.2 3.6-7.6 8-7.6s8 3.4 8 7.6c0 3.2-1.5 4.9-5.3 7.6l-1.4 1c-4.4 3.1-8.1 6.6-8.1 13v3a5.6 5.6 0 0 0 11.2 0v-3c0-1.9.8-2.9 4.3-5.4l1.4-1C74.6 58.4 79.2 54 79.2 46.8 79.2 36.4 70.6 28 60 28Z"
      fill="#fff"
    />
    <rect x="53.6" y="82" width="12.8" height="12.8" rx="3.2" fill="#fff" />
  </svg>
);
