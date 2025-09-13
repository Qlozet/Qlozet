import { baseAPI } from "@/redux/api/base-api";

// These interfaces are examples
interface IPayload {
    email: string;
    password: string;
}
interface IResponse {
    email: string;
    password: string;
}


const onboardingSessionApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        onboardingSession: builder.mutation<IResponse, IPayload>({
            query: DTO => ({
                url: `users/onboarding-session`,
                method: 'PUT',
                body: DTO,
            }),
        }),
    }),
});

export const {
    useOnboardingSessionMutation
} = onboardingSessionApiSlice;
