import { describe, expect, it } from 'vitest';
import { notificationAskPrompt } from './notification-ask';

describe('notificationAskPrompt', () => {
  it('names the specific order, product or design when the payload carries it', () => {
    expect(
      notificationAskPrompt({
        type: 'new_order',
        metadata: { order_reference: 'QLZ-1' },
      })
    ).toBe('Tell me about order QLZ-1 and what I need to do next.');
    expect(
      notificationAskPrompt({
        type: 'low_stock',
        metadata: { product_name: 'Black Kaftan' },
      })
    ).toContain('Black Kaftan is low on stock');
    expect(
      notificationAskPrompt({
        type: 'bespoke_quote_request',
        metadata: { design_name: 'Agbada' },
      })
    ).toBe('Show me the quote request for "Agbada" and help me price it.');
  });

  it('falls back to a general question when the payload has no subject, where one makes sense', () => {
    expect(notificationAskPrompt({ type: 'new_order' })).toContain(
      'What new orders'
    );
    expect(
      notificationAskPrompt({ type: 'dispute_opened', metadata: null })
    ).toContain('Which disputes are open');
    expect(notificationAskPrompt({ type: 'payout_released' })).toContain(
      'released to me'
    );
    // A status change with no reference is nothing to ask about.
    expect(notificationAskPrompt({ type: 'order_shipped' })).toBeNull();
  });

  it('offers nothing for notifications the assistant has no tools for', () => {
    for (const type of [
      'new_message',
      'team_member_joined',
      'ticket_reply',
      'announcement',
      'welcome',
      'ticket_assigned',
    ]) {
      expect(notificationAskPrompt({ type })).toBeNull();
    }
    expect(notificationAskPrompt(null)).toBeNull();
    expect(notificationAskPrompt({ type: 'something_new' })).toBeNull();
  });

  it('accepts the other reference spellings payloads use', () => {
    expect(
      notificationAskPrompt({
        type: 'order_cancelled',
        metadata: { reference: 'QLZ-2' },
      })
    ).toContain('QLZ-2');
    expect(
      notificationAskPrompt({
        type: 'return_requested',
        metadata: { order_ref: 'QLZ-3' },
      })
    ).toContain('QLZ-3');
    expect(
      notificationAskPrompt({ type: 'new_review', metadata: { name: 'Tote' } })
    ).toContain('Tote');
  });
});
