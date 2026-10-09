/**
 * Where a notification should take you.
 *
 * Until now a vendor notification row only marked itself read — clicking one
 * did nothing else, so "a customer disputed order QLZ-2026-00841" left you to
 * find that order yourself. The backend has always carried what is needed:
 * every notification has a `type` and a `metadata` object with the id of
 * whatever it is about.
 *
 * `action_url` alone is not enough. It is written for the web app as a coarse
 * landing page — `/orders`, `/products`, `/wallet` — so it gets you to the
 * right list and no further. Routing from `type` + `metadata` is what reaches
 * the actual order or product, which is the point.
 *
 * A pure function on purpose: this is the part worth testing, and it has no
 * business knowing about routers or modals.
 */

export interface RoutableNotification {
  type?: string;
  category?: string;
  metadata?: Record<string, unknown> | null;
  action_url?: string;
}

const str = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

/**
 * Only same-app paths. An absolute URL in the payload is ignored rather than
 * followed — a notification is data, and data should not be able to navigate
 * the console off-site.
 */
const internalOnly = (path: string | null): string | null => {
  if (!path) return null;
  if (!path.startsWith('/')) return null;
  if (path.startsWith('//')) return null;
  return path;
};

/** The orders page reads these to pick a tab and open a drawer. */
const orderHref = (
  reference: string,
  opts: {
    tab?: 'orders' | 'quotes' | 'returns' | 'disputes';
    chat?: boolean;
  } = {}
): string => {
  const params = new URLSearchParams();
  if (opts.tab && opts.tab !== 'orders') params.set('tab', opts.tab);
  params.set('ref', reference);
  if (opts.chat) params.set('chat', '1');
  return `/orders?${params.toString()}`;
};

export function notificationDestination(
  notification: RoutableNotification | null | undefined
): string | null {
  if (!notification) return null;

  const meta = notification.metadata ?? {};
  const type = notification.type ?? '';
  const reference = str(meta.order_reference);
  const productId = str(meta.product_id);
  const ticketId = str(meta.ticket_id);

  switch (type) {
    // ── The order conversation ───────────────────────────────────────
    // Opens the thread itself, not just the order. A message you have to go
    // hunting for is the problem this whole feature exists to fix.
    case 'new_message':
      return reference ? orderHref(reference, { chat: true }) : '/orders';

    // ── Disputes ─────────────────────────────────────────────────────
    // The Disputes tab, because that is where a vendor responds.
    case 'dispute_opened':
    case 'dispute_resolved':
      return reference
        ? orderHref(reference, { tab: 'disputes' })
        : '/orders?tab=disputes';

    // ── Returns ──────────────────────────────────────────────────────
    // The Returns tab, which is where a vendor approves or rejects one.
    case 'return_requested':
      return reference
        ? orderHref(reference, { tab: 'returns' })
        : '/orders?tab=returns';

    // ── Orders ───────────────────────────────────────────────────────
    case 'new_order':
    case 'order_confirmed':
    case 'order_cancelled':
    case 'order_status_changed':
    case 'order_shipped':
    case 'order_delivered':
    case 'preship_review':
    case 'preship_decision':
    case 'late_fulfillment_penalty':
      return reference ? orderHref(reference) : '/orders';

    // ── Bespoke ──────────────────────────────────────────────────────
    // A quote request has no order yet — it lives on the Quote Requests tab.
    case 'bespoke_quote_request':
      return '/orders?tab=quotes';
    case 'bespoke_quote_accepted':
    case 'bespoke_quote_revision':
      return reference
        ? orderHref(reference, { tab: 'quotes' })
        : '/orders?tab=quotes';

    // ── Products ─────────────────────────────────────────────────────
    case 'low_stock':
    case 'new_review':
    case 'product_approved':
    case 'product_rejected':
    case 'product_status_changed':
    case 'product_pending_review':
      return productId
        ? `/product-details?id=${encodeURIComponent(productId)}`
        : '/products';

    // ── Money ────────────────────────────────────────────────────────
    case 'payout_released':
    case 'wallet_funded':
    case 'payment_confirmed':
    case 'wallet_payment_confirmed':
      return '/wallet';

    // ── Support ──────────────────────────────────────────────────────
    case 'ticket_reply':
    case 'ticket_assigned':
    case 'ticket_created':
      return ticketId ? `/support/${encodeURIComponent(ticketId)}` : '/support';

    // ── Team ─────────────────────────────────────────────────────────
    case 'team_member_joined':
      return '/settings';

    default:
      break;
  }

  // Nothing matched. Fall back to the backend's landing page, which is at
  // least the right area, but only if it is an internal path.
  const fallback = internalOnly(str(notification.action_url));
  if (fallback) return fallback;

  // A category is still better than nowhere.
  switch (notification.category) {
    case 'order':
    case 'shipping':
      return '/orders';
    case 'product':
      return '/products';
    case 'payment':
      return '/wallet';
    case 'bespoke':
      return '/orders?tab=quotes';
    default:
      return null;
  }
}
