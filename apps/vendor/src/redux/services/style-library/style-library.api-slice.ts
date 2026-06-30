import { baseAPI } from '@/redux/api/base-api';

export interface BaseApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface StyleLibraryItem {
  _id: string;
  name: string;
  style_code: string;
  category: string;
  type: string;
  gender: string;
  description?: string;
  image_url?: string;
  aliases?: string[];
  attributes?: string[];
  price_suggestion?: number;
  is_active: boolean;
  business?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetStyleLibraryResponse {
  styles: StyleLibraryItem[];
  grouped: Record<string, StyleLibraryItem[]>;
  total: number;
}

export interface CreateVendorStylePayload {
  name: string;
  style_code: string;
  category: string;
  type: string;
  gender?: string;
  description?: string;
  image_url?: string;
  aliases?: string[];
  attributes?: string[];
  price_suggestion?: number;
}

export interface GenerateStyleImagePayload {
  name: string;
  category: string;
  description?: string;
}

export interface GenerateStyleImageResponse {
  message: string;
  url: string;
  tokens_deducted: number;
  remaining_balance: number;
}

export const styleLibraryApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getStyleLibrary: builder.query<GetStyleLibraryResponse, void>({
      query: () => '/style-library',
      transformResponse: (response: BaseApiResponse<GetStyleLibraryResponse>) => response.data,
      providesTags: ['StyleLibrary'],
    }),

    createVendorStyle: builder.mutation<StyleLibraryItem, CreateVendorStylePayload>({
      query: (body) => ({
        url: '/style-library/vendor',
        method: 'POST',
        body,
      }),
      transformResponse: (response: BaseApiResponse<StyleLibraryItem>) => response.data,
      invalidatesTags: ['StyleLibrary'],
    }),

    deleteVendorStyle: builder.mutation<void, string>({
      query: (id) => ({
        url: `/style-library/vendor/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StyleLibrary'],
    }),

    generateStyleImage: builder.mutation<GenerateStyleImageResponse, GenerateStyleImagePayload>({
      query: (body) => ({
        url: '/products/clothing/styles/generate-image',
        method: 'POST',
        body,
      }),
      transformResponse: (response: BaseApiResponse<GenerateStyleImageResponse>) => response.data,
    }),
  }),
});

export const {
  useGetStyleLibraryQuery,
  useLazyGetStyleLibraryQuery,
  useCreateVendorStyleMutation,
  useDeleteVendorStyleMutation,
  useGenerateStyleImageMutation,
} = styleLibraryApiSlice;
