import { baseAPI } from "@/redux/api/base-api";

export interface PaymentOptions {
  id: number;
  name: string;
  lease_period: number;
  payment_schedule: string;
}

const getPaymentOptionsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentOptions: builder.query<PaymentOptions[], number>({
      query: (id) => ({
        url: `property/${id}/payment_plans/`,
        method: "GET",
        params: {
          transaction: "lease",
        },
      }),
    }),
  }),
});

export const { useGetPaymentOptionsQuery } = getPaymentOptionsApiSlice;
