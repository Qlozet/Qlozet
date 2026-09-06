'use client';

import { Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';
import {
  EM_DASH,
  assigneeId,
  assigneeName,
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
  /** Marks the ticket resolved (PATCH /admin/tickets/:id { status }). */
  onResolve: () => void;
  isResolving?: boolean;
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-[#3387CC]">{label}</p>
    <p className="text-sm font-medium text-grey-black dark:text-white">
      {value}
    </p>
  </div>
);

export const TicketInformationCard = ({
  ticket,
  vendorName,
  isLoading,
  onReassign,
  onEdit,
  onResolve,
  isResolving,
}: TicketInformationCardProps) => {
  if (isLoading || !ticket) {
    return (
      <div className="space-y-5 rounded-2xl bg-white dark:bg-card p-6 custom-card-shadow">
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

  // `assigned_to` refs a User and comes back populated, so this is the owning
  // administrator's name. A response that still carries a bare id falls back to
  // a short form of it rather than showing nothing.
  const assigned = assigneeId(ticket);
  const assignedName = assigneeName(ticket);

  return (
    <div className="space-y-5 rounded-2xl bg-white dark:bg-card p-6 custom-card-shadow">
      <h3 className="text-base font-semibold text-grey-black dark:text-white">
        Ticket Information
      </h3>

      {/* Assigned To */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#3387CC]">Assigned To</p>
        <div className="flex items-center gap-2">
          {assigned ? (
            <span
              title={assigned}
              className="text-sm font-medium text-grey-black dark:text-white"
            >
              {assignedName ?? `Team ${shortTicketId(assigned)}`}
            </span>
          ) : (
            <span className="text-sm text-error">Unassigned</span>
          )}
          <button
            type="button"
            onClick={onReassign}
            className="ml-2 flex items-center gap-1 rounded-md bg-[#F8F9FA] dark:bg-muted px-2 py-1 text-xs text-grey3 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors cursor-pointer"
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

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        {!['resolved', 'closed'].includes(ticket.status ?? '') && (
          <Button type="button" onClick={onResolve} disabled={isResolving}>
            {isResolving ? 'Resolving…' : 'Resolve'}
          </Button>
        )}
      </div>
    </div>
  );
};
