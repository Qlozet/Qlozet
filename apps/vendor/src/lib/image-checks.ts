/**
 * Client-side image checks, run the moment a vendor picks a file.
 *
 * The server enforces the same rules on /uploads/* and remains the authority —
 * this exists so the vendor finds out beside the thumbnail they just added,
 * rather than after filling in the whole form and pressing Create. The
 * clothing form defers every upload to its save handler, so without this a
 * rejected photo surfaces at the very end of the flow.
 *
 * Defaults mirror the server's; the real values are admin-tunable and served
 * by GET /config/public, so pass them in when you have them.
 */

export const IMAGE_RULES = {
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPT_ATTR: 'image/jpeg,image/png,image/webp',
  /** Fallbacks only — prefer the values from GET /config/public. */
  DEFAULT_MAX_MB: 10,
  DEFAULT_MIN_SHORT_EDGE: 800,
};

export interface ImageCheckOptions {
  /** Omit or pass 0 to skip the resolution check (logos, reference shots). */
  minShortEdge?: number;
  maxMb?: number;
}

/** Reads intrinsic dimensions without decoding the whole file where possible. */
async function readDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  // createImageBitmap is cheaper and avoids an <img> in the DOM, but isn't
  // everywhere — fall back to an object URL.
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const size = { width: bitmap.width, height: bitmap.height };
      bitmap.close?.();
      return size;
    } catch {
      // Corrupt or unsupported — fall through and let the <img> path decide.
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/**
 * @returns an explanatory message, or null when the file is fine.
 * Messages are shown to vendors verbatim, so each one says how to fix it.
 */
export async function checkImageFile(
  file: File,
  options: ImageCheckOptions = {}
): Promise<string | null> {
  const maxMb = options.maxMb ?? IMAGE_RULES.DEFAULT_MAX_MB;
  const minShortEdge = options.minShortEdge ?? 0;

  if (!IMAGE_RULES.ACCEPTED_TYPES.includes(file.type)) {
    return `“${file.name}” is not a JPEG, PNG or WebP image.`;
  }

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `“${file.name}” is ${mb}MB. The limit is ${maxMb}MB — export it at a lower quality and try again.`;
  }

  const size = await readDimensions(file);
  if (!size || !size.width || !size.height) {
    return `“${file.name}” could not be read as an image. Try re-exporting it.`;
  }

  if (minShortEdge > 0) {
    const shortEdge = Math.min(size.width, size.height);
    if (shortEdge < minShortEdge) {
      return `“${file.name}” is ${size.width}×${size.height}px, which will look blurry on a product page. Use one at least ${minShortEdge}px on its shortest side.`;
    }
  }

  return null;
}

/**
 * Check a batch, keeping the good ones. Returning both halves lets the caller
 * add what passed and explain what didn't, instead of rejecting the whole
 * selection because one file was wrong.
 */
export async function partitionValidImages(
  files: File[],
  options: ImageCheckOptions = {}
): Promise<{ accepted: File[]; errors: string[] }> {
  const accepted: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const problem = await checkImageFile(file, options);
    if (problem) errors.push(problem);
    else accepted.push(file);
  }

  return { accepted, errors };
}
