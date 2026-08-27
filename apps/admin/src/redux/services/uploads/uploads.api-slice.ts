// Uploads API Slice
// Real image-upload endpoints (multipart/form-data) from the backend Swagger:
//   POST /uploads/product  (field: file)
//   POST /uploads/profile  (field: file)
//   POST /uploads/outfits  (field: files[])
// fetchBaseQuery sets the multipart boundary automatically when the body is a
// FormData — do not set Content-Type manually.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export interface UploadedImage {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

/**
 * Both upload routes answer `{ data: { imageUrl, publicId } }`, not
 * `{ data: { url } }`. Callers read `.data.url`, so without this every upload
 * looked like it had returned no URL — the profile endpoint had no normalizer
 * at all, which is why changing a logo or banner always failed.
 */
const normalizeUpload = (
  res: {
    data?: {
      url?: string;
      imageUrl?: string;
      public_id?: string;
      publicId?: string;
      imagePublicId?: string;
    };
  } & Record<string, unknown>
): ApiResponse<UploadedImage> => {
  const d = res?.data ?? {};
  // Cloudinary hands back http:// on some accounts; a mixed-content image is
  // blocked outright by the browser.
  const url = (d.url ?? d.imageUrl ?? '').replace(/^http:\/\//, 'https://');
  return {
    ...res,
    data: {
      ...d,
      url,
      public_id: d.public_id ?? d.publicId ?? d.imagePublicId,
    },
  } as ApiResponse<UploadedImage>;
};

export const uploadsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    uploadProductImage: builder.mutation<ApiResponse<UploadedImage>, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: '/uploads/product', method: 'POST', body: form };
      },
      transformResponse: normalizeUpload,
    }),

    uploadProfileImage: builder.mutation<ApiResponse<UploadedImage>, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: '/uploads/profile', method: 'POST', body: form };
      },
      transformResponse: normalizeUpload,
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
