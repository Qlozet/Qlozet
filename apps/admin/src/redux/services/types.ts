// Shared API response/types for admin RTK Query slices

// Standard API envelope returned by the backend
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data: T;
}

// Common pagination envelope
export interface PaginatedData<T> {
  data: T[];
  totalCount?: number;
  total?: number;
  currentPage?: number;
  page?: number;
  totalPages?: number;
  size?: number;
}

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
