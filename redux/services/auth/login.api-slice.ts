import { baseAPI } from "@/redux/api/base-api";


const loginApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: DTO => ({
                url: `jwt/create/`,
                method: 'POST',
                body: DTO,
            }),
        }),
    }),
});

export const {
    useLoginMutation
} = loginApiSlice;
