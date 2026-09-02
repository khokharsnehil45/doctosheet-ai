'use client';

import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Tag,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/AuthContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onSuccessUnlock,
}) => {
  const { user, unlockPro } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyPromo = () => {
    setErrorMsg('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'LAUNCH50' || code === 'HALFOFF') {
      setPromoApplied(true);
      setDiscountAmount(50);
    } else if (code === 'EARLYBIRD' || code === 'FOUNDER') {
      setPromoApplied(true);
      setDiscountAmount(25);
    } else {
      setErrorMsg('Invalid promo code. Try "LAUNCH50" or "EARLYBIRD".');
    }
  };

  const calculatePrice = (base: number) => {
    if (!promoApplied) return base;
    return Math.round(base * (1 - discountAmount / 100));
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Call mock Stripe checkout endpoint
      await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan === 'monthly' ? 'monthly_pro' : 'lifetime_pro',
          promoCode: promoApplied ? promoCode : undefined,
          userEmail: user?.email,
        }),
      });

      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Unlock Pro Tier for logged-in user
      const planName =
        selectedPlan === 'monthly'
          ? 'Pro Unlimited ($19/mo)'
          : 'Pro Lifetime ($99 one-time)';
      unlockPro(planName);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore canvas error if any
      }

      setIsProcessing(false);
      if (onSuccessUnlock) onSuccessUnlock();
      onClose();
    } catch (err: unknown) {
      setIsProcessing(false);
      const message = err instanceof Error ? err.message : 'Payment simulation failed.';
      setErrorMsg(message);
    }
  };

  const handleActivateWithLicenseKey = () => {
    const key = licenseKeyInput.trim().toUpperCase();
    if (key === 'PRO-UNLIMITED-2025' || key.startsWith('PRO-')) {
      unlockPro('Pro Unlimited (License Key)');
      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch {
        // Ignore
      }
      if (onSuccessUnlock) onSuccessUnlock();
      onClose();
    } else {
      setErrorMsg('Invalid license key format. Use format "PRO-UNLIMITED-2025".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                Unlock DocToSheet Pro
              </h2>
              <p className="text-xs text-zinc-600">
                {user ? `Account: ${user.email}` : '2 free conversions completed.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Plan Selector */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Plan */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                selectedPlan === 'monthly'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Monthly Pro
                </span>
                {selectedPlan === 'monthly' && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="text-2xl font-black tracking-tight">
                ${calculatePrice(19)}
                <span className={`text-xs font-normal ${selectedPlan === 'monthly' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  /mo
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${selectedPlan === 'monthly' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Cancel anytime. Zero commitment.
              </p>
            </div>

            {/* Lifetime Plan */}
            <div
              onClick={() => setSelectedPlan('lifetime')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                selectedPlan === 'lifetime'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Lifetime Pass
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950">
                  Best Value
                </span>
              </div>
              <div className="text-2xl font-black tracking-tight">
                ${calculatePrice(99)}
                <span className={`text-xs font-normal ${selectedPlan === 'lifetime' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {' '}pay once
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${selectedPlan === 'lifetime' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Perpetual license for solo builders.
              </p>
            </div>
          </div>

          {/* Pro Features Included */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Everything in Pro:
            </span>
            <ul className="space-y-2 text-xs text-zinc-700">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span><strong>Unlimited</strong> document-to-sheet conversions</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Managed Gemini 1.5 Flash High-Speed AI Engine</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>1-Click direct <strong>Excel (.XLS)</strong>, <strong>CSV</strong>, and TSV exports</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Persistent User Profile & Multiple Device Sync</span>
              </li>
            </ul>
          </div>

          {/* Promo Code Input */}
          <div className="pt-2 border-t border-zinc-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Coupon code (e.g. LAUNCH50)"
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 uppercase text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {promoApplied && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                ✓ Promo code applied! {discountAmount}% discount saved.
              </p>
            )}
            {errorMsg && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{errorMsg}</p>
            )}
          </div>

          {/* Checkout CTA */}
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                <span>Authorizing Stripe Checkout...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>
                  Activate Pro Tier (${calculatePrice(selectedPlan === 'monthly' ? 19 : 99)})
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Existing License Key Toggle */}
          <div className="pt-2 text-center">
            <details className="text-left text-xs text-zinc-600">
              <summary className="cursor-pointer text-zinc-600 hover:text-zinc-900 font-medium select-none">
                Already have a license key or test coupon?
              </summary>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  placeholder="PRO-UNLIMITED-2025"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 uppercase font-mono text-zinc-900"
                />
                <button
                  type="button"
                  onClick={handleActivateWithLicenseKey}
                  className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Unlock
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted 256-bit Stripe checkout simulation • 30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  );
};
