// Style Library API Slice (admin)
// Platform styles are the shared library every vendor sees (business == null);
// vendor custom styles carry a business ref. Admin manages the platform tier:
//   GET    /style-library?scope=platform|vendor|all&include_inactive=true
//   POST   /style-library                 (single create)
//   POST   /style-library/bulk            ({ items: [...] } — bulk create)
//   PATCH  /style-library/:id
//   DELETE /style-library/:id             (soft delete → is_active=false)
//   POST   /style-library/regenerate-images  (backfill missing images)

import { baseAPI } from '@/redux/api/base-api';

export type StyleCategory =
  | 'neckline'
  | 'sleeve'
  | 'collar'
  | 'skirt'
  | 'trouser'
  | 'full_body'
  | 'bodice'
  | 'hemline'
  | 'back';

export type StyleType = 'top' | 'bottom' | 'full_body' | 'accessory';
export type StyleGender = 'male' | 'female' | 'unisex';
export type StyleScope = 'platform' | 'vendor' | 'all';

export interface PlatformStyle {
  _id: string;
  name: string;
  style_code: string;
  category: StyleCategory;
  type: StyleType;
  gender: StyleGender;
  description?: string;
  image_url?: string;
  aliases?: string[];
  attributes?: string[];
  price_suggestion?: number;
  is_active: boolean;
  /** null → platform style; set → a vendor's custom style. */
  business?: string | { _id: string; business_name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlatformStyleRequest {
  name: string;
  style_code: string;
  category: StyleCategory;
  type: StyleType;
  gender?: StyleGender;
  description?: string;
  image_url?: string;
  aliases?: string[];
  attributes?: string[];
  price_suggestion?: number;
}

export interface StyleLibraryResult {
  styles: PlatformStyle[];
  grouped: Record<string, PlatformStyle[]>;
  total: number;
}

export interface BulkCreateResult {
  inserted: number;
  skipped: number;
  skipped_codes: string[];
}

interface GetStylesParams {
  scope?: StyleScope;
  include_inactive?: boolean;
  category?: string;
  search?: string;
}

/** Unwrap the response envelope down to the service payload. */
function unwrap<T>(response: unknown): T {
  let v: unknown = response;
  while (
    v &&
    typeof v === 'object' &&
    'data' in (v as Record<string, unknown>) &&
    !('styles' in (v as Record<string, unknown>)) &&
    !('inserted' in (v as Record<string, unknown>))
  ) {
    v = (v as { data: unknown }).data;
  }
  return v as T;
}

export const styleLibraryApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStyles: builder.query<StyleLibraryResult, GetStylesParams | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.scope) search.set('scope', params.scope);
        if (params?.include_inactive) search.set('include_inactive', 'true');
        if (params?.category) search.set('category', params.category);
        if (params?.search) search.set('search', params.search);
        const qs = search.toString();
        return {
          url: qs ? `/style-library?${qs}` : '/style-library',
          method: 'GET',
        };
      },
      transformResponse: (r: unknown) => unwrap<StyleLibraryResult>(r),
      providesTags: ['StyleLibrary'],
    }),

    createPlatformStyle: builder.mutation<
      PlatformStyle,
      CreatePlatformStyleRequest
    >({
      query: (body) => ({ url: '/style-library', method: 'POST', body }),
      invalidatesTags: ['StyleLibrary'],
    }),

    bulkCreatePlatformStyles: builder.mutation<
      BulkCreateResult,
      { items: CreatePlatformStyleRequest[] }
    >({
      query: (body) => ({ url: '/style-library/bulk', method: 'POST', body }),
      transformResponse: (r: unknown) => unwrap<BulkCreateResult>(r),
      invalidatesTags: ['StyleLibrary'],
    }),

    updatePlatformStyle: builder.mutation<
      PlatformStyle,
      {
        id: string;
        data: Partial<CreatePlatformStyleRequest> & { is_active?: boolean };
      }
    >({
      query: ({ id, data }) => ({
        url: `/style-library/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['StyleLibrary'],
    }),

    deactivatePlatformStyle: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/style-library/${id}`, method: 'DELETE' }),
      invalidatesTags: ['StyleLibrary'],
    }),

    regenerateStyleImages: builder.mutation<unknown, void>({
      query: () => ({
        url: '/style-library/regenerate-images',
        method: 'POST',
      }),
      invalidatesTags: ['StyleLibrary'],
    }),
  }),
});

export const {
  useGetAdminStylesQuery,
  useCreatePlatformStyleMutation,
  useBulkCreatePlatformStylesMutation,
  useUpdatePlatformStyleMutation,
  useDeactivatePlatformStyleMutation,
  useRegenerateStyleImagesMutation,
} = styleLibraryApiSlice;
