// Force a real file download for a remote URL.
//
// A plain `<a download>` is ignored cross-origin — the browser navigates to the
// asset instead of saving it, which is why the document viewer used to just open
// a new tab. Fetching the bytes and saving an object URL keeps the file name and
// actually downloads.

/** Filename from a URL path, minus any query string. */
export const filenameFromUrl = (url: string, fallback: string): string => {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split('/').filter(Boolean).pop();
    return last && last.includes('.') ? decodeURIComponent(last) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Cloudinary can set `Content-Disposition: attachment` itself via the
 * `fl_attachment` delivery flag, which downloads without needing to buffer the
 * file. Used as the fallback when a direct fetch is blocked by CORS.
 */
const asCloudinaryAttachment = (url: string): string | null =>
  /res\.cloudinary\.com\/.+\/upload\//.test(url)
    ? url.replace('/upload/', '/upload/fl_attachment/')
    : null;

/**
 * Download `url` as `filename`.
 *
 * Returns false only when every route failed, so the caller can surface an
 * error rather than leaving the click silent.
 */
export const downloadFile = async (
  url: string,
  filename: string
): Promise<boolean> => {
  const saveBlob = (blob: Blob) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoke on the next tick — revoking immediately cancels the download in
    // Firefox.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  };

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    saveBlob(await response.blob());
    return true;
  } catch {
    // CORS or network failure — fall back to letting the host serve it as an
    // attachment, then to a plain new tab so the file is at least reachable.
    const attachmentUrl = asCloudinaryAttachment(url);
    const target = attachmentUrl ?? url;
    const opened = window.open(target, '_blank', 'noopener,noreferrer');
    return Boolean(opened);
  }
};
