// Support Form - Molecule
// Support ticket submission form with react-hook-form and Zod validation

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supportSchema, type SupportData } from '@/lib/validations/support';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormSectionHeader } from '@/pattern/settings/atoms/form-section-header';
import { ISSUE_TYPES } from '../lib/ticket-fields';

interface SupportFormProps {
  /** Resolves true when the ticket was created — only then are fields cleared. */
  onSubmit: (data: SupportData) => Promise<boolean> | boolean;
  isLoading?: boolean;
}

export const SupportForm: React.FC<SupportFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<SupportData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      issueType: '',
      message: '',
    },
  });

  // Keep the vendor's input on failure so a retry doesn't mean retyping it.
  const handleSubmit = async (data: SupportData) => {
    const created = await onSubmit(data);
    if (created) form.reset();
  };

  return (
    <div className="bg-white dark:bg-card rounded-[12px] w-full lg:w-[40%] m-auto px-4 py-6 my-6 shadow">
      <FormSectionHeader title="Get support" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="issueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ISSUE_TYPES?.map((type) => (
                      <SelectItem key={type?.value} value={type?.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Give a summary of the problem you are presently encountering."
                    className="resize-none min-h-30"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-center lg:justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-56 w-full"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
