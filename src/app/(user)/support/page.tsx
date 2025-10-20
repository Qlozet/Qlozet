'use client';
import React from 'react';
import { SupportTemplate } from '@/patterns/support/templates/support-template';
import { useSubmitSupportTicketMutation } from '@/redux/services/support/support.api-slice';
import { type SupportData } from '@/lib/validations/support';
import { toast } from 'sonner';
const Support: React.FC = () => {
  const [submitSupportTicket, { isLoading }] = useSubmitSupportTicketMutation();

  const handleSubmit = async (data: SupportData) => {
    try {
      const response = await submitSupportTicket(data).unwrap();
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'An error occurred');
    }
  };
  return <SupportTemplate onSubmit={handleSubmit} isLoading={isLoading} />;
};

export default Support;
