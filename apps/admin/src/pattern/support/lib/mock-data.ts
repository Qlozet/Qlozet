// ⚠️ MOCK / PREVIEW DATA — FOR UI TESTING ONLY.
//
// Set USE_SUPPORT_MOCKS to false (or delete this file and its imports) to return
// the Support pages to their real API data + honest empty states. This exists
// only so the implemented UI can be exercised before the backend ships the
// missing endpoints (live chat, ticket activities, admin create-ticket).

import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';
import type { LiveChatLog } from '../molecules/live-chat-columns';
import type { TicketActivity } from '../details/lib/activity-types';
import type { ChatMessage } from '../lib/chat-types';

export const USE_SUPPORT_MOCKS = true;

export const MOCK_TICKETS: Ticket[] = [
  {
    _id: 'TK-20143',
    reference: 'TK-20143',
    subject: 'Item not delivered',
    description:
      "I received my order today, but it's not what I ordered. I selected the Ankara midi-length flare dress in size 10, but what arrived is a full-length maxi gown, which is not what I can wear to the event I planned it for.\nI double-checked my order history and confirmed I selected the correct style. I've attached photos of the item I received vs. the item on the website.\nPlease advise how this can be resolved. I need the correct dress urgently or I'd prefer a refund.\nThank you.",
    user_name: 'Jane Doe',
    category: 'Order Issue',
    assigned_to: 'Chinenye Ugo',
    status: 'open',
    createdAt: 'June 26, 2025',
    due_date: 'June 26, 2025',
  },
  {
    _id: 'TK-2013-a',
    reference: '#TK-2013',
    subject: 'Item too small',
    description: 'The dress I received runs a size smaller than ordered.',
    user_name: '@jane_doe',
    category: 'Fit Issue',
    assigned_to: 'Chuka',
    status: 'resolved',
    createdAt: '2024-05-15',
    due_date: '2024-05-20',
  },
  {
    _id: 'TK-2013-b',
    reference: '#TK-2013',
    subject: 'Wrong product sent',
    description: 'A different product was shipped instead of my order.',
    user_name: 'Native Threads',
    category: 'Order Issue',
    status: 'open',
    createdAt: '2024-05-15',
    due_date: '2024-05-21',
  },
  {
    _id: 'TK-2013-c',
    reference: '2024-05-15',
    subject: "Can't update profile",
    description: 'I get an error whenever I try to update my profile details.',
    user_name: 'FabHaus',
    category: 'Technical Issue',
    status: 'open',
    createdAt: '2024-05-15',
    due_date: '2024-05-22',
  },
  {
    _id: 'TK-2013-d',
    reference: '#TK-2013',
    subject: 'Item too small',
    description: 'The shoes are tighter than the listed size.',
    user_name: '@jane_doe',
    category: 'Fit Issue',
    assigned_to: 'Chuka',
    status: 'pending',
    createdAt: '2024-05-15',
    due_date: '2024-05-23',
  },
  {
    _id: 'TK-2013-e',
    reference: '#TK-2013',
    subject: 'Item too small',
    description: 'Ordered medium, received small.',
    user_name: '@jane_doe',
    category: 'Fit Issue',
    assigned_to: 'Chuka',
    status: 'resolved',
    createdAt: '2024-05-15',
    due_date: '2024-05-24',
  },
];

