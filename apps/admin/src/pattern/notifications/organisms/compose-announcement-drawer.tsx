'use client';

import React, { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Loader2, Mail, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateBroadcastMutation,
  type BroadcastAudience,
} from '@/redux/services/notifications/notifications.api-slice';

const AUDIENCE_OPTIONS: { value: BroadcastAudience; label: string }[] = [
  { value: 'customers', label: 'All customers' },
  { value: 'vendors', label: 'All vendors' },
  { value: 'admins', label: 'Admins only' },
];

const Field = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-grey-black dark:text-white">
      {label}
      {required && <span className="text-error"> *</span>}
    </label>
    {children}
    {hint && (
      <p className="text-[11px] leading-relaxed text-grey2 dark:text-gray-400">
        {hint}
      </p>
    )}
  </div>
);

/**
 * Compose an announcement — POST /notifications/broadcasts.
 *
 * Deliberately plain: a subject, a message, who it goes to, whether it also
 * goes by email, and optionally when. The surface this replaced offered rich
 * text, a "push" channel and an "event-based" trigger; there is no push
 * infrastructure, and "event-based" was the old settings-grid idea in
 * different clothes. A field that cannot do anything is worse than a missing
 * one.
 */
export const ComposeAnnouncementDrawer = NiceModal.create(() => {
  const { visible, resolve, hide, remove } = useModal();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<BroadcastAudience>('customers');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendLater, setSendLater] = useState(false);
  const [when, setWhen] = useState('');

  const [createBroadcast, { isLoading }] = useCreateBroadcastMutation();

  const close = (result?: unknown) => {
    resolve(result);
    hide();
    setTimeout(() => remove(), 300);
  };

  const canSend = subject.trim().length > 0 && body.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) {
      toast.error('A subject and a message are both needed.');
      return;
    }
    if (sendLater && !when) {
      toast.error('Pick a date and time, or switch "Send later" off.');
      return;
    }

    try {
      const res: any = await createBroadcast({
        subject: subject.trim(),
        // Blank lines become paragraphs so the email reads the way it was
        // typed, rather than as one run-on block.
        body: body
          .trim()
          .split(/\n{2,}/)
          .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
          .join(''),
        audience,
        send_email: sendEmail,
        ...(sendLater && when
          ? { scheduled_at: new Date(when).toISOString() }
          : {}),
      }).unwrap();

      toast.success(res?.message ?? 'Announcement sent');
      close(true);
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error(
        (Array.isArray(msg) ? msg[0] : msg) ||
          'Could not send the announcement.'
      );
    }
  };

  return (
    <Sheet open={visible} onOpenChange={() => close()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto border-border sm:max-w-[480px]">
        <SheetHeader className="shrink-0 border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Megaphone className="size-4 text-primary" />
            New announcement
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 py-5">
          <p className="rounded-xl border border-border bg-muted/40 px-3.5 py-3 text-[12px] leading-relaxed text-grey2 dark:text-gray-400">
            This reaches everyone in the audience you pick, and there is nothing
            to unsubscribe from. Keep it to what people need to know.
          </p>

          <Field label="Subject" required>
            <Input
              value={subject}
              maxLength={150}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Qlozet is closed for Eid on Monday"
            />
          </Field>

          <Field
            label="Message"
            required
            hint="A blank line starts a new paragraph."
          >
            <Textarea
              value={body}
              rows={8}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write it the way you would say it."
            />
          </Field>

          <Field label="Who gets it" required>
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as BroadcastAudience)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick an audience" />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-border px-3.5 py-3">
            <div className="space-y-0.5">
              <span className="flex items-center gap-1.5 text-sm font-medium text-grey-black dark:text-white">
                <Mail className="size-3.5" />
                Also send as an email
              </span>
              <p className="text-[11px] leading-relaxed text-grey2 dark:text-gray-400">
                Off means it only appears in their notifications.
              </p>
            </div>
            <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
          </div>

          <div className="space-y-3 rounded-xl border border-border px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-grey-black dark:text-white">
                Send later
              </span>
              <Switch checked={sendLater} onCheckedChange={setSendLater} />
            </div>
            {sendLater && (
              <Input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="mt-auto flex shrink-0 items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => close()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isLoading || !canSend}>
            {isLoading && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            {sendLater ? 'Schedule' : 'Send now'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
});
