import { baseAPI } from "@/redux/api/base-api";

// Interfaces are examples
interface IPayload {
    countryId: string | number;
    stateId: string;
    searchKeyword: string;
}

interface IResponse {
    email: string;
    password: string;
}


const getStateCitiesBySearchApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getStateCitiesBySearch: builder.query<IResponse, IPayload>({
            query: ({ countryId, stateId, searchKeyword }) => ({
                url: `country/${countryId}/state/${stateId}/city/?name__icontains=${searchKeyword}`,
                method: 'GET',
            }),
            providesTags: ['getStateCitiesBySearch'],
        }),
    }),
});

export const {
    useGetStateCitiesBySearchQuery,
    useLazyGetStateCitiesBySearchQuery,
} = getStateCitiesBySearchApiSlice;
