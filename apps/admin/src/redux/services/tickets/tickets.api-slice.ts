// Tickets API Slice
// RTK Query service for admin support ticket management

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

export interface TicketReply {
  _id: string;
  ticket_id: string;
  /** Author's user id. Not populated — the backend sends a bare ObjectId. */
  sender: string;
  /** Documented in Swagger (TicketReplyResponseDto) but absent from the live payload. */
  sender_type?: string;
  message: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * A support ticket, typed from the live GET /admin/tickets response — Swagger
 * documents the request params for this endpoint but no response schema.
 *
 * Two things to know about the shape:
 *  - `business` is a bare ObjectId; a vendor name has to be resolved separately
 *    (see useBusinessNames). `assigned_to` IS populated — it refs a User, and
 *    the admin who owns the ticket is read straight off the row.
 *  - `replies` is populated with full objects on the *list* endpoint but comes
 *    back as an array of id strings from GET /tickets/{id}. Normalise with
 *    `populatedReplies` instead of indexing into it.
 *
 * There is no `reference`, `subject`, `title` or `due_date` field — the UI
 * derives a display id and subject from `_id` and `description`.
 */
/** The populated `assigned_to` — a platform administrator. */
export interface TicketAssignee {
  _id: string;
  full_name?: string | null;
  email?: string | null;
}

export interface Ticket {
  _id: string;
  /** Owning business id. Resolve to a name via GET /admin/businesses. */
  business?: string;
  issue_type?: string;
  description?: string;
  attachments?: string[];
  /** Observed value: 'open'. The backend has no endpoint that changes it yet. */
  status?: string;
  /**
   * The administrator who owns the ticket, or null when nobody does.
   *
   * Populated by the backend from the User ref. Older responses (and the write
   * endpoints' echoes) can still be a bare id, so read it through
   * `assigneeId` / `assigneeName` rather than indexing into it.
   */
  assigned_to?: string | TicketAssignee | null;
  is_resolved?: boolean;
  replies?: Array<TicketReply | string>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * The subset of `replies` that arrived as full objects, newest last.
 *
 * GET /tickets/{id} returns reply *ids*, so a detail view fed only by that
 * endpoint has nothing to render; the list endpoint is currently the only
 * source of populated replies.
 */
export const populatedReplies = (ticket?: Ticket): TicketReply[] =>
  (ticket?.replies ?? []).filter(
    (reply): reply is TicketReply =>
      typeof reply === 'object' && reply !== null && 'message' in reply
  );

export interface GetTicketsParams {
  /** Matches `description` and `issue_type`. Does NOT match a ticket id. */
  search?: string;
  status?: string;
  assigned_to?: string;
  /**
   * Not in Swagger and not honoured by the backend — an unknown param is
   * ignored, so passing this returns *every* ticket rather than one customer's.
   * Kept only because the customer detail table still sends it.
   */
  customer_id?: string;
  /**
   * Compared against `createdAt` as a timestamp, so a bare 'YYYY-MM-DD' end
   * date resolves to midnight and excludes that whole day. Send full ISO
   * instants — see `toStartIso` / `toEndIso` in date-range-filter.
   */
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
}

export interface AssignTicketRequest {
  id: string;
  support_team_id: string;
}

// Mirrors CreateTicketDto — the backend accepts nothing else on create.
export interface CreateTicketRequest {
  issue_type: string;
  description: string;
  images?: string[];
}

// Mirrors UpdateTicketDto. Note there is deliberately no `status` here: the
// backend's PATCH /tickets/{id} does not accept one, so tickets can't be
// resolved from the admin app yet.
export interface UpdateTicketRequest {
  id: string;
  issue_type?: string;
  description?: string;
  images?: string[];
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

    // Get a single ticket by id
    getTicketById: builder.query<ApiResponse<Ticket>, string>({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: 'GET',
      }),
      providesTags: ['Ticket'],
    }),

    // Create a ticket
    createTicket: builder.mutation<ApiResponse<Ticket>, CreateTicketRequest>({
      query: (body) => ({
        url: '/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tickets'],
    }),

    // Update a ticket's issue type / description / images
    updateTicket: builder.mutation<ApiResponse<Ticket>, UpdateTicketRequest>({
      query: ({ id, ...body }) => ({
        url: `/tickets/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Ticket', 'Tickets'],
    }),

    // Get all tickets assigned to a support team
    getAssignedTickets: builder.query<
      ApiResponse<PaginatedData<Ticket>>,
      string
    >({
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
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useGetAssignedTicketsQuery,
  useAssignTicketMutation,
  useReplyToTicketMutation,
} = ticketsApiSlice;
