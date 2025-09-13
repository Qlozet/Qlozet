import { baseAPI } from "@/redux/api/base-api";

export interface IUploadPropertyMediaResponse {
  id: number;
  url: string;
  media_type: string;
}

export interface IUploadPropertyMediaPayload {
  file: File;
}

const uploadPropertyMediaApiSlice = baseAPI.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadPropertyMedia: builder.mutation<
      IUploadPropertyMediaResponse,
      IUploadPropertyMediaPayload
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("access_level", "public");

        return {
          url: `customer-profiles/media/profile-image/upload/`,
          method: "POST",
          body: formData,
          // Required for multipart/form-data
          formData: true,
          // Prevent automatic JSON stringification
        };
      },
    }),
    uploadBusinessLogo: builder.mutation<
      IUploadPropertyMediaResponse,
      IUploadPropertyMediaPayload
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("access_level", "public");
        return {
          url: `customer-profiles/media/business-logo/upload/`,
          method: "POST",
          body: formData,
          // Required for multipart/form-data
          formData: true,
          // Prevent automatic JSON stringification
        };
      },
    }),
  }),

});

export const {
  useUploadPropertyMediaMutation,
  useUploadBusinessLogoMutation,
} = uploadPropertyMediaApiSlice;
