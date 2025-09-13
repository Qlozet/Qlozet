import { baseAPI } from "@/redux/api/base-api";

export interface IRegisterBusinessPayload {
    name: string;
    email: string;
    phone_number: string;
    street_address: string;
    city: number | null;
    state: number | null;
    country: number | null;
    postal_code: string;
    company_url: string | null;
    company_registration_number: string | null;
    company_registration_type: string | null;
}

interface IResponse {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    street_address: string;
    city: number;
    state: number;
    country: number;
    postal_code: string;
    company_url: string | null;
    company_registration_number: string;
    company_registration_type: string;
}

const registerBusinessApiSlice = baseAPI.injectEndpoints({
    endpoints: (builder) => ({
        registerBusiness: builder.mutation<IResponse, IRegisterBusinessPayload>({
            query: (DTO) => ({
                url: `organization/business/`,
                method: "POST",
                body: DTO,
            }),
        }),
    }),
});

export const { useRegisterBusinessMutation } = registerBusinessApiSlice;
