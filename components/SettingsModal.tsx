'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Check,
  RefreshCw,
  Crown,
  Trash2,
} from 'lucide-react';
import {
  getCustomApiKey,
  setCustomApiKey,
  resetQuotaForTesting,
  unlockProTier,
} from '@/lib/quota';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshState: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshState,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getCustomApiKey());
      setSaved(false);
    }
  }, [isOpen]);

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
    onRefreshState();
  };

  const handleForcePro = () => {
    unlockProTier('Pro Unlimited (Dev Override)');
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
              <h2 className="text-sm font-bold text-zinc-900">Settings & BYOK</h2>
              <p className="text-[11px] text-zinc-600">
                Configure custom Gemini API key and dev tools
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
          {/* Custom Gemini API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
              <span>Google Gemini API Key (Optional)</span>
              <span className="text-[10px] text-zinc-600 font-normal">BYOK</span>
            </label>
            <p className="text-[11px] text-zinc-600">
              Provide your own Gemini Flash API key. Stored strictly in your local browser storage.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 text-zinc-900 font-mono placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900"
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
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Key</span>
                )}
              </button>
            </div>
          </div>

          {/* Dev / Testing Utilities */}
          <div className="pt-3 border-t border-zinc-100 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Testing & Quota Controls:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleResetCredits}
                className="p-2.5 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-600" />
                <span>Reset Free Quota</span>
              </button>
              <button
                type="button"
                onClick={handleForcePro}
                className="p-2.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulate Pro Tier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-zinc-200 text-zinc-800 hover:bg-zinc-300 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
