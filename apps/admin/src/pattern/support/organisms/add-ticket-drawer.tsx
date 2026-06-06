'use client';

import { useMemo, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploadWidget } from '@/pattern/common/organisms/file-upload-widget';
import { useGetTeamMembersQuery } from '@/redux/services/users/users.api-slice';

export type TicketPriority = 'low' | 'medium' | 'high';

export interface TicketDraft {
  subject: string;
  customer: string;
  category: string;
  priority: TicketPriority;
  assignedTo?: string;
  dueDate?: string;
  description: string;
  attachments: File[];
}

const CATEGORY_OPTIONS = [
  'Order Issue',
  'Fit Issue',
  'Technical Issue',
  'Delivery Issue',
  'Payment Issue',
  'Other',
];

const PRIORITY_OPTIONS: { label: string; value: TicketPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

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

export const AddTicketDrawer = NiceModal.create(() => {
  const modal = useModal();

  const [subject, setSubject] = useState('');
  const [customer, setCustomer] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Real platform team members populate the assignee picker.
  const { data: membersData } = useGetTeamMembersQuery();
  const assignees = useMemo(
    () =>
      (membersData?.data ?? [])
        .map((m) => ({
          id: m._id,
          name: m.full_name || m.email || '',
        }))
        .filter((m) => m.id && m.name),
    [membersData]
  );

  if (!modal.visible) return null;

  const handleClose = () => {
    modal.resolve(undefined);
    modal.remove();
  };

  const isValid =
    subject.trim() &&
    customer.trim() &&
    category &&
    description.trim();

  const handleSave = () => {
    if (!isValid) {
      toast.error('Please complete the required fields.');
      return;
    }
    const draft: TicketDraft = {
      subject: subject.trim(),
      customer: customer.trim(),
      category,
      priority,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
      description: description.trim(),
      attachments,
    };
    // TODO(api): POST `draft` to the create-ticket endpoint once one exists for
    // admins (the backend currently only has a vendor POST /tickets).
    modal.resolve(draft);
    modal.remove();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a ticket"
        className="relative z-10 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-grey-black">Add A Ticket</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-full text-grey3 hover:bg-gray-100 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <Field label="Subject" required>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
            />
          </Field>

          <Field label="Customer / User" required>
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Name, username or email"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" required>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Priority">
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TicketPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Assign To">
              <Select
                value={assignedTo}
                onValueChange={setAssignedTo}
                disabled={assignees.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      assignees.length === 0
                        ? 'No team members'
                        : 'Select assignee'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {assignees.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Due Date">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Description" required>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail"
              className="min-h-[120px]"
            />
          </Field>

          <Field label="Attachments">
            <FileUploadWidget onFilesChange={setAttachments} />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isValid}>
            Create ticket
          </Button>
        </div>
      </div>
    </div>
  );
});
