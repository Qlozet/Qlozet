// Assistant API Slice
// RTK Query service for the vendor business-analytics assistant (chat + digest).

import { baseAPI } from '@/redux/api/base-api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Inline chart the assistant chose to render with an answer.
export interface AssistantChart {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: { label: string; value: number }[];
}

export type AssistantActionKind =
  | 'confirm_order'
  | 'reply_to_quote'
  | 'update_stock'
  | 'create_discount';

export type AssistantActionStatus =
  | 'proposed'
  | 'executed'
  | 'failed'
  | 'cancelled'
  | 'expired';

// An action the assistant PREPARED. Nothing runs until the vendor confirms it
// from the card; the status here is what the card shows.
export interface AssistantAction {
  action_id: string;
  kind: AssistantActionKind;
  title: string;
  summary: string;
  details: { label: string; value: string }[];
  status: AssistantActionStatus;
  result_text?: string | null;
  error?: string | null;
  expires_at?: string;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  tools_used?: string[];
  charts?: AssistantChart[];
  actions?: AssistantAction[];
  createdAt?: string;
}

export interface ChatResult {
  conversation_id: string;
  answer: string;
  charts: AssistantChart[];
  actions?: AssistantAction[];
  tools_used: string[];
}

export interface ConversationSummary {
  _id: string;
  title: string;
  last_message_at: string;
  createdAt: string;
}

export interface ConversationDetail {
  _id: string;
  title: string;
  messages: AssistantMessage[];
  last_message_at: string;
}

export interface DigestRecommendation {
  label: string;
  detail: string;
  action: string;
}

export interface WeeklyDigest {
  _id: string;
  summary: string;
  recommendations: DigestRecommendation[];
  metrics: Record<string, any>;
  period_key: string;
  read: boolean;
  createdAt: string;
}

export interface LatestDigestResult {
  digest: WeeklyDigest | null;
  unread: number;
}

export const assistantApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Ask a question. Starts a new conversation when conversation_id is omitted.
    sendChat: builder.mutation<
      ApiResponse<ChatResult>,
      { message: string; conversation_id?: string }
    >({
      query: (body) => ({ url: '/assistant/chat', method: 'POST', body }),
      invalidatesTags: ['AssistantConversations', 'AssistantConversation'],
    }),

    // The vendor's decision on a prepared action. Confirm executes it server
    // side through the same services the dashboard uses.
    confirmAssistantAction: builder.mutation<
      ApiResponse<AssistantAction>,
      string
    >({
      query: (id) => ({
        url: `/assistant/actions/${id}/confirm`,
        method: 'POST',
      }),
      // An executed action changed orders, stock or discounts: the pages
      // showing them must refetch, not wait for a reload.
      invalidatesTags: [
        'AssistantConversation',
        'Order',
        'Orders',
        'OrderStats',
        'Product',
        'Products',
        'ProductDetails',
        'Discount',
        'Discounts',
        'DashboardMetrics',
      ],
    }),

    cancelAssistantAction: builder.mutation<
      ApiResponse<AssistantAction>,
      string
    >({
      query: (id) => ({
        url: `/assistant/actions/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['AssistantConversation'],
    }),

    getConversations: builder.query<
      ApiResponse<{ total: number; items: ConversationSummary[] }>,
      { page?: number; size?: number } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.page) sp.set('page', String(params.page));
        if (params?.size) sp.set('size', String(params.size));
        const qs = sp.toString();
        return {
          url: `/assistant/conversations${qs ? `?${qs}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['AssistantConversations'],
    }),

    getConversation: builder.query<ApiResponse<ConversationDetail>, string>({
      query: (id) => ({ url: `/assistant/conversations/${id}`, method: 'GET' }),
      providesTags: ['AssistantConversation'],
    }),

    getLatestDigest: builder.query<ApiResponse<LatestDigestResult>, void>({
      query: () => ({ url: '/assistant/digest/latest', method: 'GET' }),
      providesTags: ['AssistantDigest'],
    }),

    markDigestRead: builder.mutation<ApiResponse<WeeklyDigest>, string>({
      query: (id) => ({ url: `/assistant/digest/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['AssistantDigest'],
    }),
  }),
});

export const {
  useSendChatMutation,
  useConfirmAssistantActionMutation,
  useCancelAssistantActionMutation,
  useGetConversationsQuery,
  useGetConversationQuery,
  useLazyGetConversationQuery,
  useGetLatestDigestQuery,
  useMarkDigestReadMutation,
} = assistantApiSlice;
