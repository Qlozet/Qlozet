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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormSectionHeader } from '@/patterns/settings/atoms/form-section-header';

interface SupportFormProps {
  onSubmit: (data: SupportData) => void;
  isLoading?: boolean;
}

const ISSUE_TYPES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'bugs', label: 'Bugs and Issues' },
  { value: 'others', label: 'Others' },
];

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

  const handleSubmit = (data: SupportData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <div className='bg-white rounded-[12px] w-full lg:w-[40%] m-auto px-4 py-6 my-6 shadow'>
      <FormSectionHeader title='Get support' />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='issueType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select issue type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ISSUE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
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
            name='message'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Give a summary of the problem you are presently encountering.'
                    className='resize-none min-h-[120px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center justify-center lg:justify-end'>
            <Button
              type='submit'
              disabled={isLoading}
              className='min-w-[14rem]'
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
