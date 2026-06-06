// Uploads API Slice
// Real image-upload endpoints (multipart/form-data) from the backend Swagger:
//   POST /uploads/product  (field: file)
//   POST /uploads/profile  (field: file)
//   POST /uploads/outfits  (field: files[])
// fetchBaseQuery sets the multipart boundary automatically when the body is a
// FormData — do not set Content-Type manually.

import { baseAPI } from '../../api/base-api';
import { ApiResponse } from '../types';

export interface UploadedImage {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

export const uploadsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    uploadProductImage: builder.mutation<ApiResponse<UploadedImage>, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: '/uploads/product', method: 'POST', body: form };
      },
    }),

    uploadProfileImage: builder.mutation<ApiResponse<UploadedImage>, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: '/uploads/profile', method: 'POST', body: form };
      },
    }),

    uploadOutfitImages: builder.mutation<ApiResponse<UploadedImage[]>, File[]>({
      query: (files) => {
        const form = new FormData();
        files.forEach((file) => form.append('files', file));
        return { url: '/uploads/outfits', method: 'POST', body: form };
      },
    }),
  }),
});

export const {
  useUploadProductImageMutation,
  useUploadProfileImageMutation,
  useUploadOutfitImagesMutation,
} = uploadsApiSlice;
