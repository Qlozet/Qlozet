// Shared API response/types for vendor RTK Query slices.
// Mirrors the Qlozet backend response envelopes (see /api-docs).

// Standard success envelope returned by most endpoints
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data: T;
}

// Wrapper envelope used by some endpoints (login, product list, etc.)
export interface WrappedResponse<T = unknown> {
  statusCode: number;
  message: string;
  error?: unknown;
  timestamp?: number;
  version?: string;
  path?: string;
  data: T;
}

// Common pagination envelope.
//
// The Qlozet backend returns snake_case keys:
//   { data, total_items, total_pages, current_page, page_size,
//     has_next_page, has_previous_page }
// The camelCase members below are legacy aliases; no endpoint has been observed
// sending them. Read totals through `readTotalItems` / `readPageCount` rather
// than reaching for a key directly — picking the wrong one silently collapses a
// table to a single page of whatever the current page happens to hold.
export interface PaginatedData<T> {
  data: T[];
  total_items?: number;
  total_pages?: number;
  current_page?: number;
  page_size?: number;
  has_next_page?: boolean;
  has_previous_page?: boolean;
  // Legacy aliases — kept so existing consumers still compile.
  totalCount?: number;
  total?: number;
  currentPage?: number;
  page?: number;
  totalPages?: number;
  size?: number;
}

/**
 * Anything page-shaped. `Partial` because several vendor endpoints type their
 * envelope with an optional `data`, and both readers already guard for it.
 */
export type PaginatedLike<T> = Partial<PaginatedData<T>>;

/** Total number of records matching the query, across every page. */
export const readTotalItems = <T>(paginated?: PaginatedLike<T>): number =>
  paginated?.total_items ??
  paginated?.totalCount ??
  paginated?.total ??
  paginated?.data?.length ??
  0;

/**
 * Page count for a table. Prefers the server's own `total_pages`; falls back to
 * deriving it from the total. Never returns 0 — an empty table still renders
 * one (empty) page.
 */
export const readPageCount = <T>(
  paginated: PaginatedLike<T> | undefined,
  pageSize: number
): number => {
  const serverPages = paginated?.total_pages ?? paginated?.totalPages;
  if (typeof serverPages === 'number' && serverPages > 0) return serverPages;
  const size = Math.max(pageSize, 1);
  return Math.max(Math.ceil(readTotalItems(paginated) / size), 1);
};

export interface PaginationParams {
  page?: number;
  size?: number;
}

// Build a query string from a params object, skipping undefined/empty values
export const buildQueryString = (
  params: Record<string, string | number | boolean | undefined | null>
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

/**
 * The server's message for a failed RTK Query call, or a generic fallback.
 *
 * Call sites had each reached into `error.data.message` inline with their own
 * fallback wording. That matters beyond tidiness: an endpoint that refuses
 * usefully — "this warehouse still has stock" — is worth showing verbatim, and
 * Nest's ValidationPipe returns `message` as an ARRAY of strings, which a
 * hand-rolled reader hands straight to a toast as "[object Object]".
 */
export const readApiError = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  const data = (error as { data?: unknown })?.data;

  if (typeof data === 'string' && data.trim()) return data;

  const message = (data as { message?: unknown })?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const joined = message.filter((m) => typeof m === 'string').join(', ');
    if (joined) return joined;
  }

  return fallback;
};
