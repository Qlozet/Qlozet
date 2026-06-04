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

// Common pagination envelope. The backend is inconsistent about field names
// across endpoints, so all metadata fields are optional.
export interface PaginatedData<T> {
  data: T[];
  total_items?: number;
  totalCount?: number;
  total?: number;
  total_pages?: number;
  totalPages?: number;
  current_page?: number;
  currentPage?: number;
  page?: number;
  page_size?: number;
  size?: number;
  has_next_page?: boolean;
  has_previous_page?: boolean;
}

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
