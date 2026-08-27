'use client';

import { create } from '@ebay/nice-modal-react';
import { EscalateModalView } from '@/pattern/common/organisms/escalate-modal';
import { useEscalateVendorMutation } from '@/redux/services/vendor-details/vendor-details.api-slice';

interface EscalateVendorModalProps {
  businessId: string;
  vendorName?: string;
}

/** Raises a support ticket against a vendor. */
export const EscalateVendorModal = create<EscalateVendorModalProps>(
  ({ businessId, vendorName }) => {
    const [escalate, { isLoading }] = useEscalateVendorMutation();

    return (
      <EscalateModalView
        isLoading={isLoading}
        subjectLine={`This raises a support ticket against${
          vendorName ? ` ${vendorName}` : ' this vendor'
        }, visible in the support queue.`}
        onSubmit={(values) => escalate({ businessId, ...values }).unwrap()}
      />
    );
  }
);
