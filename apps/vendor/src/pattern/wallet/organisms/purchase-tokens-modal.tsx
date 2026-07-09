'use client';

import React, { useState, useEffect, useRef } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Sparkles, Zap, Crown, Gem, AlertCircle, Loader2, ArrowLeft, CircleCheck, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { usePurchaseVendorTokensMutation } from '@/redux/services/tokens/tokens.api-slice';
import { useGetWalletPriceQuery, useGetWalletBalanceQuery } from '@/redux/services/wallet/wallet.api-slice';
import { FundWalletModal } from './fund-wallet-modal';
import { toast } from 'sonner';

type ActiveSection = 'buy-tokens' | 'confirm-token-purchase' | 'token-purchase-success';

const TOKEN_PACKAGES = [
  { id: 'starter', tokens: 5, icon: Sparkles, color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.08)', tag: null },
  { id: 'popular', tokens: 15, icon: Zap, color: '#D4AF37', bgColor: 'rgba(212,175,55,0.08)', tag: 'BEST VALUE' },
  { id: 'pro', tokens: 30, icon: Gem, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)', tag: 'SAVE MORE' },
  { id: 'ultimate', tokens: 60, icon: Crown, color: '#462814', bgColor: 'rgba(70,40,20,0.06)', tag: 'BEST DEAL' },
];

const FALLBACK_PRICE_PER_TOKEN_NGN = 16.5;

