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

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  tools_used?: string[];
  charts?: AssistantChart[];
  createdAt?: string;
}

export interface ChatResult {
  conversation_id: string;
  answer: string;
  charts: AssistantChart[];
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
  useGetConversationsQuery,
  useGetConversationQuery,
  useLazyGetConversationQuery,
  useGetLatestDigestQuery,
  useMarkDigestReadMutation,
} = assistantApiSlice;
