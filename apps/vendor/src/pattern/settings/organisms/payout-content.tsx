'use client';

// Settings → Payout
// Lets a vendor link the bank account their withdrawals are paid to. Without a
// linked account POST /wallets/withdraw is rejected ("link a bank account
// before withdrawing"). Flow: pick bank → enter account number → we resolve the
// account name with Paystack for confirmation → link (creates the transfer
// recipient the payout uses).

import React, { useEffect, useMemo, useState } from 'react';
import { Landmark, Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Loader from '@/components/Loader';
import {
  useGetBanksQuery,
  useGetPayoutAccountQuery,
  useResolvePayoutAccountMutation,
  useLinkPayoutAccountMutation,
  type Bank,
} from '@/redux/services/wallet/wallet.api-slice';

// ─── Searchable bank picker ──────────────────────────────────────────────────
const BankPicker: React.FC<{
  banks: Bank[];
  value: string; // selected bank code
  onChange: (bank: Bank) => void;
  disabled?: boolean;
}> = ({ banks, value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = banks.find((b) => b.code === value);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? banks.filter((b) => b.name.toLowerCase().includes(q))
      : banks;
    return list.slice(0, 100); // keep the list light
  }, [banks, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-muted px-3 text-sm',
            'disabled:opacity-60'
          )}
        >
          <span
            className={cn('truncate', !selected && 'text-muted-foreground')}
          >
            {selected ? selected.name : 'Select your bank'}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search banks…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No banks found
            </p>
          )}
          {filtered.map((bank) => (
            <button
              key={`${bank.code}-${bank.slug ?? bank.name}`}
              type="button"
              onClick={() => {
                onChange(bank);
                setOpen(false);
                setSearch('');
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <span className="truncate">{bank.name}</span>
              {bank.code === value && (
                <Check className="size-4 shrink-0 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ─── Main Payout content ─────────────────────────────────────────────────────
export const PayoutContent: React.FC = () => {
  const { data: accountRes, isLoading: loadingAccount } =
    useGetPayoutAccountQuery();
  const { data: banksRes, isLoading: loadingBanks } = useGetBanksQuery();
  const [resolveAccount, { isLoading: isResolving }] =
    useResolvePayoutAccountMutation();
  const [linkAccount, { isLoading: isLinking }] =
    useLinkPayoutAccountMutation();

  const linked = accountRes?.data;
  // Defensive: only ever hand an array to the picker, whatever the envelope
  // shape turns out to be.
  const banks = Array.isArray(banksRes?.data) ? banksRes.data : [];

  // The form is shown when nothing is linked, or when the vendor chooses to
  // change the linked account.
  const [editing, setEditing] = useState(false);
  const [bank, setBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const showForm = editing || (!loadingAccount && !linked?.linked);

  // Auto-resolve the account name once a bank + a 10-digit account number are in.
  useEffect(() => {
    setResolvedName(null);
    setResolveError(null);
    if (!bank || accountNumber.length !== 10) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await resolveAccount({
          account_number: accountNumber,
          bank_code: bank.code,
        }).unwrap();
        if (!cancelled) setResolvedName(res.data.account_name);
      } catch (err: any) {
        if (!cancelled)
          setResolveError(
            err?.data?.message ||
              'Could not verify that account. Check the number and bank.'
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bank, accountNumber, resolveAccount]);

  const handleAccountNumberChange = (v: string) => {
    // NUBAN numbers are 10 digits.
    setAccountNumber(v.replace(/\D/g, '').slice(0, 10));
  };

  const handleLink = async () => {
    if (!bank || !resolvedName) return;
    try {
      await linkAccount({
        name: resolvedName,
        account_number: accountNumber,
        bank_code: bank.code,
        bank_name: bank.name,
      }).unwrap();
      toast.success('Payout account linked. You can now withdraw.');
      setEditing(false);
      setBank(null);
      setAccountNumber('');
      setResolvedName(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to link payout account');
    }
  };

  if (loadingAccount) return <Loader />;

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white dark:bg-card dark:border dark:border-white/10 rounded-xl p-5 lg:p-6 custom-card-shadow">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-border/60">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
            <Landmark className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Payout account
            </h3>
            <p className="text-xs text-muted-foreground">
              The bank account your withdrawals are paid to.
            </p>
          </div>
        </div>

        {/* Linked account summary */}
        {linked?.linked && !editing && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-gray-50 dark:bg-muted p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {linked.account_name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {linked.bank_name} • {linked.account_number}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                <Check className="size-3" /> Linked
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setEditing(true)}
              className="w-full sm:w-auto"
            >
              Change account
            </Button>
          </div>
        )}

        {/* Link / change form */}
        {showForm && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Bank
              </label>
              {loadingBanks ? (
                <div className="flex h-11 items-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-muted px-3 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" /> Loading
                  banks…
                </div>
              ) : (
                <BankPicker
                  banks={banks}
                  value={bank?.code ?? ''}
                  onChange={setBank}
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Account number
              </label>
              <Input
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                placeholder="0123456789"
                className="h-11 bg-gray-50 dark:bg-muted border-gray-200 dark:border-white/10"
              />
            </div>

            {/* Resolution feedback */}
            {isResolving && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Verifying account…
              </p>
            )}
            {resolvedName && !isResolving && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/20 px-3 py-2.5 text-sm">
                <Check className="size-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-300">
                  {resolvedName}
                </span>
              </div>
            )}
            {resolveError && !isResolving && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {resolveError}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                onClick={handleLink}
                disabled={!resolvedName || isLinking}
                className="min-w-[150px] bg-[#3d2817] hover:bg-[#2e1e10] text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
              >
                {isLinking && <Loader2 className="mr-2 size-4 animate-spin" />}
                {linked?.linked ? 'Update account' : 'Link account'}
              </Button>
              {linked?.linked && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setBank(null);
                    setAccountNumber('');
                    setResolvedName(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutContent;
