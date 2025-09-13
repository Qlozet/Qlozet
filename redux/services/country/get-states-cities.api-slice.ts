import { baseAPI } from "@/redux/api/base-api";

// Interfaces are examples
interface IPayload {
    countryId: string | number;
    stateId: string
    offset?: number;
    limit?: number;
}

interface IGetCitiesResponse {
    results: {
        name: string;
        pk: number;
    }[]
    previous: string;
    next: string;
}

const getStatesCitiesApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getStatesCities: builder.query<IGetCitiesResponse, IPayload>({
            query: ({ countryId, stateId, offset, limit }) => {
                return {
                    url: `country/${countryId}/state/${stateId}/city/`,
                    method: 'GET',
                    params: {
                        offset,
                        limit
                      },
                };
            },
            providesTags: ['getStatesCities'],
        }),
    }),
});

export const {
    useGetStatesCitiesQuery,
    useLazyGetStatesCitiesQuery,
} = getStatesCitiesApiSlice;
