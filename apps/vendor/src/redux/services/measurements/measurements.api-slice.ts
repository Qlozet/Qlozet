// Measurements API Slice
// RTK Query service for the Qlozet "Measurements" tag: saved measurement sets
// and the AI body-measurement / outfit-generation pipeline.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

// MeasurementInputDto / MeasurementDto
export interface MeasurementValues {
  waist: number;
  hip: number;
  bicep: number;
  calf: number;
  chest: number;
  forearm: number;
  height: number;
  leg_length: number;
  shoulder_breadth: number;
  shoulder_to_crotch: number;
  thigh: number;
  wrist: number;
  ankle: number;
  arm_length: number;
}

// AddMeasurementSetDto
export interface AddMeasurementSetRequest {
  name?: string;
  unit: 'cm' | 'inch';
  measurements: MeasurementValues;
}

// ActiveMeasurementSetDto
export interface MeasurementSet {
  full_name: string;
  email: string;
  phone_number: string;
  name: string;
  unit: 'cm' | 'inch';
  measurements: MeasurementValues;
  active: boolean;
  createdAt: string;
}

// RunPredictBodyDto
export interface RunPredictionRequest {
  height_cm?: number;
  weight?: number;
  gender: 'male' | 'female';
  notes?: string;
}

// AutoMaskSwaggerDto
export interface AutoMaskRequest {
  bg: string;
  front: string;
  side: string;
  notes?: string;
  weight?: number;
  height_cm?: number;
  gender?: string;
}

// EditGarmentDto
export interface EditGarmentRequest {
  base_image_url?: string;
  fabric_image_url?: string;
  accessory_image_url?: string;
  addon_image_url?: string;
  garment_type?: string;
  base_color?: string;
  pattern?: string;
  fit?: string;
  style_notes?: string;
  metadata_json?: Record<string, unknown>;
}

// VideoPipelineSwaggerDto
export interface VideoPipelineRequest {
  video_url: string;
  title: string;
  weight: number;
  height_cm: number;
  gender: string;
  method: string;
  mp_t?: number;
  want_back?: boolean;
  want_mesh_flag?: boolean;
}

export interface JobStatus {
  job_id: string;
  status?: string;
  result?: unknown;
  [key: string]: unknown;
}

// ---- API Slice ----
export const measurementsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /measurements/users/sets — all saved sets
    getMeasurementSets: builder.query<ApiResponse<MeasurementSet[]>, void>({
      query: () => ({ url: '/measurements/users/sets', method: 'GET' }),
      providesTags: ['MeasurementSets'],
    }),

    // GET /measurements/users/active — active set
    getActiveMeasurementSet: builder.query<ApiResponse<MeasurementSet>, void>({
      query: () => ({ url: '/measurements/users/active', method: 'GET' }),
      providesTags: ['MeasurementSet'],
    }),

    // GET /measurements/users/sets/{name}
    getMeasurementSet: builder.query<ApiResponse<MeasurementSet>, string>({
      query: (name) => ({
        url: `/measurements/users/sets/${encodeURIComponent(name)}`,
        method: 'GET',
      }),
      providesTags: ['MeasurementSet'],
    }),

    // POST /measurements/users — add a new set
    addMeasurementSet: builder.mutation<
      ApiResponse<MeasurementSet>,
      AddMeasurementSetRequest
    >({
      query: (body) => ({ url: '/measurements/users', method: 'POST', body }),
      invalidatesTags: ['MeasurementSets', 'MeasurementSet'],
    }),

    // DELETE /measurements/users/sets/{name}
    deleteMeasurementSet: builder.mutation<ApiResponse<null>, string>({
      query: (name) => ({
        url: `/measurements/users/sets/${encodeURIComponent(name)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MeasurementSets'],
    }),

    // PATCH /measurements/users/sets/{name}/activate
    activateMeasurementSet: builder.mutation<ApiResponse<MeasurementSet>, string>({
      query: (name) => ({
        url: `/measurements/users/sets/${encodeURIComponent(name)}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['MeasurementSets', 'MeasurementSet'],
    }),

    // ---- AI pipeline ----

    // POST /measurements/run-prediction
    runMeasurementPrediction: builder.mutation<
      ApiResponse<JobStatus>,
      RunPredictionRequest
    >({
      query: (body) => ({
        url: '/measurements/run-prediction',
        method: 'POST',
        body,
      }),
    }),

    // POST /measurements/auto-mask-prediction
    runAutoMaskPrediction: builder.mutation<ApiResponse<JobStatus>, AutoMaskRequest>({
      query: (body) => ({
        url: '/measurements/auto-mask-prediction',
        method: 'POST',
        body,
      }),
    }),

    // POST /measurements/avatar
    generateAvatar: builder.mutation<ApiResponse<JobStatus>, Record<string, unknown>>({
      query: (body) => ({ url: '/measurements/avatar', method: 'POST', body }),
    }),

    // POST /measurements/edit-garment-image
    editGarmentImage: builder.mutation<ApiResponse<JobStatus>, EditGarmentRequest>({
      query: (body) => ({
        url: '/measurements/edit-garment-image',
        method: 'POST',
        body,
      }),
    }),

    // POST /measurements/generate-outfit
    generateOutfit: builder.mutation<
      ApiResponse<JobStatus>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: '/measurements/generate-outfit',
        method: 'POST',
        body,
      }),
    }),

    // POST /measurements/video-pipeline
    runVideoPipeline: builder.mutation<ApiResponse<JobStatus>, VideoPipelineRequest>({
      query: (body) => ({
        url: '/measurements/video-pipeline',
        method: 'POST',
        body,
      }),
    }),

    // GET /measurements/job/{job_id}
    getMeasurementJob: builder.query<ApiResponse<JobStatus>, string>({
      query: (jobId) => ({ url: `/measurements/job/${jobId}`, method: 'GET' }),
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetMeasurementSetsQuery,
  useGetActiveMeasurementSetQuery,
  useGetMeasurementSetQuery,
  useAddMeasurementSetMutation,
  useDeleteMeasurementSetMutation,
  useActivateMeasurementSetMutation,
  useRunMeasurementPredictionMutation,
  useRunAutoMaskPredictionMutation,
  useGenerateAvatarMutation,
  useEditGarmentImageMutation,
  useGenerateOutfitMutation,
  useRunVideoPipelineMutation,
  useGetMeasurementJobQuery,
  useLazyGetMeasurementJobQuery,
} = measurementsApiSlice;
