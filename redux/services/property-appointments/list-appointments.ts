import { baseAPI } from "@/redux/api/base-api";

// Appointment item type
export interface Appointment {
  id: number;
  visit_code: string;
  property_unit_name: string;
  customer_name: string;
  transaction_type: string;
  date: string;
  time: string;
  assigned_agent: string;
  fee_status: string;
  amount: number | null;
  status: string;
  status_display: string;
}

// Paginated response type
export interface AppointmentsResponse {
  limit: number;
  offset: number;
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}

const listAppointmentsSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    listAppointments: builder.query<
      AppointmentsResponse,
      void
    >({
      query: () => ({
        url: "/appointments",
        method: "GET",
      }),
      providesTags: ["listAppointments"],
    }),
  }),
});

export const { useListAppointmentsQuery } = listAppointmentsSlice;
