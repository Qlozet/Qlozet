// Support API Slice
// RTK Query service for support-related API operations

import type { SupportData } from '@/lib/validations/support';
import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface SupportTicketResponse {
  id: string;
  issueType: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// API Slice
export const supportApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Submit Support Ticket
    submitSupportTicket: builder.mutation<
      ApiResponse<SupportTicketResponse>,
      SupportData
    >({
      query: (data) => ({
        url: '/vendor/support',
        method: 'POST',
        body: {
          issueType: data.issueType,
          message: data.message,
        },
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    // Get Support Tickets
    getSupportTickets: builder.query<
      ApiResponse<SupportTicketResponse[]>,
      void
    >({
      query: () => ({
        url: '/vendor/support',
        method: 'GET',
      }),
      providesTags: ['SupportTicket'],
    }),

    // Get Single Support Ticket
    getSupportTicket: builder.query<ApiResponse<SupportTicketResponse>, string>(
      {
        query: (id) => ({
          url: `/vendor/support/${id}`,
          method: 'GET',
        }),
        providesTags: ['SupportTicket'],
      }
    ),
  }),
});

// Export hooks
export const {
  useSubmitSupportTicketMutation,
  useGetSupportTicketsQuery,
  useGetSupportTicketQuery,
} = supportApiSlice;
