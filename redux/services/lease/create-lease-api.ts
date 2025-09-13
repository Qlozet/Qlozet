import { baseAPI } from "@/redux/api/base-api";

export interface CreateLeaseRequest {
  property: number;
  unit: number;
  building: number;
  start_date: string | Date;
  rent_price: string | number;
  payment_plan: number;
  lease_type: string[] | null;
  // lease_period: string;
  // lease_payment_schedule: string;
  //
  customers: number[];
}

interface CreateLeaseResponse {
  id: number;
}

const createLeaseApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    createLease: builder.mutation<CreateLeaseResponse, CreateLeaseRequest>({
      query: (bodyData) => ({
        url: "lease-applications/",
        method: "POST",
        body: bodyData,
      }),
    }),
  }),
});
export const { useCreateLeaseMutation } = createLeaseApi;
