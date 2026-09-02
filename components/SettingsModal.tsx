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
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshState?: () => void;
  isPro?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, saveApiKey, unlockPro, resetCredits } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(user?.customApiKey || '');
      setSaved(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    saveApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    saveApiKey('');
  };

  const handleResetCredits = () => {
    resetCredits();
  };

  const handleForcePro = () => {
    unlockPro('Pro Unlimited (Dev Override)');
  };

  const isProUser = Boolean(user?.isPro);

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
                {user ? `Linked to ${user.email}` : 'Hybrid API key management'}
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
          {/* User Profile Badge */}
          {user && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
              <div className="flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-semibold text-zinc-800">{user.email}</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                ID: {user.id.substring(0, 10)}...
              </span>
            </div>
          )}

          {/* Hybrid API Key Management */}
          {isProUser ? (
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
                Save your personal Gemini Flash key linked securely to your account ID. Free users without a key can use the Offline Engine or upgrade to PRO.
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
                    <span>Save Key to Profile</span>
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
                <span>Reset User Credits</span>
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
