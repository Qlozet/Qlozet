import { baseAPI } from "@/redux/api/base-api";

// Interfaces are examples
interface IPayload {
    q: string;
}
interface IResponse {
    email: string;
    password: string;
}


const getCountriesBySearchApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getCountriesBySearch: builder.query<IResponse, IPayload>({
            query: ({ q }) => ({
                url: `country/?name__icontains=${q}`,
                method: 'GET',
            }),
            providesTags: ['getCoutriesBySearch'],
        }),
    }),
});

export const {
    useGetCountriesBySearchQuery,
    useLazyGetCountriesBySearchQuery
} = getCountriesBySearchApiSlice;
