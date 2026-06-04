// Tickets API Slice
// RTK Query service for the Qlozet "Tickets" tag (vendor support tickets).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

export interface Ticket {
  _id: string;
  issue_type?: string;
  description?: string;
  status?: string;
  assigned_to?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// CreateTicketDto
export interface CreateTicketRequest {
  issue_type: string;
  description: string;
  images?: string[];
}

// UpdateTicketDto
export interface UpdateTicketRequest {
  issue_type?: string;
  description?: string;
  images?: string[];
}

export interface GetTicketsParams {
  search?: string;
  status?: string;
  assigned_to?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
}

// ---- API Slice ----
export const ticketsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /tickets — paginated tickets with filters
    getTickets: builder.query<
      ApiResponse<PaginatedData<Ticket>>,
      GetTicketsParams | void
    >({
      query: (params) => ({
        url: `/tickets${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Tickets'],
    }),

    // GET /tickets/{id}
    getTicket: builder.query<ApiResponse<Ticket>, string>({
      query: (id) => ({ url: `/tickets/${id}`, method: 'GET' }),
      providesTags: ['Ticket'],
    }),

    // POST /tickets — vendor creates a ticket
    createTicket: builder.mutation<ApiResponse<Ticket>, CreateTicketRequest>({
      query: (body) => ({ url: '/tickets', method: 'POST', body }),
      invalidatesTags: ['Tickets'],
    }),

    // PATCH /tickets/{id} — update a ticket
    updateTicket: builder.mutation<
      ApiResponse<Ticket>,
      { id: string; data: UpdateTicketRequest }
    >({
      query: ({ id, data }) => ({
        url: `/tickets/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Ticket', 'Tickets'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
} = ticketsApiSlice;
