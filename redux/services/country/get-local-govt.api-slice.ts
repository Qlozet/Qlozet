import { baseAPI } from "@/redux/api/base-api";

interface IPayload {
  countryId: string | number;
  stateId: string | number;
  offset?: number;
  limit?: number;
}

interface LocalGovernment {
  name: string;
  pk: number;
}

interface IResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LocalGovernment[];
}

const getLocalGovernmentApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getLocalGovernment: builder.query<IResponse, IPayload>({
      query: ({ countryId, stateId, offset, limit }) => ({
        url: `country/${countryId}/state/${stateId}/local_government/`,
        method: "GET",
        params: {
          offset,
          limit,
        },
      }),
      providesTags: ["getLocalGovernment"],
    }),
  }),
});

export const { useGetLocalGovernmentQuery, useLazyGetLocalGovernmentQuery } =
  getLocalGovernmentApiSlice;
