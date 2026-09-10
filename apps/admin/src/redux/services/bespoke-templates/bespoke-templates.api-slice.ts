// Bespoke Templates API Slice
// Admin CRUD over platform-curated studio starting points, plus the shared
// AI generation pipeline (platform users generate free — the backend skips
// the token charge for them).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export interface BespokeTemplate {
  _id: string;
  name: string;
  category: string;
  gender: 'men' | 'women';
  design_images: string[];
  /** Same JSON contract as a design's description: { selections, userPrompt } */
  description?: string | null;
  status: 'active' | 'inactive';
  uses: number;
  created_by?:
    | { _id: string; full_name?: string; email?: string }
    | string
    | null;
  createdAt?: string;
  updatedAt?: string;
}

export type SaveTemplateRequest = Partial<
  Pick<
    BespokeTemplate,
    'name' | 'category' | 'gender' | 'design_images' | 'description' | 'status'
  >
>;

/** Shape of GET /measurements/job/:id — status flips to completed/failed. */
export interface GenerationJob {
  job_id?: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: { image_url?: string; fileUrl?: string; [k: string]: unknown };
  error?: string;
}

export const bespokeTemplatesApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getBespokeTemplates: builder.query<ApiResponse<BespokeTemplate[]>, void>({
      query: () => ({ url: '/admin/bespoke/templates', method: 'GET' }),
      providesTags: ['BespokeTemplates'],
    }),

    getBespokeTemplate: builder.query<ApiResponse<BespokeTemplate>, string>({
      query: (id) => ({ url: `/admin/bespoke/templates/${id}`, method: 'GET' }),
      providesTags: (r, e, id) => [{ type: 'BespokeTemplates', id }],
    }),

    createBespokeTemplate: builder.mutation<
      ApiResponse<BespokeTemplate>,
      SaveTemplateRequest
    >({
      query: (body) => ({
        url: '/admin/bespoke/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BespokeTemplates'],
    }),

    updateBespokeTemplate: builder.mutation<
      ApiResponse<BespokeTemplate>,
      { id: string; data: SaveTemplateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/admin/bespoke/templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (r, e, { id }) => [
        'BespokeTemplates',
        { type: 'BespokeTemplates', id },
      ],
    }),

    deleteBespokeTemplate: builder.mutation<
      ApiResponse<{ _id: string }>,
      string
    >({
      query: (id) => ({
        url: `/admin/bespoke/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BespokeTemplates'],
    }),

    // ── AI generation (same pipeline the shop studio uses) ──
    generateTemplateOutfit: builder.mutation<
      ApiResponse<{ jobId?: string; job_id?: string }>,
      {
        config: Record<string, unknown>;
        userPrompt?: string;
        reference_image_urls?: string[];
      }
    >({
      query: (body) => ({
        url: '/measurements/generate-outfit',
        method: 'POST',
        body,
      }),
    }),

    getGenerationJob: builder.query<ApiResponse<GenerationJob>, string>({
      query: (jobId) => ({ url: `/measurements/job/${jobId}`, method: 'GET' }),
      // Polled — never cache.
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetBespokeTemplatesQuery,
  useGetBespokeTemplateQuery,
  useCreateBespokeTemplateMutation,
  useUpdateBespokeTemplateMutation,
  useDeleteBespokeTemplateMutation,
  useGenerateTemplateOutfitMutation,
  useLazyGetGenerationJobQuery,
} = bespokeTemplatesApiSlice;
