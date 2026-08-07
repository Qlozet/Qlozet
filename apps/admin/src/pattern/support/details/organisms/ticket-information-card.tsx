'use client';

import { Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';
import {
  EM_DASH,
  assigneeId,
  formatDateTime,
  shortTicketId,
} from '../../lib/ticket-fields';

interface TicketInformationCardProps {
  ticket?: Ticket;
  /** Vendor name resolved from the ticket's `business` id. */
  vendorName?: string;
  isLoading?: boolean;
  onReassign: () => void;
  onEdit: () => void;
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-[#3387CC]">{label}</p>
    <p className="text-sm font-medium text-grey-black">{value}</p>
  </div>
);

export const TicketInformationCard = ({
  ticket,
  vendorName,
  isLoading,
  onReassign,
  onEdit,
}: TicketInformationCardProps) => {
  if (isLoading || !ticket) {
    return (
      <div className="space-y-5 rounded-2xl bg-white p-6 custom-card-shadow">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  // A support-team id, never a name: the backend doesn't populate it and
  // GET /users/team/members currently 500s, so there is nothing to look it up
  // against. Showing the id beats showing a made-up person.
  const assigned = assigneeId(ticket);

  return (
    <div className="space-y-5 rounded-2xl bg-white p-6 custom-card-shadow">
      <h3 className="text-base font-semibold text-grey-black">
        Ticket Information
      </h3>

      {/* Assigned To */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#3387CC]">Assigned To</p>
        <div className="flex items-center gap-2">
          {assigned ? (
            <span
              title={assigned}
              className="text-sm font-medium text-grey-black"
            >
              Team {shortTicketId(assigned)}
            </span>
          ) : (
            <span className="text-sm text-error">Unassigned</span>
          )}
          <button
            type="button"
            onClick={onReassign}
            className="ml-2 flex items-center gap-1 rounded-md bg-[#F8F9FA] px-2 py-1 text-xs text-grey3 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Repeat2 className="size-3.5" />
            Reassign
          </button>
        </div>
      </div>

      {/* No "Due Date" field: tickets carry no due date, so the row that used
          to sit here could only ever render a dash. */}
      <Field label="Ticket ID" value={shortTicketId(ticket._id)} />
      <Field label="Vendor" value={vendorName || EM_DASH} />
      <Field label="Created" value={formatDateTime(ticket.createdAt)} />
      <Field label="Last Updated" value={formatDateTime(ticket.updatedAt)} />

      {/* No Resolve action: PATCH /tickets/{id} accepts only issue_type,
          description and images — there is no way to change a ticket's status
          from any client. */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
};
