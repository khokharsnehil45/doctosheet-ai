'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Check,
  RefreshCw,
  Crown,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import {
  getCustomApiKey,
  setCustomApiKey,
  resetQuotaForTesting,
  unlockProTier,
  getUserQuota,
} from '@/lib/quota';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshState: () => void;
  isPro?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshState,
  isPro = false,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [currentIsPro, setCurrentIsPro] = useState(isPro);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getCustomApiKey());
      setSaved(false);
      const quota = getUserQuota();
      setCurrentIsPro(quota.isPro);
    }
  }, [isOpen, isPro]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    setCustomApiKey(apiKey);
    setSaved(true);
    onRefreshState();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    setCustomApiKey('');
    onRefreshState();
  };

  const handleResetCredits = () => {
    resetQuotaForTesting();
    setCurrentIsPro(false);
    onRefreshState();
  };

  const handleForcePro = () => {
    unlockProTier('Pro Unlimited (Dev Override)');
    setCurrentIsPro(true);
    onRefreshState();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Developer Settings & API Key</h2>
              <p className="text-[11px] text-zinc-600">
                Hybrid API configuration & local storage controls
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Hybrid API Key Management */}
          {currentIsPro ? (
            /* PRO User View: Hide manual key input, show Managed Badge */
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-600" />
                  PRO Subscription Active
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  Managed by DocToSheet Team
                </span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Your account is authenticated via high-speed serverless Gemini 1.5 Flash infrastructure. Requests automatically bypass client keys and are routed through server environment credentials.
              </p>
            </div>
          ) : (
            /* FREE User View: Allow entering personal Gemini key */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Personal Google Gemini API Key</span>
                </label>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Free Tier BYOK
                </span>
              </div>
              <p className="text-[11px] text-zinc-600">
                Save your personal Gemini Flash key to your browser&apos;s <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">localStorage</code>. Free users without a key can use the Offline Engine or upgrade to PRO.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 text-zinc-900 font-mono placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
                />
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="p-2 text-zinc-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-zinc-200 cursor-pointer"
                    title="Clear key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Key Saved!</span>
                    </>
                  ) : (
                    <span>Save Key to LocalStorage</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Dev / Testing Utilities */}
          <div className="pt-3 border-t border-zinc-100 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Developer State Overrides:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleResetCredits}
                className="p-2.5 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-600" />
                <span>Reset to Free Tier</span>
              </button>
              <button
                type="button"
                onClick={handleForcePro}
                className="p-2.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Activate Pro Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
