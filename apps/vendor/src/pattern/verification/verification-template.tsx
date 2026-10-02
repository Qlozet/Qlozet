'use client';

// Get Verified — QoreID-backed vendor verification.
// Three checks: identity (vNIN, required — earns the Verified badge),
// payout bank account (NUBAN name match), and CAC registration (optional
// Registered Business credential). Each card collapses into a summary once
// its check passes.

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ListChecks,
  Landmark,
  Loader2,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  useGetVerificationQuery,
  useVerifyBankMutation,
  useVerifyCacMutation,
  useFileCacDocumentMutation,
  useAcceptServiceAgreementMutation,
  useSubmitForReviewMutation,
  useVerifyPayoutBankMutation,
  useVerifyVninMutation,
} from '@/redux/services/verification/verification.api-slice';
import { useUploadDocumentMutation } from '@/redux/services/uploads/uploads.api-slice';
import { readApiError } from '@/redux/services/types';
import { useGetPayoutAccountQuery } from '@/redux/services/wallet/wallet.api-slice';

/**
 * What a vendor needs in hand before starting.
 *
 * Deliberately not saved anywhere: a vNIN expires in about 72 hours, so
 * storing one only guarantees it is stale when they come back, and an
 * identity number we hold without a use for is the exact thing this module
 * was built to avoid.
 */
const READINESS: { key: string; title: string; detail: string }[] = [
  {
    key: 'vnin',
    title: 'A virtual NIN, generated today',
    detail:
      'Dial *346*3*YourNIN*AgentCode# or use the NIMC app. It expires after a few days, so generate it when you are ready to verify — not in advance.',
  },
  {
    key: 'name',
    title: 'Your name exactly as it appears on your NIN',
    detail:
      'Spelling and order must match the NIMC record, not your business name.',
  },
  {
    key: 'rc',
    title: 'Your CAC registration number',
    detail: 'The RC or BN number from your certificate of incorporation.',
  },
  {
    key: 'cac',
    title: 'Your CAC certificate as a file',
    detail:
      'PDF, JPEG or PNG. Optional, but it is what we fall back on if the registry lookup cannot confirm your number.',
  },
];

