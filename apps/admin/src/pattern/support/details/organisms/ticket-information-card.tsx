'use client';

import { Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';
import { formatDate, readAssigned, readField } from '../../lib/ticket-fields';

interface TicketInformationCardProps {
  ticket?: Ticket;
  isLoading?: boolean;
  isResolving?: boolean;
  onReassign: () => void;
  onEdit: () => void;
  onResolve: () => void;
}

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-[#3387CC]">{label}</p>
    <p className="text-sm font-medium text-grey-black">{value}</p>
  </div>
);

export const TicketInformationCard = ({
  ticket,
  isLoading,
  isResolving,
  onReassign,
  onEdit,
  onResolve,
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

  const assigned = readAssigned(ticket);

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
            <>
              <div className="flex size-7 items-center justify-center rounded-full bg-brown3 text-[11px] font-semibold text-white">
                {initials(assigned)}
              </div>
              <span className="text-sm font-medium text-grey-black">
                {assigned}
              </span>
            </>
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

      <Field
        label="Created"
        value={formatDate(readField(ticket, 'createdAt', 'date'))}
      />
      <Field
        label="Due Date"
        value={formatDate(readField(ticket, 'due_date', 'dueDate'))}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button type="button" onClick={onResolve} disabled={isResolving}>
          {isResolving ? 'Resolving...' : 'Resolve'}
        </Button>
      </div>
    </div>
  );
};
