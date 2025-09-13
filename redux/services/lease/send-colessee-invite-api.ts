import { baseAPI } from "@/redux/api/base-api";

export interface Coleasee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}
export interface ColeaseeRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

interface SendColesseePayload {
  id: number;
  colessee: ColeaseeRequest[];
}
interface SendColesseeResponse {
  id: number;
}

const sendColesseeInvite = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    sendColessee: builder.mutation<SendColesseeResponse, SendColesseePayload>({
      query: ({ colessee, id }) => ({
        url: `customer-profiles/${id}/send_colessee_invites/`,
        method: "POST",
        body: [...colessee],
      }),
    }),
  }),
});

export const { useSendColesseeMutation } = sendColesseeInvite;
