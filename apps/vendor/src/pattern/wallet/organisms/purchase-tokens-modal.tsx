'use client';

import React, { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Sparkles, Zap, Crown, Gem, AlertCircle, Loader2, CircleCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePurchaseVendorTokensMutation } from '@/redux/services/tokens/tokens.api-slice';
import { useGetWalletBalanceQuery } from '@/redux/services/wallet/wallet.api-slice';
import { FundWalletModal } from './fund-wallet-modal';
import { toast } from 'sonner';

type ActiveSection = 'buy-tokens' | 'confirm-token-purchase' | 'token-purchase-success';

const TOKEN_PACKAGES = [
  { id: 'starter', tokens: 5, icon: Sparkles, tag: null },
  { id: 'popular', tokens: 15, icon: Zap, tag: 'BEST VALUE' },
  { id: 'pro', tokens: 30, icon: Gem, tag: 'SAVE MORE' },
  { id: 'ultimate', tokens: 60, icon: Crown, tag: 'BEST DEAL' },
];

const FALLBACK_PRICE_PER_TOKEN_NGN = 16.5;

export const PurchaseTokensModal = NiceModal.create(() => {
  const { visible, resolve, remove } = useModal();
  const [activeSection, setActiveSection] = useState<ActiveSection>('buy-tokens');
  const [selectedPackage, setSelectedPackage] = useState('popular');
  const [purchasedTokens, setPurchasedTokens] = useState(0);

  const { data: balanceData, refetch: refetchBalance } = useGetWalletBalanceQuery();
  
  const readBalance = (raw: unknown): number => {
    if (typeof raw === 'number') return raw;
    const d = (raw ?? {}) as Record<string, unknown>;
    for (const key of ['balance', 'availableBalance', 'available_balance', 'amount']) {
      if (typeof d[key] === 'number') return d[key] as number;
    }
    return 0;
  };
  
  const walletBalance = readBalance(balanceData?.data);

  const [purchaseTokensMutation, { isLoading: isPurchasing, error: purchaseError }] = usePurchaseVendorTokensMutation();

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  const handlePurchase = async () => {
    const selected = TOKEN_PACKAGES.find((p) => p.id === selectedPackage) || TOKEN_PACKAGES[1];
    setPurchasedTokens(selected.tokens);

    try {
      await purchaseTokensMutation({ amount: selected.tokens }).unwrap();
      refetchBalance();
      setActiveSection('token-purchase-success');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to purchase tokens. Please try again.';
      toast.error(msg);
    }
  };

  const handleFundWallet = () => {
    handleClose();
    NiceModal.show(FundWalletModal);
  };

  const selected = TOKEN_PACKAGES.find((p) => p.id === selectedPackage) || TOKEN_PACKAGES[1];
  const SelectedIcon = selected.icon;
  const price = Math.round(FALLBACK_PRICE_PER_TOKEN_NGN * selected.tokens * 10) / 10;
  const hasEnough = walletBalance >= price;
  const errorText = purchaseError ? ((purchaseError as any)?.data?.message || 'An error occurred') : null;

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className='max-w-md p-6 dark:bg-muted'>
        {activeSection === 'buy-tokens' && (
          <>
            <DialogHeader className='text-left pb-4'>
              <DialogTitle className='text-base font-medium text-[#0C0C0D] dark:text-white'>
                Buy Tokens
              </DialogTitle>
            </DialogHeader>

            <p className='text-sm font-normal text-[#0C0C0D] dark:text-white mb-4'>
              Tokens power AI design generation. Choose a package:
            </p>

            <div className='space-y-4 mb-6'>
              {TOKEN_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                const pkgPrice = Math.round(FALLBACK_PRICE_PER_TOKEN_NGN * pkg.tokens * 10) / 10;
                const PkgIcon = pkg.icon;
                
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
                    <div className='flex items-center gap-3'>
                      <div className={`p-2 rounded-md ${isSelected ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <PkgIcon className={`size-5 ${isSelected ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`} />
                      </div>
                      <div className='text-left'>
                        <div className='flex items-center gap-2'>
                          <span className='text-base font-medium text-[#333333] dark:text-gray-200'>
                            {pkg.tokens} Tokens
                          </span>
                          {pkg.tag && (
                            <span className='px-1.5 py-0.5 text-[10px] font-semibold bg-secondary/10 text-secondary rounded'>
                              {pkg.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='font-semibold text-[#0C0C0D] dark:text-white'>
                      ₦{pkgPrice.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              className='w-full'
              size='lg'
              onClick={() => setActiveSection('confirm-token-purchase')}
            >
              Continue with {selected.tokens} Tokens
            </Button>
          </>
        )}

        {activeSection === 'confirm-token-purchase' && (
          <>
            <DialogHeader className='text-left pb-4'>
              <DialogTitle className='text-base font-medium text-[#0C0C0D] dark:text-white flex items-center gap-2'>
                Confirm Purchase
              </DialogTitle>
            </DialogHeader>

            <div className='rounded-xl border border-border bg-white dark:bg-[#404040] p-4 mb-4'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-primary/10 rounded-md'>
                  <SelectedIcon className='size-5 text-primary' />
                </div>
                <div>
                  <div className='font-medium text-[#0C0C0D] dark:text-white'>
                    {selected.tokens} Tokens
                  </div>
                  <div className='text-xs text-[#646A86] dark:text-gray-400'>
                    Deducted from wallet
                  </div>
                </div>
                <div className='ml-auto font-semibold text-[#0C0C0D] dark:text-white'>
                  ₦{price.toLocaleString()}
                </div>
              </div>

              <div className='space-y-3 pt-3 border-t border-border'>
                <div className='flex justify-between text-sm'>
                  <span className='text-[#646A86] dark:text-gray-400'>Wallet Balance</span>
                  <span className={`font-medium ${hasEnough ? 'text-[#0C0C0D] dark:text-white' : 'text-destructive'}`}>
                    ₦{walletBalance.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-[#646A86] dark:text-gray-400'>Total Cost</span>
                  <span className='font-medium text-[#0C0C0D] dark:text-white'>
                    -₦{price.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between text-sm pt-3 border-t border-border font-medium'>
                  <span className='text-[#0C0C0D] dark:text-white'>Remaining Balance</span>
                  <span className={hasEnough ? 'text-primary' : 'text-destructive'}>
                    ₦{Math.max(0, walletBalance - price).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {!hasEnough && (
              <div className='flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm'>
                <AlertCircle className='size-4' />
                <span>
                  Insufficient balance.{' '}
                  <button onClick={handleFundWallet} className='underline font-medium hover:text-destructive/80'>
                    Fund wallet
                  </button>
                </span>
              </div>
            )}

            {errorText && (
              <div className='flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm'>
                <AlertCircle className='size-4' />
                <span>{errorText}</span>
              </div>
            )}

            <div className='flex gap-3 mt-2'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => setActiveSection('buy-tokens')}
                disabled={isPurchasing}
              >
                Back
              </Button>
              <Button
                className='flex-1'
                onClick={handlePurchase}
                disabled={!hasEnough || isPurchasing}
              >
                {isPurchasing && <Loader2 className='mr-2 size-4 animate-spin' />}
                {isPurchasing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </>
        )}

        {activeSection === 'token-purchase-success' && (
          <div className='py-6 flex flex-col items-center text-center'>
            <div className='size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6'>
              <CircleCheck className='size-8 text-green-600 dark:text-green-500' />
            </div>
            
            <DialogTitle className='text-xl font-semibold text-[#0C0C0D] dark:text-white mb-2'>
              Purchase Successful
            </DialogTitle>
            
            <p className='text-sm text-[#646A86] dark:text-gray-400 mb-8'>
              You have successfully purchased <strong className='text-[#0C0C0D] dark:text-white font-medium'>{purchasedTokens} tokens</strong>.
            </p>
            
            <Button className='w-full' onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
