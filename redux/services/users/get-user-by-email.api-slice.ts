import { baseAPI } from "@/redux/api/base-api";

interface IPayload {
  email: string;
}
interface IResponse {
  detail: string,
  partner_category: "customer" | "partner",
  organization_type: "business" | "individual"
}

const getUserByEmailApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getUserByEmail: builder.query<IResponse, IPayload>({
      query: ({ email }) => ({
        url: `users/check-email/?email=${email}`,
        method: "GET",
      }),
      providesTags: ["getUserByEmail"],
    }),
  }),
});

export const { useGetUserByEmailQuery, useLazyGetUserByEmailQuery } =
  getUserByEmailApiSlice;
