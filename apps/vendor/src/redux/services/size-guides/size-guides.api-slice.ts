// Size Guides API Slice
// RTK Query service for the Qlozet Size Guide domain.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

// ─── Types ───────────────────────────────────────────────────────────

export interface SizeGuideCondition {
  field: string;
  operator: string;
  value: string;
}

export interface SizeMeasurementRange {
  body_part: string;
  min: number;
  max: number;
}

export interface SizeEntry {
  label: string;
  sort_order: number;
  measurements: SizeMeasurementRange[];
}

export interface FitAllowance {
  body_part: string;
  value: number;
}

export interface FitType {
  name: string;
  label: string;
  description?: string;
  allowances: FitAllowance[];
}

export interface SizeGuide {
  _id: string;
  title: string;
  description?: string;
  business: string;
  unit: 'cm' | 'inch';
  body_parts: string[];
  sizes: SizeEntry[];
  fit_types: FitType[];
  condition_match: 'all' | 'any';
  conditions: SizeGuideCondition[];
  manual_includes: string[];
  manual_excludes: string[];
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSizeGuideRequest {
  title: string;
  description?: string;
  unit: 'cm' | 'inch';
  body_parts: string[];
  sizes: SizeEntry[];
  fit_types?: FitType[];
  condition_match?: 'all' | 'any';
  conditions?: SizeGuideCondition[];
  is_active?: boolean;
}

export type UpdateSizeGuideRequest = Partial<CreateSizeGuideRequest>;

// ─── API Slice ───────────────────────────────────────────────────────

export const sizeGuidesApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /size-guides — all vendor's size guides
    getSizeGuides: builder.query<ApiResponse<SizeGuide[]>, void>({
      query: () => ({ url: '/size-guides', method: 'GET' }),
      providesTags: ['SizeGuides'],
    }),

    // GET /size-guides/:id — single size guide
    getSizeGuide: builder.query<ApiResponse<SizeGuide>, string>({
      query: (id) => ({ url: `/size-guides/${id}`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'SizeGuide', id }],
    }),

    // POST /size-guides — create
    createSizeGuide: builder.mutation<
      ApiResponse<SizeGuide>,
      CreateSizeGuideRequest
    >({
      query: (body) => ({ url: '/size-guides', method: 'POST', body }),
      invalidatesTags: ['SizeGuides'],
    }),

    // PATCH /size-guides/:id — update
    updateSizeGuide: builder.mutation<
      ApiResponse<SizeGuide>,
      { id: string } & UpdateSizeGuideRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/size-guides/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        'SizeGuides',
        { type: 'SizeGuide', id },
      ],
    }),

    // DELETE /size-guides/:id
    deleteSizeGuide: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/size-guides/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SizeGuides'],
    }),

    // POST /size-guides/:id/include/:productId
    includeSizeGuideProduct: builder.mutation<
      ApiResponse<{ message: string }>,
      { guideId: string; productId: string }
    >({
      query: ({ guideId, productId }) => ({
        url: `/size-guides/${guideId}/include/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['SizeGuides'],
    }),

    // POST /size-guides/:id/exclude/:productId
    excludeSizeGuideProduct: builder.mutation<
      ApiResponse<{ message: string }>,
      { guideId: string; productId: string }
    >({
      query: ({ guideId, productId }) => ({
        url: `/size-guides/${guideId}/exclude/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['SizeGuides'],
    }),

    // POST /size-guides/apply/:id — manually trigger re-evaluation
    applySizeGuide: builder.mutation<
      ApiResponse<{ message: string }>,
      string
    >({
      query: (id) => ({ url: `/size-guides/apply/${id}`, method: 'POST' }),
      invalidatesTags: ['SizeGuides'],
    }),

    // GET /size-guides/body-parts — supported body parts
    getBodyParts: builder.query<
      ApiResponse<{ body_parts: string[] }>,
      void
    >({
      query: () => ({ url: '/size-guides/body-parts', method: 'GET' }),
    }),
  }),
});

// ─── Hooks ───────────────────────────────────────────────────────────

export const {
  useGetSizeGuidesQuery,
  useGetSizeGuideQuery,
  useCreateSizeGuideMutation,
  useUpdateSizeGuideMutation,
  useDeleteSizeGuideMutation,
  useIncludeSizeGuideProductMutation,
  useExcludeSizeGuideProductMutation,
  useApplySizeGuideMutation,
  useGetBodyPartsQuery,
} = sizeGuidesApiSlice;