export const MOCK_ACTIVITIES: TicketActivity[] = [
  {
    id: 'a1',
    actor: '@Chuka',
    action: 'Submitted ticket: "Received the wrong item — midi vs. maxi gown"',
    time: 'May 25, 2023 . 12:25pm',
  },
  {
    id: 'a2',
    actor: '@Chuka',
    action: 'Uploaded 3 attachments (photos & screenshot)',
    time: 'May 25, 2023 . 12:25pm',
    attachments: [
      'https://picsum.photos/seed/ticket1/120',
      'https://picsum.photos/seed/ticket2/120',
      'https://picsum.photos/seed/ticket3/120',
    ],
  },
  {
    id: 'a3',
    actor: 'Chinenye Ugo',
    action: 'Added internal note:',
    highlight: '"Flagged vendor listing mismatch for review"',
    time: 'May 25, 2023 . 12:25pm',
  },
  {
    id: 'a4',
    actor: 'Chinenye Ugo',
    action:
      'Replied: "Thanks for reporting. We\'re reviewing the issue with the vendor."',
    time: 'May 25, 2023 . 12:25pm',
  },
  {
    id: 'a5',
    actor: 'Franklin Eze',
    action: 'Reassigned ticket to: Vendor',
    highlight: 'Garm Island',
    time: 'May 25, 2023 . 12:25pm',
  },
  {
    id: 'a6',
    actor: 'Garm Island',
    action: 'Viewed complaint from dashboard',
    time: 'May 25, 2023 . 12:25pm',
  },
  {
    id: 'a7',
    actor: 'Garm Island',
    action:
      'Responded: "We apologize. The mix-up occurred due to warehouse error."',
    time: 'May 25, 2023 . 12:25pm',
  },
  {
    id: 'a8',
    actor: 'Chinenye Ugo',
    action: 'Offered exchange or refund to customer',
    time: 'May 25, 2023 . 12:25pm',
  },
  {
    id: 'a9',
    actor: '@Chuka',
    action: 'Accepted refund option',
    time: 'May 25, 2023 . 12:25pm',
  },
  {
    id: 'a10',
    actor: 'Chinenye Ugo',
    action: 'Marked ticket as Resolved',
    time: 'May 25, 2023 . 12:25pm',
  },
];

export const MOCK_LIVE_CHATS: LiveChatLog[] = [
  {
    _id: 'CHT-10293',
    reference: 'CHT-10293',
    last_message: "I received my order today, but it's not what I ordered....",
    user_name: '@jane_doe',
    user_type: 'Customer',
    chat_agent: 'Chuka',
    status: 'resolved',
    createdAt: '2024-05-15',
  },
  {
    _id: 'CHT-10295',
    reference: 'CHT-10295',
    last_message: "I received my order today, but it's not what I ordered....",
    user_name: 'Native Threads',
    user_type: 'Vendor',
    chat_agent: 'AI Stylist Bot',
    status: 'open',
    createdAt: '2024-05-15',
  },
  {
    _id: 'CHT-10297',
    reference: 'CHT-10297',
    last_message: 'Thank you',
    user_name: 'FabHaus',
    user_type: 'Vendor',
    chat_agent: 'AI Stylist Bot',
    status: 'open',
    createdAt: '2024-05-15',
  },
  {
    _id: 'CHT-10223',
    reference: 'CHT-10223',
    last_message: 'Okay no problem',
    user_name: '@jane_doe',
    user_type: 'User',
    chat_agent: 'AI Stylist Bot',
    status: 'pending',
    createdAt: '2024-05-15',
  },
  {
    _id: 'CHT-10193',
    reference: 'CHT-10193',
    last_message: 'Okay no problem',
    user_name: '@jane_doe',
    user_type: 'User',
    chat_agent: 'Chuka',
    status: 'resolved',
    createdAt: '2024-05-15',
  },
  {
    _id: 'CHT-10593',
    reference: 'CHT-10593',
    last_message: 'Thank you',
    user_name: '@jane_doe',
    user_type: 'User',
    chat_agent: 'Chuka',
    status: 'resolved',
    createdAt: '2024-05-15',
  },
];

const LOREM =
  'Lorem ipsum dolor sit amet, diam sapien. Porttitor dis tortor cras magnis convallis, vulputate mauris nibh tristique donec. Eros nunc pede nulla.';

export const MOCK_CHAT_THREAD: ChatMessage[] = [
  { id: 'c1', kind: 'text', direction: 'in', text: LOREM, time: '21:56' },
  { id: 'c2', kind: 'voice', direction: 'out', duration: '1:27', time: '21:56' },
  { id: 'c3', kind: 'text', direction: 'in', text: LOREM, time: '21:56' },
  { id: 'c4', kind: 'voice', direction: 'out', duration: '1:27', time: '21:56' },
  { id: 'c5', kind: 'text', direction: 'out', text: LOREM, time: '21:56' },
];
