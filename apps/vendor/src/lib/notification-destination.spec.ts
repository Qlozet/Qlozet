import { describe, expect, it } from 'vitest';
import { notificationDestination } from './notification-destination';

/**
 * Where a notification takes you.
 *
 * Before this, a vendor notification row only marked itself read — clicking
 * "a customer disputed order QLZ-2026-00841" left you to go and find that
 * order. These cover the routing decisions, which is the part worth testing;
 * the router call around them is one line.
 */
describe('notificationDestination', () => {
  const REF = 'QLZ-2026-00841';
  const PRODUCT = '65229b3a03c3c948df45e92a';

  describe('the order conversation', () => {
    it('opens the thread, not just the order', () => {
      // The whole point: a message you have to hunt for is the problem.
      expect(
        notificationDestination({
          type: 'new_message',
          metadata: { order_reference: REF },
        })
      ).toBe(`/orders?ref=${REF}&chat=1`);
    });

    it('falls back to the list when the reference is missing', () => {
      expect(
        notificationDestination({ type: 'new_message', metadata: {} })
      ).toBe('/orders');
    });
  });

  describe('disputes', () => {
    it('lands on the disputes tab, where a vendor can respond', () => {
      expect(
        notificationDestination({
          type: 'dispute_opened',
          metadata: { order_reference: REF },
        })
      ).toBe(`/orders?tab=disputes&ref=${REF}`);
    });

    it('routes a resolution the same way as an opening', () => {
      expect(
        notificationDestination({
          type: 'dispute_resolved',
          metadata: { order_reference: REF },
        })
      ).toBe(`/orders?tab=disputes&ref=${REF}`);
    });
  });

  describe('returns', () => {
    it('lands on the returns tab, where a vendor approves one', () => {
      expect(
        notificationDestination({
          type: 'return_requested',
          metadata: { order_reference: REF },
        })
      ).toBe(`/orders?tab=returns&ref=${REF}`);
    });

    it('falls back to the returns tab without a reference', () => {
      expect(notificationDestination({ type: 'return_requested' })).toBe(
        '/orders?tab=returns'
      );
    });
  });

  describe('orders', () => {
    it.each([
      'new_order',
      'order_confirmed',
      'order_cancelled',
      'order_status_changed',
      'order_shipped',
      'order_delivered',
      'preship_review',
      'preship_decision',
      'late_fulfillment_penalty',
    ])('%s opens that order', (type) => {
      expect(
        notificationDestination({ type, metadata: { order_reference: REF } })
      ).toBe(`/orders?ref=${REF}`);
    });

    it('does not add a tab param for the default tab', () => {
      const href = notificationDestination({
        type: 'new_order',
        metadata: { order_reference: REF },
      });
      expect(href).not.toContain('tab=');
    });
  });

  describe('bespoke', () => {
    it('sends a quote request to the Quote Requests tab', () => {
      // A quote request has no order yet, and the backend writes an
      // action_url of /bespoke/quotes — a route the vendor console does not
      // have. Routing by type is what keeps this off a 404.
      expect(
        notificationDestination({
          type: 'bespoke_quote_request',
          metadata: { design_id: 'abc' },
          action_url: '/bespoke/quotes',
        })
      ).toBe('/orders?tab=quotes');
    });
  });

  describe('products', () => {
    it.each([
      'low_stock',
      'new_review',
      'product_approved',
      'product_rejected',
      'product_status_changed',
    ])('%s opens that product', (type) => {
      expect(
        notificationDestination({ type, metadata: { product_id: PRODUCT } })
      ).toBe(`/product-details?id=${PRODUCT}`);
    });

    it('encodes the id rather than trusting it', () => {
      expect(
        notificationDestination({
          type: 'low_stock',
          metadata: { product_id: 'a b/c' },
        })
      ).toBe('/product-details?id=a%20b%2Fc');
    });

    it('falls back to the catalogue without an id', () => {
      expect(notificationDestination({ type: 'low_stock', metadata: {} })).toBe(
        '/products'
      );
    });
  });

  describe('money and support', () => {
    it.each(['payout_released', 'wallet_funded', 'payment_confirmed'])(
      '%s opens the wallet',
      (type) => {
        expect(notificationDestination({ type })).toBe('/wallet');
      }
    );

    it('opens the ticket itself when there is an id', () => {
      expect(
        notificationDestination({
          type: 'ticket_reply',
          metadata: { ticket_id: 'tkt_1' },
        })
      ).toBe('/support/tkt_1');
    });

    it('opens the support list without one', () => {
      expect(notificationDestination({ type: 'ticket_reply' })).toBe(
        '/support'
      );
    });

    it('sends a new team member to settings', () => {
      expect(notificationDestination({ type: 'team_member_joined' })).toBe(
        '/settings'
      );
    });
  });

  describe('safety', () => {
    it('ignores an absolute url in the payload', () => {
      // A notification is data. Data must not be able to navigate the console
      // off-site.
      expect(
        notificationDestination({
          type: 'something_new',
          action_url: 'https://evil.example.com',
        })
      ).toBeNull();
    });

    it('ignores a protocol-relative url', () => {
      expect(
        notificationDestination({
          type: 'something_new',
          action_url: '//evil.example.com',
        })
      ).toBeNull();
    });

    it('accepts an internal action_url for a type it does not know', () => {
      expect(
        notificationDestination({
          type: 'something_new',
          action_url: '/wallet',
        })
      ).toBe('/wallet');
    });
  });

  describe('falling back', () => {
    it('uses the category when the type and action_url give nothing', () => {
      expect(notificationDestination({ category: 'order' })).toBe('/orders');
      expect(notificationDestination({ category: 'product' })).toBe(
        '/products'
      );
      expect(notificationDestination({ category: 'payment' })).toBe('/wallet');
      expect(notificationDestination({ category: 'bespoke' })).toBe(
        '/orders?tab=quotes'
      );
    });

    it('returns null rather than guessing', () => {
      // A row that goes nowhere is better than one that goes somewhere wrong,
      // and the component only shows a pointer cursor when there is a
      // destination.
      expect(notificationDestination({ category: 'system' })).toBeNull();
      expect(notificationDestination({})).toBeNull();
      expect(notificationDestination(null)).toBeNull();
      expect(notificationDestination(undefined)).toBeNull();
    });

    it('ignores blank and non-string metadata values', () => {
      expect(
        notificationDestination({
          type: 'new_order',
          metadata: { order_reference: '   ' },
        })
      ).toBe('/orders');
      expect(
        notificationDestination({
          type: 'low_stock',
          metadata: { product_id: 12345 as unknown as string },
        })
      ).toBe('/products');
    });
  });
});
