'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateTicketMutation,
  useUpdateTicketMutation,
  type Ticket,
} from '@/redux/services/tickets/tickets.api-slice';

const ISSUE_TYPES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'order', label: 'Order Issue' },
  { value: 'fit', label: 'Fit Issue' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'bugs', label: 'Bugs and Issues' },
  { value: 'others', label: 'Others' },
];

interface AddTicketModalProps {
  /** When provided, the modal edits the ticket via PATCH instead of creating. */
  ticket?: Ticket;
}

// Vendor "Add / Edit Ticket". Create → POST /tickets; edit → PATCH /tickets/{id}.
// Both endpoints accept issue_type + description (+ optional images); we collect
// the two required fields.
export const AddTicketModal = NiceModal.create(
  ({ ticket }: AddTicketModalProps) => {
    const modal = useModal();
    const isEdit = Boolean(ticket);

    const [issueType, setIssueType] = useState(ticket?.issue_type ?? '');
    const [description, setDescription] = useState(ticket?.description ?? '');

    const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
    const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
    const isLoading = isCreating || isUpdating;

    if (!modal.visible) return null;

    const handleClose = () => modal.remove();
    const isValid = issueType.length > 0 && description.trim().length >= 10;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) {
        toast.error(
          'Please select an issue type and describe the issue (min 10 characters).'
        );
        return;
      }
      try {
        if (isEdit && ticket) {
          await updateTicket({
            id: ticket._id,
            data: { issue_type: issueType, description: description.trim() },
          }).unwrap();
          toast.success('Ticket updated');
        } else {
          await createTicket({
            issue_type: issueType,
            description: description.trim(),
          }).unwrap();
          toast.success('Ticket created');
        }
        handleClose();
      } catch {
        toast.error(
          `Failed to ${isEdit ? 'update' : 'create'} ticket. Please try again.`
        );
      }
    };

    return (
      <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
        <div
          className='absolute inset-0 bg-black/40 backdrop-blur-sm'
          onClick={handleClose}
        />

        <div
          role='dialog'
          aria-modal='true'
          aria-labelledby='add-ticket-title'
          className='relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl'
        >
          <button
            type='button'
            onClick={handleClose}
            aria-label='Close'
            className='absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-gray-100'
          >
            <X className='size-4' />
          </button>

          <form
            onSubmit={handleSubmit}
            className='space-y-5 overflow-y-auto p-6'
          >
            <h2
              id='add-ticket-title'
              className='text-xl font-semibold text-foreground'
            >
              {isEdit ? 'Edit Ticket' : 'Add Ticket'}
            </h2>

            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-gray-700'>
                Category
              </label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger>
                  <SelectValue placeholder='Select issue type' />
                </SelectTrigger>
                <SelectContent className='z-[200]'>
                  {ISSUE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-gray-700'>
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Give a summary of the problem you are presently encountering.'
                className='min-h-[120px] resize-none'
              />
            </div>

            <div className='flex items-center justify-end gap-3 pt-2'>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading
                  ? isEdit
                    ? 'Saving...'
                    : 'Creating...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Add Ticket'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);
