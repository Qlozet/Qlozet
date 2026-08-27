// Shared API response/types for admin RTK Query slices

// Standard API envelope returned by the backend
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data: T;
}

// Common pagination envelope.
//
// The Qlozet backend returns snake_case keys — verified against
// GET /admin/tickets and GET /admin/businesses:
//   { data, total_items, total_pages, current_page, page_size,
//     has_next_page, has_previous_page }
// The camelCase members below are legacy aliases that predate that check; no
// endpoint has been observed sending them. Read totals through
// `readTotalItems` / `readPageCount` rather than reaching for a key directly —
// picking the wrong one silently collapses a table to a single page.
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

/** Total number of records matching the query, across every page. */
export const readTotalItems = <T>(paginated?: PaginatedData<T>): number =>
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
  paginated: PaginatedData<T> | undefined,
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
  params: Record<string, string | number | undefined | null>
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
 * Nine call sites had reached into `error.data.message` inline, each with its
 * own fallback wording. That matters beyond tidiness: an endpoint that returns
 * a *useful* refusal — "this customer has 3 orders, suspend instead" — is worth
 * showing verbatim, and a hand-rolled reader that misses the shape shows
 * "Something went wrong" instead.
 */
export const readApiError = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  const data = (error as { data?: unknown })?.data;

  if (typeof data === 'string' && data.trim()) return data;

  const message = (data as { message?: unknown })?.message;
  if (typeof message === 'string' && message.trim()) return message;
  // Nest's ValidationPipe returns message as an array of strings.
  if (Array.isArray(message)) {
    const joined = message.filter((m) => typeof m === 'string').join(', ');
    if (joined) return joined;
  }

  return fallback;
};
