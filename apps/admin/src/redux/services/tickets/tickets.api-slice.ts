// Tickets API Slice
// RTK Query service for admin support ticket management

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

export interface Ticket {
  _id: string;
  reference?: string;
  ticket_id?: string;
  subject?: string;
  title?: string;
  description?: string;
  message?: string;
  status?: string;
  assigned_to?: string;
  customer_id?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface TicketReply {
  _id: string;
  ticket_id: string;
  sender: string;
  sender_type: string;
  message: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetTicketsParams {
  search?: string;
  status?: string;
  assigned_to?: string;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
}

export interface AssignTicketRequest {
  id: string;
  support_team_id: string;
}

export interface ReplyToTicketRequest {
  ticket_id: string;
  message: string;
  attachments?: string[];
}

// API Slice
export const ticketsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated tickets with filters
    getTickets: builder.query<
      ApiResponse<PaginatedData<Ticket>>,
      GetTicketsParams | void
    >({
      query: (params) => ({
        url: `/admin/tickets${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Tickets'],
    }),

    // Get all tickets assigned to a support team
    getAssignedTickets: builder.query<ApiResponse<PaginatedData<Ticket>>, string>({
      query: (teamId) => ({
        url: `/admin/assigned/${teamId}`,
        method: 'GET',
      }),
      providesTags: ['Tickets'],
    }),

    // Assign a ticket to a support team
    assignTicket: builder.mutation<ApiResponse<Ticket>, AssignTicketRequest>({
      query: ({ id, support_team_id }) => ({
        url: `/admin/${id}/assign`,
        method: 'PATCH',
        body: { support_team_id },
      }),
      invalidatesTags: ['Ticket', 'Tickets'],
    }),

    // Reply to a ticket (vendor/admin/support)
    replyToTicket: builder.mutation<
      ApiResponse<TicketReply>,
      ReplyToTicketRequest
    >({
      query: ({ ticket_id, ...body }) => ({
        url: `/admin/${ticket_id}/reply`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ticket', 'Tickets'],
    }),
  }),
});

// Export hooks
export const {
  useGetTicketsQuery,
  useGetAssignedTicketsQuery,
  useAssignTicketMutation,
  useReplyToTicketMutation,
} = ticketsApiSlice;
