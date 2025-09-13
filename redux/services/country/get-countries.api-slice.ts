import { baseAPI } from "@/redux/api/base-api";

interface Country {
    pk: number;
    name: string;
  }

// Interfaces are examples
// interface IResponse {
//     email: string;
//     password: string;
// }

interface CountriesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Country[];
  }

const getCountriesApiSlice = baseAPI.injectEndpoints({
    endpoints: (builder) => ({
      getCountries: builder.query<CountriesResponse, { offset?: number, limit?: number }>({
        query: ({ offset, limit }) => ({
          url: "country/",
          method: "GET",
          params: {
            offset,
            limit
          },
        }),
        providesTags: ["getCountries"],
      }),
    }),
  });

export const {
    useGetCountriesQuery,
    useLazyGetCountriesQuery,
} = getCountriesApiSlice;
