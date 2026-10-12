import type { RoutableNotification } from './notification-destination';

/**
 * The question to put to the business assistant from a notification's "Ask"
 * button. A notification tells the vendor THAT something happened; the
 * assistant can tell them what it means and what to do, with the real
 * numbers behind it. The prompt names the specific order, product or design
 * when the payload carries it, so the assistant goes straight there.
 *
 * Returns null for notifications the assistant has no tools for (customer
 * messages, team, tickets, system notices) - no button is shown for those.
 */
export interface AskableNotification extends RoutableNotification {
  title?: string;
  body?: string;
}

const str = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export function notificationAskPrompt(
  notification: AskableNotification | null | undefined
): string | null {
  if (!notification) return null;
  const meta = notification.metadata ?? {};
  const ref =
    str(meta.order_reference) ?? str(meta.reference) ?? str(meta.order_ref);
  const product = str(meta.product_name) ?? str(meta.name);
  const design = str(meta.design_name);

  // A nudge from the platform team (an admin's note, sent as an announcement
  // with metadata.nudge). The assistant can show them exactly what the note
  // is about, by topic.
  if (meta.nudge === true) {
    const topic = str(meta.topic);
    if (topic === 'listings')
      return 'Qlozet asked me to improve my listings. What is missing from them, and which should I fix first?';
    if (topic === 'fulfilment')
      return 'Qlozet sent me a note about my orders. What is waiting on me or overdue right now?';
    const body = str(notification.body);
    return body
      ? `Qlozet sent me this note: "${body.slice(0, 200)}". What should I do about it?`
      : 'Qlozet sent me a note. What needs my attention right now?';
  }

  switch (notification.type) {
    case 'new_order':
      return ref
        ? `Tell me about order ${ref} and what I need to do next.`
        : 'What new orders do I have, and what do they need from me?';
    case 'order_confirmed':
      return ref
        ? `Order ${ref} is confirmed. What is its ship-by deadline and what should I prepare?`
        : null;
    case 'order_cancelled':
      return ref
        ? `Order ${ref} was cancelled. What happened, and does it affect my success rate?`
        : 'Which of my orders were cancelled recently, and why?';
    case 'order_status_changed':
    case 'order_shipped':
    case 'order_delivered':
      return ref ? `Where does order ${ref} stand right now?` : null;
    case 'late_fulfillment_penalty':
      return ref
        ? `I was penalised on order ${ref}. How much, why, and how do I avoid it next time?`
        : 'Why was I penalised for late fulfilment, and how do I avoid it?';
    case 'payment_confirmed':
    case 'wallet_payment_confirmed':
      return ref
        ? `Payment came through on order ${ref}. What do I need to do now?`
        : null;
    case 'payout_released':
      return 'How much was just released to me, and what is still pending?';
    case 'low_stock':
      return product
        ? `${product} is low on stock. What else is running low, and what should I restock first?`
        : 'What is low or out of stock, and what should I restock first?';
    case 'new_review':
      return product
        ? `What did the latest review of ${product} say, and how are my reviews overall?`
        : 'What do my latest reviews say?';
    case 'bespoke_quote_request':
      return design
        ? `Show me the quote request for "${design}" and help me price it.`
        : 'Which quote requests are waiting for me?';
    case 'bespoke_quote_revision':
      return design
        ? `The customer asked for a revision on "${design}". What changed, and what should I quote now?`
        : 'Which quotes need a revision from me?';
    case 'bespoke_quote_accepted':
      return design
        ? `My quote for "${design}" was accepted. What is the deadline and what happens next?`
        : 'Which of my quotes were accepted, and what are their deadlines?';
    case 'preship_review':
    case 'preship_decision':
      return ref
        ? `What is the pre-ship status on order ${ref}, and what do I do next?`
        : 'Which bespoke orders are waiting on pre-ship review?';
    case 'dispute_opened':
      return ref
        ? `A dispute was opened on order ${ref}. What is it about, and how should I respond?`
        : 'Which disputes are open and need my response?';
    case 'dispute_resolved':
      return ref
        ? `How was the dispute on order ${ref} resolved, and what does it mean for my earnings?`
        : null;
    case 'return_requested':
      return ref
        ? `A return was requested on order ${ref}. What is the reason, and what are my options?`
        : 'Which returns are waiting for my decision?';
    case 'product_rejected':
      return product
        ? `${product} was rejected. What does its listing need before I resubmit?`
        : 'Why was my product rejected, and what should I fix?';
    case 'product_approved':
      return product
        ? `${product} is live. What is missing from its listing that would help it sell?`
        : null;
    case 'product_status_changed':
      return product
        ? `What changed on ${product}, and does it affect how often shoppers see it?`
        : null;
    default:
      return null;
  }
}
