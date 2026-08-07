// Ticket issue types offered in the create / edit forms.
//
// The backend stores `issue_type` as a free-form string (CreateTicketDto), so
// this list is a UI convenience rather than a server-enforced enum.
export const ISSUE_TYPE_OPTIONS = [
  'Order Issue',
  'Fit Issue',
  'Technical Issue',
  'Delivery Issue',
  'Payment Issue',
  'Other',
];