export const PurchaseTokensModal = NiceModal.create(() => {
  const modal = useModal();
  const [activeSection, setActiveSection] = useState<ActiveSection>('buy-tokens');
  const [selectedPackage, setSelectedPackage] = useState('popular');
  const [purchasedTokens, setPurchasedTokens] = useState(0);

  const { data: balanceData, refetch: refetchBalance } = useGetWalletBalanceQuery();
  
  // The balance response shape is undocumented, mirroring wallet-page-template.tsx
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

  const handlePurchase = async () => {
    const selected = TOKEN_PACKAGES.find((p) => p.id === selectedPackage) || TOKEN_PACKAGES[1];
    setPurchasedTokens(selected.tokens);

    try {
      await purchaseTokensMutation({ amount: selected.tokens }).unwrap();
      refetchBalance(); // Ensure UI gets latest balance
      setActiveSection('token-purchase-success');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to purchase tokens. Please try again.';
      toast.error(msg);
    }
  };

  const handleFundWallet = () => {
    NiceModal.show(FundWalletModal);
  };

  const selected = TOKEN_PACKAGES.find((p) => p.id === selectedPackage) || TOKEN_PACKAGES[1];
  const SelectedIcon = selected.icon;
  // Calculate price dynamically (using fallback rate if api doesn't provide dynamic rate per token)
  const price = Math.round(FALLBACK_PRICE_PER_TOKEN_NGN * selected.tokens * 10) / 10;
  const hasEnough = walletBalance >= price;
  const errorText = purchaseError ? ((purchaseError as any)?.data?.message || 'An error occurred') : null;

  return (
    <Dialog open={modal.visible} onOpenChange={() => modal.remove()}>
      <DialogContent className='sm:max-w-[450px] p-0 overflow-hidden bg-white dark:bg-[#111] rounded-2xl'>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-white/5 relative z-10 bg-white dark:bg-[#111]">
          {activeSection === 'confirm-token-purchase' && (
            <button
              onClick={() => setActiveSection('buy-tokens')}
              className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="size-5 text-[#1A1A1A] dark:text-white" />
            </button>
          )}
          {activeSection !== 'confirm-token-purchase' && <div />}
          <button
            onClick={() => modal.remove()}
            className="p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        <DialogTitle className="sr-only">Purchase Tokens</DialogTitle>
        <DialogDescription className="sr-only">Select and purchase a token package.</DialogDescription>

        <div className="p-6">
          {activeSection === 'buy-tokens' && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-base font-extrabold text-[#1A1A1A] dark:text-white uppercase tracking-wider">Choose a Token Package</h2>
                <p className="text-xs text-[#999] leading-relaxed">
                  Tokens power AI design generation in Bespoke Studio. More tokens, better value.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {TOKEN_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  const pkgPrice = Math.round(FALLBACK_PRICE_PER_TOKEN_NGN * pkg.tokens * 10) / 10;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`flex items-center justify-between transition-all active:scale-[0.99] p-4 rounded-xl border-2 text-left cursor-pointer ${
                        isSelected ? 'bg-[#FAFAFA] dark:bg-white/5' : 'bg-[#FAFAFA] dark:bg-white/5 border-[#F0F0F0] dark:border-white/5'
                      }`}
                      style={{ borderColor: isSelected ? pkg.color : undefined }}
                    >
                      <span className="text-[15px] text-[#1A1A1A] dark:text-white">
                        <strong className="font-extrabold">{pkg.tokens.toLocaleString()}</strong>{' '}
                        <span className="font-medium text-[#666] dark:text-gray-400">tokens</span>
                        {pkg.tag && (
                          <span
                            className="ml-2 py-0.5 px-2 rounded font-extrabold text-[9px] uppercase tracking-wider"
                            style={{ background: pkg.bgColor, color: pkg.color }}
                          >
                            {pkg.tag}
                          </span>
                        )}
                      </span>
                      <span
                        className="px-4 py-1.5 rounded-full text-white text-xs font-bold min-w-[80px] text-center"
                        style={{ background: isSelected ? pkg.color : '#462814' }}
                      >
                        ₦{pkgPrice.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveSection('confirm-token-purchase')}
                className="w-full flex items-center justify-center p-4 rounded-xl text-white text-[13px] font-extrabold uppercase tracking-wider border-none transition-all hover:opacity-90 active:scale-[0.98] bg-[#462814]"
              >
                Buy {selected.tokens} Tokens — ₦{price.toLocaleString()}
              </button>
            </div>
          )}

          {activeSection === 'confirm-token-purchase' && (
            <div className="animate-fade-in flex flex-col gap-6">
              <h2 className="text-base font-extrabold text-[#1A1A1A] dark:text-white uppercase tracking-wider">Confirm Purchase</h2>

              <div className="p-6 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <span className="text-[10px] font-extrabold text-[#999] uppercase tracking-wider">Order Summary</span>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: selected.bgColor }}
                    >
                      <SelectedIcon size={20} color={selected.color} strokeWidth={1.8} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">{selected.tokens} Tokens</span>
                      <span className="text-xs text-[#888]">Deducted from wallet</span>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-[#1A1A1A] dark:text-white">₦{price.toLocaleString()}</span>
                </div>

                <div className="flex flex-col mt-6 pt-5 border-t border-dashed border-black/10 dark:border-white/10 gap-3">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#666] dark:text-gray-400">Wallet Balance</span>
                    <span className={`font-semibold ${hasEnough ? 'text-[#1A1A1A] dark:text-white' : 'text-red-500'}`}>
                      ₦{walletBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#666] dark:text-gray-400">Token Cost</span>
                    <span className="font-semibold text-[#1A1A1A] dark:text-white">-₦{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-3 border-t border-black/5 dark:border-white/5">
                    <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">Remaining</span>
                    <span className={`text-lg font-extrabold ${hasEnough ? 'text-[#462814] dark:text-yellow-500' : 'text-red-500'}`}>
                      ₦{Math.max(0, walletBalance - price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {!hasEnough && (
                <div className="flex items-center p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 gap-2.5">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <span className="text-xs text-red-500 font-semibold">
                    Insufficient wallet balance.{' '}
                    <button
                      onClick={handleFundWallet}
                      className="underline bg-transparent border-none text-red-500 font-bold cursor-pointer"
                    >
                      Fund wallet
                    </button>
                  </span>
                </div>
              )}

              {errorText && (
                <div className="flex items-center p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 gap-2.5">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <span className="text-xs text-red-500 font-semibold">{errorText}</span>
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={isPurchasing || !hasEnough}
                className={`w-full flex items-center justify-center p-4 rounded-xl text-white text-[13px] font-extrabold uppercase tracking-wider border-none transition-all gap-2 mt-3 ${
                  isPurchasing || !hasEnough
                    ? 'bg-[#D4C9C0] cursor-not-allowed text-white/70 dark:bg-white/10 dark:text-white/30'
                    : 'bg-[#462814] hover:opacity-90 active:scale-[0.98] cursor-pointer'
                }`}
              >
                {isPurchasing && <Loader2 size={16} className="animate-spin" />}
                {isPurchasing ? 'Processing...' : `Confirm — ₦${price.toLocaleString()}`}
              </button>
            </div>
          )}

          {activeSection === 'token-purchase-success' && (
            <div className="animate-fade-in flex flex-col items-center justify-center text-center gap-6 py-8">
              <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-green-50 dark:bg-green-500/10">
                <CircleCheck size={40} className="text-green-500" strokeWidth={1.5} />
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">Purchase Successful!</h2>
                <p className="text-sm text-[#666] dark:text-gray-400 leading-relaxed max-w-[280px]">
                  You've purchased <strong>{purchasedTokens} tokens</strong>.
                </p>
              </div>

              <button
                onClick={() => modal.remove()}
                className="w-full mt-4 flex items-center justify-center p-4 rounded-xl bg-[#462814] text-white text-[13px] font-extrabold uppercase tracking-wider border-none cursor-pointer hover:opacity-90 active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
