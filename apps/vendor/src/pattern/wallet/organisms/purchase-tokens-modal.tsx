'use client';

import React, { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import {
  Sparkles,
  Zap,
  Crown,
  Gem,
  AlertCircle,
  Loader2,
  CircleCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  useGetTokenPacksQuery,
  usePurchaseVendorTokensMutation,
  type TokenPack,
} from '@/redux/services/tokens/tokens.api-slice';
import { useGetWalletBalanceQuery } from '@/redux/services/wallet/wallet.api-slice';
import { FundWalletModal } from './fund-wallet-modal';
import { toast } from 'sonner';
import { readApiError } from '@/redux/services/types';

type ActiveSection =
  | 'buy-tokens'
  | 'confirm-token-purchase'
  | 'token-purchase-success';

// The packs are set by the admin (GET /token/packs) and priced by the server;
// this app only names the pack it buys. Icons go by position.
const PACK_ICONS = [Sparkles, Zap, Gem, Crown];
const iconFor = (i: number) => PACK_ICONS[Math.min(i, PACK_ICONS.length - 1)];

/** The pack to start on: the first one the admin labelled, else the second. */
function defaultPackIndex(packs: TokenPack[]): number {
  const tagged = packs.findIndex((p) => p.tag);
  if (tagged >= 0) return tagged;
  return Math.min(1, Math.max(0, packs.length - 1));
}

export const PurchaseTokensModal = NiceModal.create(() => {
  const { visible, resolve, remove } = useModal();
  const [activeSection, setActiveSection] =
    useState<ActiveSection>('buy-tokens');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const {
    data: packsData,
    isLoading: packsLoading,
    isError: packsError,
  } = useGetTokenPacksQuery();
  const packs: TokenPack[] = packsData?.packs ?? [];
  const [purchasedTokens, setPurchasedTokens] = useState(0);

  const { data: balanceData, refetch: refetchBalance } =
    useGetWalletBalanceQuery();

  const readBalance = (raw: unknown): number => {
    if (typeof raw === 'number') return raw;
    const d = (raw ?? {}) as Record<string, unknown>;
    for (const key of [
      'balance',
      'availableBalance',
      'available_balance',
      'amount',
    ]) {
      if (typeof d[key] === 'number') return d[key] as number;
    }
    return 0;
  };

  const walletBalance = readBalance(balanceData?.data);

  const [
    purchaseTokensMutation,
    { isLoading: isPurchasing, error: purchaseError },
  ] = usePurchaseVendorTokensMutation();

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  const handlePurchase = async () => {
    if (!selected) return;
    setPurchasedTokens(selected.total_tokens);

    try {
      await purchaseTokensMutation({ pack_id: selected.id }).unwrap();
      refetchBalance();
      setActiveSection('token-purchase-success');
    } catch (err: any) {
      const msg = readApiError(
        err,
        err?.message || 'Failed to purchase tokens. Please try again.'
      );
      if (msg.toLowerCase().includes('insufficient balance')) {
        toast.error(
          'Insufficient wallet balance. Please fund your wallet first.'
        );
        handleFundWallet();
      } else {
        toast.error(msg);
      }
    }
  };

  const handleFundWallet = () => {
    handleClose();
    NiceModal.show(FundWalletModal);
  };

  const chosen = packs.findIndex((p) => p.id === selectedPackage);
  const selectedIndex = chosen >= 0 ? chosen : defaultPackIndex(packs);
  const selected: TokenPack | undefined = packs[selectedIndex];
  const SelectedIcon = iconFor(selectedIndex);
  const price = selected?.price_ngn ?? 0;
  const hasEnough = walletBalance >= price;
  const errorText = purchaseError
    ? readApiError(purchaseError, 'An error occurred')
    : null;

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-4 sm:p-6 bg-card">
        {activeSection === 'buy-tokens' && (
          <>
            <DialogHeader className="text-left pb-4">
              <DialogTitle className="text-base font-medium text-[#0C0C0D] dark:text-white">
                Buy Tokens
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm font-normal text-[#0C0C0D] dark:text-white mb-4">
              Tokens power AI design generation, and they don&apos;t expire.
              Choose a pack:
            </p>

            {packsLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            )}
            {packsError && !packs.length && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="size-4" />
                <span>
                  Couldn&apos;t load the token packs. Close and try again.
                </span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {packs.map((pkg, i) => {
                const isSelected = selected?.id === pkg.id;
                const pkgPrice = pkg.price_ngn;
                const PkgIcon = iconFor(i);

                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-[10px] focus:outline-none transition py-4 px-3 cursor-pointer border ${
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-border bg-white dark:bg-[#404040] hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md ${isSelected ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-700'}`}
                      >
                        <PkgIcon
                          className={`size-5 ${isSelected ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                        />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium text-[#333333] dark:text-gray-200">
                            {pkg.name}
                          </span>
                          {pkg.tag && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-secondary/10 text-secondary rounded">
                              {pkg.tag}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#646A86] dark:text-gray-400">
                          {pkg.total_tokens.toLocaleString()} tokens
                          {pkg.bonus_tokens > 0 &&
                            ` (${pkg.bonus_tokens.toLocaleString()} free)`}
                          {pkg.designs != null &&
                            ` · about ${pkg.designs} design${pkg.designs === 1 ? '' : 's'}`}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-[#0C0C0D] dark:text-white">
                      ₦{pkgPrice.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!selected}
              onClick={() => setActiveSection('confirm-token-purchase')}
            >
              {selected ? `Continue with ${selected.name}` : 'Choose a pack'}
            </Button>
          </>
        )}

        {activeSection === 'confirm-token-purchase' && (
          <>
            <DialogHeader className="text-left pb-4">
              <DialogTitle className="text-base font-medium text-[#0C0C0D] dark:text-white flex items-center gap-2">
                Confirm Purchase
              </DialogTitle>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-white dark:bg-[#404040] p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-md">
                  <SelectedIcon className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-[#0C0C0D] dark:text-white">
                    {selected?.name} · {selected?.total_tokens.toLocaleString()}{' '}
                    tokens
                  </div>
                  <div className="text-xs text-[#646A86] dark:text-gray-400">
                    Deducted from wallet
                  </div>
                </div>
                <div className="ml-auto font-semibold text-[#0C0C0D] dark:text-white">
                  ₦{price.toLocaleString()}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-[#646A86] dark:text-gray-400">
                    Wallet Balance
                  </span>
                  <span
                    className={`font-medium ${hasEnough ? 'text-[#0C0C0D] dark:text-white' : 'text-destructive'}`}
                  >
                    ₦{walletBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#646A86] dark:text-gray-400">
                    Total Cost
                  </span>
                  <span className="font-medium text-[#0C0C0D] dark:text-white">
                    -₦{price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-border font-medium">
                  <span className="text-[#0C0C0D] dark:text-white">
                    Remaining Balance
                  </span>
                  <span
                    className={hasEnough ? 'text-primary' : 'text-destructive'}
                  >
                    ₦{Math.max(0, walletBalance - price).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {!hasEnough && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="size-4" />
                <span>
                  Insufficient balance.{' '}
                  <button
                    onClick={handleFundWallet}
                    className="underline font-medium hover:text-destructive/80"
                  >
                    Fund wallet
                  </button>
                </span>
              </div>
            )}

            {errorText && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="size-4" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActiveSection('buy-tokens')}
                disabled={isPurchasing}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handlePurchase}
                disabled={!hasEnough || isPurchasing}
              >
                {isPurchasing && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isPurchasing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </>
        )}

        {activeSection === 'token-purchase-success' && (
          <div className="pt-6 flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <CircleCheck className="size-8 text-green-600 dark:text-green-500" />
            </div>

            <DialogTitle className="text-xl font-semibold text-[#0C0C0D] dark:text-white mb-2">
              Purchase Successful
            </DialogTitle>

            <p className="text-sm text-[#646A86] dark:text-gray-400 mb-8">
              You have successfully purchased{' '}
              <strong className="text-[#0C0C0D] dark:text-white font-medium">
                {purchasedTokens} tokens
              </strong>
              .
            </p>

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
