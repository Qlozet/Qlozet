// Ticket activity-log model. Maps onto a future ticket-activity endpoint
// (see ticket-activities.tsx TODO(api)).

export interface TicketActivity {
  id: string;
  /** Display name of who performed the action. */
  actor: string;
  /** Avatar image URL; falls back to an initials avatar. */
  avatarUrl?: string;
  /** The action sentence, e.g. 'Submitted ticket: "Received the wrong item"'. */
  action: string;
  /** Display time, e.g. "May 25, 2023 . 12:25pm". */
  time: string;
  /** Optional highlighted note/link text rendered in the accent colour. */
  highlight?: string;
  /** Optional image attachment URLs. */
  attachments?: string[];
}
