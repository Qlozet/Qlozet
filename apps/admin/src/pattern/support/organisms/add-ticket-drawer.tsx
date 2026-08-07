'use client';

import React, { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTicketMutation } from '@/redux/services/tickets/tickets.api-slice';
import { ISSUE_TYPE_OPTIONS } from '../lib/ticket-options';

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-grey-black">
      {label}
      {required && <span className="text-error"> *</span>}
    </label>
    {children}
  </div>
);

// Creates a ticket through POST /tickets.
//
// The form mirrors CreateTicketDto exactly (issue_type + description). The
// backend accepts nothing else on create — assignment is a separate call made
// from the ticket detail page, and there is no ticket attachment upload
// endpoint — so no other fields are collected here.
export const AddTicketDrawer = NiceModal.create(() => {
  const { visible, resolve, hide, remove } = useModal();

  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');

  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const close = (result?: unknown) => {
    resolve(result);
    hide();
    setTimeout(() => remove(), 300);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) close(undefined);
  };

  const isValid = Boolean(issueType && description.trim());

  const handleSave = async () => {
    if (!isValid) {
      toast.error('Please complete the required fields.');
      return;
    }
    try {
      const created = await createTicket({
        issue_type: issueType,
        description: description.trim(),
      }).unwrap();
      toast.success('Ticket created');
      close(created?.data);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not create the ticket. Please try again.';
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
        {/* pr-12 keeps the title clear of the Sheet's built-in close button. */}
        <SheetHeader className="shrink-0 border-b border-border py-5 pl-6 pr-12">
          <SheetTitle className="text-lg font-semibold text-[#0C0C0D]">
            Add A Ticket
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 space-y-5 overflow-y-auto px-6 py-5">
          <Field label="Category" required>
            <Select value={issueType} onValueChange={setIssueType}>
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
          </Field>

          <Field label="Description" required>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail"
              className="min-h-40"
            />
          </Field>

          <p className="text-xs text-grey3">
            Assign this ticket to a team member from its detail page once it has
            been created.
          </p>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create ticket'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
});
