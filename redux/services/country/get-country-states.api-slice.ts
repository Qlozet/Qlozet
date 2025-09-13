import { baseAPI } from "@/redux/api/base-api";

// Interfaces are examples
interface IPayload {
    countryId: string | number
    offset?: number;
    limit?: number;
}

interface IResponse {
    results: {
        name: string;
        pk: number;
    }[]
    previous: string;
    next: string;
}


const getCountryStatesApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getCountryStates: builder.query<IResponse, IPayload>({
            query: ({ countryId, offset, limit }) => ({

                url: `country/${countryId}/state/`,
                method: 'GET',
                params: {
                    offset,
                    limit,
                }
            }),
            providesTags: ['getCountryStates'],
        }),
    }),
});

export const {
    useGetCountryStatesQuery,
    useLazyGetCountryStatesQuery,
} = getCountryStatesApiSlice;
