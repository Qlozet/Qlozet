'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateTicketMutation } from '@/redux/services/tickets/tickets.api-slice';
import { ISSUE_TYPE_OPTIONS } from '../lib/ticket-options';

interface EditTicketDrawerProps {
  ticketId: string;
  issueType?: string;
  description?: string;
}

// Edits a ticket through PATCH /tickets/{id}. The backend's UpdateTicketDto
// accepts issue_type / description / images only — status is not editable, so
// this form deliberately exposes just the fields the API will persist.
export const EditTicketDrawer = NiceModal.create(
  ({ ticketId, issueType, description }: EditTicketDrawerProps) => {
    const { visible, resolve, hide, remove } = useModal();

    const [issue, setIssue] = useState(issueType ?? '');
    const [body, setBody] = useState(description ?? '');

    const [updateTicket, { isLoading }] = useUpdateTicketMutation();

    const close = (result?: unknown) => {
      resolve(result);
      hide();
      setTimeout(() => remove(), 300);
    };

    const handleOpenChange = (open: boolean) => {
      if (!open) close(undefined);
    };

    // Only send what actually changed so a partial PATCH stays partial.
    const changed =
      issue !== (issueType ?? '') || body.trim() !== (description ?? '').trim();

    const handleSave = async () => {
      if (!body.trim()) {
        toast.error('A description is required.');
        return;
      }
      try {
        await updateTicket({
          id: ticketId,
          ...(issue !== (issueType ?? '') ? { issue_type: issue } : {}),
          ...(body.trim() !== (description ?? '').trim()
            ? { description: body.trim() }
            : {}),
        }).unwrap();
        toast.success('Ticket updated');
        close(true);
      } catch (error) {
        const message =
          (error as { data?: { message?: string } })?.data?.message ??
          'Could not update the ticket. Please try again.';
        toast.error(message);
      }
    };

    return (
      <Sheet open={visible} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="flex sm:flex w-full flex-col !overflow-hidden p-0 sm:max-w-[440px] !top-6 !bottom-6 !right-6 rounded-2xl custom-card-shadow bg-white"
          style={{
            height: 'calc(100vh - 3rem)',
            maxHeight: 'calc(100vh - 3rem)',
          }}
        >
          <SheetHeader className="shrink-0 border-b border-border py-5 pl-6 pr-12">
            <SheetTitle className="text-lg font-semibold text-[#0C0C0D]">
              Edit Ticket
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-grey-black">
                Category
              </label>
              <Select value={issue} onValueChange={setIssue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {ISSUE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-grey-black">
                Description<span className="text-error"> *</span>
              </label>
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Describe the issue in detail"
                className="min-h-40"
              />
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={() => close()}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !changed || !body.trim()}
            >
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);
