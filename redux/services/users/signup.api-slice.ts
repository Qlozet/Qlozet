import { baseAPI } from "@/redux/api/base-api";

// These interfaces are examples
interface IPayload {
    first_name: string;
    last_name: string;
    country: number | null;
    phone_number: string;
    email: string | null;
    password: string;
    organization_type?: string;
    middle_name?: string;
    partner_category?: string;
  }

interface IResponse {
    email: string;
    password: string;
}


const signUpApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        signup: builder.mutation<IResponse, IPayload>({
            query: (DTO) => ({
                url: `users/`,
                method: 'POST',
                body: DTO,
            }),
        })
    }),
});

export const {
    useSignupMutation
} = signUpApiSlice;