// CBN bank codes for NUBAN resolution.
const BANKS: { name: string; code: string }[] = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank', code: '023' },
  { name: 'Ecobank', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank', code: '011' },
  { name: 'FCMB', code: '214' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'GTBank', code: '058' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kuda', code: '50211' },
  { name: 'Lotus Bank', code: '303' },
  { name: 'Moniepoint', code: '50515' },
  { name: 'OPay', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC', code: '221' },
  { name: 'Standard Chartered', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Union Bank', code: '032' },
  { name: 'UBA', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
  // QoreID's sandbox pairs its test NUBAN with dummy bank code 062 — only
  // shown when the test flag is set, so live vendors never see it.
  ...(process.env.NEXT_PUBLIC_QOREID_TEST === 'true'
    ? [{ name: 'QoreID Test Bank (sandbox)', code: '062' }]
    : []),
];

const errText = (err: unknown, fallback: string) => {
  const msg = (err as { data?: { message?: string | string[] } })?.data
    ?.message;
  return (Array.isArray(msg) ? msg[0] : msg) || fallback;
};

const Card = ({
  icon: Icon,
  title,
  tag,
  done,
  failed,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  tag: string;
  done: boolean;
  failed?: boolean;
  children: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-xl border border-border bg-white custom-card-shadow dark:bg-card">
    <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brown3/10 text-brown3">
          <Icon className="size-[18px]" />
        </span>
        <div>
          <p className="text-sm font-bold text-grey-black dark:text-white">
            {title}
          </p>
          <p className="text-[11px] text-grey2 dark:text-gray-400">{tag}</p>
        </div>
      </div>
      {done ? (
        <Badge className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300">
          <BadgeCheck className="size-3" /> Verified
        </Badge>
      ) : failed ? (
        <Badge className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-50 dark:bg-red-950 dark:text-red-300">
          <XCircle className="size-3" /> Failed — try again
        </Badge>
      ) : null}
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) =>
  value ? (
    <div className="flex items-center justify-between text-sm">
      <span className="text-grey2 dark:text-gray-400">{label}</span>
      <span className="font-medium text-grey-black dark:text-white">
        {value}
      </span>
    </div>
  ) : null;

export const VerificationTemplate = () => {
  const { data, isLoading } = useGetVerificationQuery();
  const state = data?.data;
  const identity = state?.verification?.identity ?? null;
  const bank = state?.verification?.bank ?? null;
  const business = state?.verification?.business ?? null;
  const agreement = state?.service_agreement;
  const step = state?.verification_state ?? 'not_started';

  const submit = async () => {
    try {
      await submitForReview().unwrap();
      toast.success(
        'Submitted. We will review your store and get back to you.'
      );
    } catch (err) {
      toast.error(errText(err, 'Could not submit for review — try again.'));
    }
  };

  const accept = async () => {
    if (!agreement?.required_version) return;
    try {
      await acceptAgreement({ version: agreement.required_version }).unwrap();
      toast.success('Agreement accepted');
    } catch (err) {
      toast.error(errText(err, 'Could not record your acceptance.'));
    }
  };

  const [verifyVnin, vninState] = useVerifyVninMutation();
  const [verifyBank, bankState] = useVerifyBankMutation();
  const [verifyPayoutBank, payoutBankState] = useVerifyPayoutBankMutation();
  // The payout account (Settings → Payout) is the single source of truth for
  // bank details — when one is linked, verification runs against it directly.
  const { data: payoutRes } = useGetPayoutAccountQuery();
  const payout = payoutRes?.data;
  const [verifyCac, cacState] = useVerifyCacMutation();
  const [uploadDocument, uploadState] = useUploadDocumentMutation();
  const [acceptAgreement, agreementState] = useAcceptServiceAgreementMutation();
  const [submitForReview, submitState] = useSubmitForReviewMutation();
  const [fileCacDocument, fileState] = useFileCacDocumentMutation();
  const cacFileRef = useRef<HTMLInputElement>(null);

  const [vnin, setVnin] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [rcNumber, setRcNumber] = useState('');

  const submitVnin = async () => {
    try {
      const res = await verifyVnin({
        vnin: vnin.trim(),
        firstname: firstname.trim() || undefined,
        lastname: lastname.trim() || undefined,
      }).unwrap();
      if (res.data?.verified) {
        toast.success(
          'Identity verified — your store now carries the Verified badge.'
        );
      } else {
        toast.error(
          'We could not match that vNIN to your name. Check the details and try again.'
        );
      }
    } catch (err) {
      toast.error(errText(err, 'Identity verification failed — try again.'));
    }
  };

  const submitPayoutBank = async () => {
    try {
      const res = await verifyPayoutBank().unwrap();
      if (res.data?.verified) {
        toast.success(
          `Account confirmed: ${res.data.bank?.account_name ?? 'name matched'}.`
        );
      } else {
        toast.error('The account name did not match your verified identity.');
      }
    } catch (err) {
      toast.error(errText(err, 'Bank verification failed — try again.'));
    }
  };

  const submitBank = async () => {
    const bankName = BANKS.find((b) => b.code === bankCode)?.name;
    try {
      const res = await verifyBank({
        account_number: accountNumber.trim(),
        bank_code: bankCode,
        bank_name: bankName,
      }).unwrap();
      if (res.data?.verified) {
        toast.success(
          `Account confirmed: ${res.data.bank?.account_name ?? 'name matched'}.`
        );
      } else {
        toast.error('The account name did not match your verified identity.');
      }
    } catch (err) {
      toast.error(errText(err, 'Bank verification failed — try again.'));
    }
  };

  /**
   * Upload the certificate, then file it against the business.
   *
   * Two steps because the upload returns a URL the API then records - and
   * deliberately independent of the RC-number check: the document matters
   * most when that check cannot settle things.
   */
  const submitCacDocument = async (file: File) => {
    try {
      const uploaded = await uploadDocument(file).unwrap();
      const url = uploaded?.data?.url;
      if (!url) {
        toast.error('Upload failed — no document URL returned.');
        return;
      }
      await fileCacDocument({ document_url: url }).unwrap();
      toast.success('Certificate filed.');
    } catch (err) {
      toast.error(readApiError(err, 'Could not save that document.'));
    }
  };

  const submitCac = async () => {
    try {
      const res = await verifyCac({ rc_number: rcNumber.trim() }).unwrap();
      if (res.data?.verified) {
        toast.success(
          `Registration confirmed: ${res.data.business?.company_name ?? rcNumber}.`
        );
      } else {
        toast.error('We could not confirm that registration number with CAC.');
      }
    } catch (err) {
      toast.error(errText(err, 'CAC verification failed — try again.'));
    }
  };

  // Nothing left to prepare once every check has passed.
  const allChecksPassed =
    identity?.status === 'verified' &&
    business?.status === 'verified' &&
    bank?.status === 'verified';

  const inputCls = 'h-11';
  const buttonCls =
    'inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50';

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-grey-black dark:text-white">
            Get Verified
          </h1>
          <p className="mt-1 text-sm text-grey2 dark:text-gray-400">
            Verify once, sell with trust — the checks run instantly and we never
            store your identity numbers, only the result.
          </p>
        </div>
        {identity?.status === 'verified' && (
          <Badge className="flex shrink-0 items-center gap-1.5 bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="size-3.5" /> Verified vendor
          </Badge>
        )}
      </div>

      {/* Before you start.
          The failure this prevents: a vendor begins unprepared, fails a check
          and spends a billed attempt on something they could have fixed in
          two minutes. It deliberately does not offer to SAVE any of these -
          a vNIN expires in about 72 hours, so a saved one fails later through
          no fault of the vendor's, and holding identity numbers we have no
          use for is the thing this module exists to avoid. Tell them what to
          bring; hold none of it. */}
      {!allChecksPassed && (
        <div className="rounded-xl border border-border bg-[#F8F9FA] p-4 dark:bg-muted/40 sm:p-5">
          <div className="flex items-center gap-2.5">
            <ListChecks className="size-4 shrink-0 text-brown3" />
            <h2 className="text-sm font-semibold text-grey-black dark:text-white">
              Before you start
            </h2>
          </div>
          <p className="mt-1 text-xs text-grey2 dark:text-gray-400">
            Have these to hand. The checks run against live registries, so a
            missing detail means starting over.
          </p>

          <ul className="mt-4 space-y-3">
            {READINESS.map((item) => (
              <li key={item.key} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-grey3/50 text-[10px] text-grey3"
                  aria-hidden
                >
                  •
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-grey-black dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}

            {/* The one item we can actually check for them. */}
            <li className="flex items-start gap-3">
              {payout ? (
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
              ) : (
                <span
                  className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-amber-500/60 text-[10px] text-amber-600"
                  aria-hidden
                >
                  !
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-grey-black dark:text-white">
                  A payout account linked
                </p>
                <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
                  {payout ? (
                    'Linked — we check this one against your verified name, so there is nothing to retype.'
                  ) : (
                    <>
                      Not linked yet.{' '}
                      <Link
                        href="/settings?tab=payout"
                        className="font-medium text-primary underline underline-offset-2"
                      >
                        Add it in Settings
                      </Link>{' '}
                      before you verify.
                    </>
                  )}
                </p>
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* 1 — Identity */}
      <Card
        icon={ShieldCheck}
        title="Identity"
        tag="Required · earns the Verified badge"
        done={identity?.status === 'verified'}
        failed={identity?.status === 'failed'}
      >
        {identity?.status === 'verified' ? (
          <div className="space-y-2">
            <SummaryRow label="Name" value={identity.verified_name} />
            <SummaryRow label="ID" value={`vNIN ${identity.masked_id ?? ''}`} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-[#F8F9FA] p-3 dark:bg-muted/60">
              <Smartphone className="mt-0.5 size-4 shrink-0 text-brown3" />
              <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
                Generate a <span className="font-semibold">virtual NIN</span>{' '}
                with the NIMC app, or dial{' '}
                <span className="font-mono font-semibold">
                  *346*3*YourNIN*AgentCode#
                </span>
                . It&apos;s a 16-character code that expires after a few days —
                we check it and throw it away.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                className={inputCls}
                placeholder="First name (as on NIN)"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <Input
                className={inputCls}
                placeholder="Last name (as on NIN)"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
            <Input
              className={inputCls}
              placeholder="Virtual NIN (16 characters)"
              value={vnin}
              maxLength={16}
              onChange={(e) => setVnin(e.target.value.replace(/\s/g, ''))}
            />
            <button
              type="button"
              className={buttonCls}
              disabled={vnin.trim().length !== 16 || vninState.isLoading}
              onClick={submitVnin}
            >
              {vninState.isLoading && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {vninState.isLoading ? 'Verifying…' : 'Verify my identity'}
            </button>
          </div>
        )}
      </Card>

      {/* 2 — Payout bank account */}
      <Card
        icon={Landmark}
        title="Payout account"
        tag="Confirms your bank account matches your name"
        done={bank?.status === 'verified'}
        failed={bank?.status === 'failed'}
      >
        {bank?.status === 'verified' ? (
          <div className="space-y-2">
            <SummaryRow label="Account name" value={bank.account_name} />
            <SummaryRow label="Account" value={bank.account_number} />
            <SummaryRow label="Bank" value={bank.bank_name} />
          </div>
        ) : payout?.linked ? (
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg bg-[#F8F9FA] p-4 dark:bg-muted/60">
              <SummaryRow
                label="Linked account"
                value={payout.account_number}
              />
              <SummaryRow label="Account name" value={payout.account_name} />
              <SummaryRow label="Bank" value={payout.bank_name} />
            </div>
            <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
              This is the account your withdrawals go to (from Settings ·
              Payout). One tap checks it belongs to your verified identity.
            </p>
            <button
              type="button"
              className={buttonCls}
              disabled={payoutBankState.isLoading}
              onClick={submitPayoutBank}
            >
              {payoutBankState.isLoading && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {payoutBankState.isLoading
                ? 'Checking…'
                : 'Verify my payout account'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
              No payout account linked yet —{' '}
              <Link
                href="/settings?tab=payout"
                className="font-semibold underline underline-offset-2"
              >
                link one under Payout
              </Link>{' '}
              (recommended), or verify an account directly below.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                className={inputCls}
                placeholder="Account number (10 digits)"
                inputMode="numeric"
                maxLength={10}
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value.replace(/\D/g, ''))
                }
              />
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-card [&>option]:dark:bg-card"
              >
                <option value="">Select bank…</option>
                {BANKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={buttonCls}
              disabled={
                accountNumber.length !== 10 || !bankCode || bankState.isLoading
              }
              onClick={submitBank}
            >
              {bankState.isLoading && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {bankState.isLoading ? 'Checking…' : 'Verify account'}
            </button>
          </div>
        )}
      </Card>

      {/* 3 — Registered business (optional) */}
      <Card
        icon={Building2}
        title="Registered business"
        tag="Optional · CAC registration for a Registered Business credential"
        done={business?.status === 'verified'}
        failed={business?.status === 'failed'}
      >
        {business?.status === 'verified' ? (
          <div className="space-y-2">
            <SummaryRow label="Company" value={business.company_name} />
            <SummaryRow label="RC number" value={business.rc_number} />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
              Registered with the Corporate Affairs Commission? Confirm your
              RC/BN number for instant registry confirmation. You can also file
              the certificate itself — we only need it if the registry lookup
              cannot confirm your number.
            </p>
            <Input
              className={inputCls}
              placeholder="RC or BN number"
              value={rcNumber}
              onChange={(e) => setRcNumber(e.target.value)}
            />
            <button
              type="button"
              className={buttonCls}
              disabled={!rcNumber.trim() || cacState.isLoading}
              onClick={submitCac}
            >
              {cacState.isLoading && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {cacState.isLoading ? 'Checking…' : 'Verify registration'}
            </button>

            {/* The certificate itself. It used to be uploaded from Settings,
                in the profile card beside the logo and cover image, where
                nothing explained what it was for - a legal document on the
                same footing as a branding asset. It belongs with the check it
                supports. */}
            <div className="border-t border-border/60 pt-4">
              <input
                ref={cacFileRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // Reset first: picking the same file twice should re-upload.
                  e.target.value = '';
                  if (file) submitCacDocument(file);
                }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                  disabled={uploadState.isLoading || fileState.isLoading}
                  onClick={() => cacFileRef.current?.click()}
                >
                  {(uploadState.isLoading || fileState.isLoading) && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {uploadState.isLoading || fileState.isLoading
                    ? 'Saving…'
                    : 'Attach CAC certificate'}
                </button>
                <span className="text-xs text-grey2 dark:text-gray-400">
                  Optional · PDF, JPEG or PNG
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 4 — Agreement and submission.
          The checks alone do not finish anything: until a vendor accepts the
          agreement and submits, nobody is looking at their store. Before this
          card existed a vendor could pass every check and then have nowhere
          to go — the flow simply stopped. */}
      <Card
        icon={ShieldCheck}
        title="Send your store for review"
        tag={
          step === 'awaiting_review'
            ? 'Submitted · we are reviewing it'
            : 'Required · the last step'
        }
        done={step === 'approved' || step === 'awaiting_review'}
        failed={step === 'rejected'}
      >
        {step === 'approved' ? (
          <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
            Your store is approved. Your products are visible to customers and
            you can take orders.
          </p>
        ) : step === 'awaiting_review' ? (
          <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
            We are checking your details and your products. Nothing is needed
            from you — keep adding products while you wait.
          </p>
        ) : (
          <div className="space-y-4">
            {/* The vendor's own words back to them, verbatim: this is the
                only thing they are told about what went wrong. */}
            {state?.verification_message && (
              <div className="rounded-lg border border-amber-300/70 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-950/30">
                <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                  {state.verification_message}
                </p>
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
                checked={Boolean(agreement?.accepted)}
                // Acceptance is a record, not a toggle — unticking it would
                // have to mean withdrawing consent, which is not what the
                // backend stores or what the vendor means by clicking twice.
                disabled={
                  Boolean(agreement?.accepted) || agreementState.isLoading
                }
                onChange={(e) => {
                  if (e.target.checked) accept();
                }}
              />
              <span className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
                I accept the{' '}
                <a
                  href={agreement?.url ?? '/legal/vendor-agreement'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Qlozet vendor service agreement
                </a>
                {agreement?.outdated && (
                  <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">
                    (updated since you last accepted — please read it again)
                  </span>
                )}
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={buttonCls}
                disabled={
                  !agreement?.accepted ||
                  step !== 'provider_complete' ||
                  submitState.isLoading
                }
                onClick={submit}
              >
                {submitState.isLoading && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {submitState.isLoading ? 'Submitting…' : 'Submit for review'}
              </button>

              {/* Say which precondition is missing rather than leaving a
                  disabled button with no explanation. */}
              {step !== 'provider_complete' && (
                <span className="text-xs text-grey2 dark:text-gray-400">
                  Finish the checks above first.
                </span>
              )}
              {step === 'provider_complete' && !agreement?.accepted && (
                <span className="text-xs text-grey2 dark:text-gray-400">
                  Accept the agreement to continue.
                </span>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
