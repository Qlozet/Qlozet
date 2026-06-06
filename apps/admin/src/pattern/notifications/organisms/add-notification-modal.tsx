'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Calendar, Clock, Info, Mail, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/pattern/common/organisms/rich-text-editor';
import {
  AUDIENCE_OPTIONS,
  TRIGGER_OPTIONS,
  type NotificationDraft,
  type NotificationTarget,
  type NotificationTrigger,
} from '../data/notification-catalog';

const DEFAULT_BODY = `<p>Hello {{user_name}},</p>`;

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: boolean;
}

const Field = ({ label, children, hint }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-sm font-medium text-grey-black">
      {label}
      {hint && <Info className="size-3.5 text-grey2" />}
    </label>
    {children}
  </div>
);

// "Add Notifications" composer. Resolves a NotificationDraft on save so the
// caller can append it to the list / POST it once the API exists.
export const AddNotificationModal = NiceModal.create(() => {
  const modal = useModal();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState(DEFAULT_BODY);
  const [audience, setAudience] = useState<NotificationTarget | ''>('');
  const [trigger, setTrigger] = useState<NotificationTrigger>('scheduled');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  if (!modal.visible) return null;

  // Resolve so the awaiting caller continues (and hits its no-op guard).
  const handleClose = () => {
    modal.resolve(undefined);
    modal.remove();
  };
  const isScheduled = trigger === 'scheduled';
  const isValid =
    subject.trim().length > 0 &&
    audience !== '' &&
    (!isScheduled || (date !== '' && time !== ''));

  const handleSendTest = () => {
    // TODO(api): POST the draft to the notifications "send test" endpoint once
    // the backend exposes one.
    toast.info('Connect the notifications API to send a test email.');
  };

  const handleSave = () => {
    if (!isValid) {
      toast.error('Please complete the required fields.');
      return;
    }
    const draft: NotificationDraft = {
      subject: subject.trim(),
      body,
      audience: audience as NotificationTarget,
      trigger,
      ...(isScheduled ? { date, time } : {}),
    };
    // TODO(api): POST `draft` to the create-notification endpoint once it
    // exists; for now the caller appends it to the local list.
    modal.resolve(draft);
    modal.remove();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-notification-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="add-notification-title"
            className="text-lg font-semibold text-foreground"
          >
            Add Notifications
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <Field label="Subject">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
            />
          </Field>

          <Field label="Body" hint>
            <RichTextEditor value={body} onChange={setBody} />
          </Field>

          <Button
            type="button"
            variant="outline"
            onClick={handleSendTest}
            className="gap-2"
          >
            <Mail className="size-4" />
            Send Test Email
          </Button>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Audience">
              <Select
                value={audience}
                onValueChange={(value) =>
                  setAudience(value as NotificationTarget)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                {/* Above the z-[100] modal — the portal renders to <body>. */}
                <SelectContent className="z-[200]">
                  {AUDIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Trigger">
              <Select
                value={trigger}
                onValueChange={(value) =>
                  setTrigger(value as NotificationTrigger)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                {/* Above the z-[100] modal — the portal renders to <body>. */}
                <SelectContent className="z-[200]">
                  {TRIGGER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Date + time only matter for scheduled notifications. */}
            {isScheduled && (
              <>
                <Field label="Date">
                  <div className="relative">
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pr-10"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-grey2" />
                  </div>
                </Field>

                <Field label="Time">
                  <div className="relative">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pr-10"
                    />
                    <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-grey2" />
                  </div>
                </Field>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button type="button" onClick={handleSave} disabled={!isValid}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
});
