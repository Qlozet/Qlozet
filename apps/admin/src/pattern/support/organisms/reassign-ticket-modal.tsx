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
import { useGetAdminsQuery } from '@/redux/services/users/users.api-slice';
import { formatRoleName, getAdminName } from '@/lib/admins';
import { readApiError } from '@/redux/services/types';

interface ReassignTicketModalProps {
  ticketId: string;
  /** Currently assigned administrator id, when known. */
  currentAssigneeId?: string;
}

/**
 * Assigns a ticket to a platform administrator via PATCH /admin/{id}/assign.
 *
 * The picker used to list a VENDOR's team members, which was doubly wrong: that
 * endpoint 500s for a platform caller, and `assigned_to` refs a User, so a team
 * member's id would never have resolved to anyone. It lists administrators.
 */
export const ReassignTicketModal = NiceModal.create(
  ({ ticketId, currentAssigneeId }: ReassignTicketModalProps) => {
    const modal = useModal();
    const [assignee, setAssignee] = useState(currentAssigneeId ?? '');

    const {
      data,
      isLoading: isLoadingMembers,
      isError: membersFailed,
    } = useGetAdminsQuery({
      // Active only: a deactivated admin cannot sign in, so a ticket assigned
      // to them would sit unowned. 100 covers the console's staff in one call.
      status: 'active',
      size: 100,
    });
    const [assignTicket, { isLoading: isAssigning }] =
      useAssignTicketMutation();

    const members = useMemo(
      () =>
        (data?.data?.data ?? [])
          .map((admin) => ({
            id: admin._id,
            name: getAdminName(admin),
            role: formatRoleName(admin.role?.name ?? admin.role_name),
          }))
          .filter((admin) => admin.id && admin.name),
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
        toast.error(
          readApiError(
            error,
            'Could not reassign the ticket. Please try again.'
          )
        );
      }
    };

    // Distinguish "there is genuinely nobody" from "we couldn't load the list"
    // — a failed request otherwise reads as an admin having no colleagues.
    const emptyLabel = isLoadingMembers
      ? 'Loading administrators...'
      : membersFailed
        ? 'Administrators unavailable'
        : 'No active administrators';

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
          className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-card p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-grey3 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-muted/80 transition"
          >
            <X className="size-4" />
          </button>

          <h2
            id="reassign-title"
            className="text-lg font-semibold text-grey-black dark:text-white"
          >
            Reassign Ticket
          </h2>
          <p className="mt-1 text-sm text-grey3 dark:text-gray-400">
            Choose the administrator who should own this ticket.
          </p>

          {membersFailed && (
            <p className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
              The administrator list could not be loaded, so this ticket
              can&apos;t be reassigned right now.
            </p>
          )}

          <div className="mt-5 space-y-1.5">
            <label className="text-sm font-medium text-grey-black dark:text-white">
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
                    members.length === 0
                      ? emptyLabel
                      : 'Select an administrator'
                  }
                />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.role && member.role !== '—'
                      ? `${member.name} — ${member.role}`
                      : member.name}
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
