"use client";
import React from 'react';
import { SupportTemplate } from "@/patterns/support/templates/support-template";
import { useSubmitSupportTicketMutation } from "@/redux/services/support/support.api-slice";
import { type SupportData } from "@/lib/validations/support";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
const Support: React.FC = () => {
  const [submitSupportTicket, { isLoading }] = useSubmitSupportTicketMutation();

  const handleSubmit = async (data: SupportData) => {
    try {
      const response = await submitSupportTicket(data).unwrap();
      if (response.success) {
        toast(<Toast text={response.message} type="success" />);
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error: any) {
      toast(<Toast text={error?.data?.message || "An error occurred"} type="danger" />);
    }
  };
  return (
    <SupportTemplate
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
};

export default Support;
