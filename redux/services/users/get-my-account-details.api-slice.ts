import { baseAPI } from "@/redux/api/base-api";

// Interfaces are examples
interface IResponse {
  first_name: string;
  last_name: string;
  email: string;
  profile_type: string;
  id: number;
}

const getMyAccountDetailsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getMyAccountDetails: builder.query<IResponse, void>({
      query: (bodyData) => ({
        url: "customer-profiles/me/",
        method: "GET",
        body: bodyData,
      }),
      providesTags: ["getMyAccountDetails"],
    }),
  }),
});

export const { useGetMyAccountDetailsQuery, useLazyGetMyAccountDetailsQuery } =
  getMyAccountDetailsApiSlice;
