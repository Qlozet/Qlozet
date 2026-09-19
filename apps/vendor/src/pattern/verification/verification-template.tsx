'use client';

// Get Verified — QoreID-backed vendor verification.
// Three checks: identity (vNIN, required — earns the Verified badge),
// payout bank account (NUBAN name match), and CAC registration (optional
// Registered Business credential). Each card collapses into a summary once
// its check passes.

import { useState } from 'react';
import { toast } from 'sonner';
import {
  BadgeCheck,
  Building2,
  Landmark,
  Loader2,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetVerificationQuery,
  useVerifyBankMutation,
  useVerifyCacMutation,
  useVerifyVninMutation,
} from '@/redux/services/verification/verification.api-slice';

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

  const [verifyVnin, vninState] = useVerifyVninMutation();
  const [verifyBank, bankState] = useVerifyBankMutation();
  const [verifyCac, cacState] = useVerifyCacMutation();

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
        ) : (
          <div className="space-y-4">
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
              RC/BN number to show customers you run a registered business.
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
          </div>
        )}
      </Card>
    </div>
  );
};
