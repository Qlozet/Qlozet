'use client';

import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Markdown } from '@/components/ui/markdown';
import {
  useAcceptServiceAgreementMutation,
  useGetServiceAgreementQuery,
  type VerificationState,
} from '@/redux/services/verification/verification.api-slice';
import { readApiError } from '@/redux/services/types';

/**
 * The vendor agreement text and the box that accepts it.
 *
 * The text itself, in the card: a tick beside a link is weak evidence that
 * anyone was shown the terms. Rendering it here means the vendor accepts the
 * exact words their record will name, and removes a tab-switch from the
 * middle of the flow. Shared by the QoreID review step, the manual form and
 * the re-accept prompt for an approved vendor whose version is out of date.
 */
export const ServiceAgreementPanel = ({
  agreement,
}: {
  agreement: VerificationState['service_agreement'] | undefined;
}) => {
  const { data: agreementDoc, isLoading } = useGetServiceAgreementQuery();
  const [acceptAgreement, { isLoading: isAccepting }] =
    useAcceptServiceAgreementMutation();

  const accept = async () => {
    if (!agreement?.required_version) return;
    try {
      await acceptAgreement({ version: agreement.required_version }).unwrap();
      toast.success('Agreement accepted');
    } catch (err) {
      toast.error(readApiError(err, 'Could not record your acceptance.'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-[#F8F9FA] dark:bg-muted/40">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <span className="text-xs font-semibold text-grey-black dark:text-white">
            Qlozet Vendor Agreement
          </span>
          <span className="shrink-0 text-[11px] text-grey2 dark:text-gray-400">
            Version {agreement?.required_version}
          </span>
        </div>
        <div className="max-h-72 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-5/6 rounded" />
            </div>
          ) : agreementDoc?.data?.body ? (
            <Markdown
              content={agreementDoc.data.body}
              className="text-xs leading-relaxed"
            />
          ) : (
            <p className="text-xs text-grey2 dark:text-gray-400">
              The agreement could not be loaded. Reload the page before
              accepting.
            </p>
          )}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
          checked={Boolean(agreement?.accepted)}
          // Acceptance is a record, not a toggle — unticking it would have to
          // mean withdrawing consent, which is not what the backend stores or
          // what the vendor means by clicking twice.
          disabled={
            Boolean(agreement?.accepted) ||
            isAccepting ||
            // Nothing to accept until the words are on screen.
            !agreementDoc?.data?.body
          }
          onChange={(e) => {
            if (e.target.checked) accept();
          }}
        />
        <span className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
          I have read and accept the Qlozet Vendor Agreement above
          {agreement?.outdated && (
            <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">
              (updated since you last accepted — please read it again)
            </span>
          )}
        </span>
      </label>
    </div>
  );
};

/** Prominent prompt for a vendor who accepted an older version. */
export const AgreementUpdatedNotice = ({ version }: { version?: string }) => (
  <div
    role="status"
    className="rounded-xl border border-amber-300/70 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-950/30"
  >
    <p className="text-sm font-semibold text-grey-black dark:text-white">
      The vendor agreement has changed
    </p>
    <p className="mt-0.5 text-sm text-grey2 dark:text-gray-400">
      {version ? `Version ${version} is now in force. ` : ''}Read it and accept
      it again below.
    </p>
  </div>
);
