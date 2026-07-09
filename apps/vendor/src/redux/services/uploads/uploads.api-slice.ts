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
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/uploads/product',
          method: 'POST',
          body: formData,
          // Let browser set Content-Type with boundary — do NOT set it manually
          formData: true,
        };
      },
      transformResponse: (response: any) => {
        if (response?.data?.imageUrl) {
          response.data = {
            url: response.data.imageUrl.replace(/^http:\/\//i, 'https://'),
            public_id: response.data.publicId
          };
        }
        return response;
      }
    }),

    uploadProfileImage: builder.mutation<ApiResponse<UploadedImage>, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/uploads/profile',
          method: 'POST',
          body: formData,
          // Let browser set Content-Type with boundary — do NOT set it manually
          formData: true,
        };
      },
      transformResponse: (response: any) => {
        if (response?.data?.imageUrl) {
          response.data = {
            url: response.data.imageUrl.replace(/^http:\/\//i, 'https://'),
            public_id: response.data.publicId
          };
        }
        return response;
      }
    }),

    uploadOutfitImages: builder.mutation<ApiResponse<UploadedImage[]>, File[]>({
      query: (files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        return {
          url: '/uploads/outfits',
          method: 'POST',
          body: formData,
          // Let browser set Content-Type with boundary — do NOT set it manually
          formData: true,
        };
      },
      transformResponse: (response: any) => {
        if (Array.isArray(response?.data)) {
          response.data = response.data.map((item: any) => ({
            url: (item.imageUrl || item.url || '').replace(/^http:\/\//i, 'https://'),
            public_id: item.publicId || item.public_id
          }));
        }
        return response;
      }
    }),
  }),
});

export const {
  useUploadProductImageMutation,
  useUploadProfileImageMutation,
  useUploadOutfitImagesMutation,
} = uploadsApiSlice;
