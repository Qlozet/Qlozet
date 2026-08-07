'use client';

import { useMemo, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignTicketMutation } from '@/redux/services/tickets/tickets.api-slice';
import { useGetTeamMembersQuery } from '@/redux/services/users/users.api-slice';

interface ReassignTicketModalProps {
  ticketId: string;
  /** Currently assigned member id, when known. */
  currentAssigneeId?: string;
}

// Assigns a ticket to a support team member via PATCH /admin/{id}/assign.
export const ReassignTicketModal = NiceModal.create(
  ({ ticketId, currentAssigneeId }: ReassignTicketModalProps) => {
    const modal = useModal();
    const [assignee, setAssignee] = useState(currentAssigneeId ?? '');

    const { data, isLoading: isLoadingMembers } = useGetTeamMembersQuery();
    const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();

    const members = useMemo(
      () =>
        (data?.data ?? [])
          .map((member) => ({
            id: member._id,
            name: member.full_name || member.email || '',
          }))
          .filter((member) => member.id && member.name),
      [data]
    );

    if (!modal.visible) return null;

    const handleClose = () => modal.remove();

    const handleAssign = async () => {
      if (!assignee) return;
      try {
        await assignTicket({
          id: ticketId,
          support_team_id: assignee,
        }).unwrap();
        toast.success('Ticket reassigned');
        modal.resolve(assignee);
        modal.remove();
      } catch (error) {
        const message =
          (error as { data?: { message?: string } })?.data?.message ??
          'Could not reassign the ticket. Please try again.';
        toast.error(message);
      }
    };

    const emptyLabel = isLoadingMembers
      ? 'Loading team members...'
      : 'No team members available';

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reassign-title"
          className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-grey3 hover:bg-gray-100 transition"
          >
            <X className="size-4" />
          </button>

          <h2
            id="reassign-title"
            className="text-lg font-semibold text-grey-black"
          >
            Reassign Ticket
          </h2>
          <p className="mt-1 text-sm text-grey3">
            Choose the support team member who should own this ticket.
          </p>

          <div className="mt-5 space-y-1.5">
            <label className="text-sm font-medium text-grey-black">
              Assign To
            </label>
            <Select
              value={assignee}
              onValueChange={setAssignee}
              disabled={members.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    members.length === 0 ? emptyLabel : 'Select a team member'
                  }
                />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={!assignee || isAssigning}
            >
              {isAssigning ? 'Reassigning...' : 'Reassign'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
