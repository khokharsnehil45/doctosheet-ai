'use client';

import React from 'react';
import { Sparkles, FileSpreadsheet, KeyRound, Crown } from 'lucide-react';
import { UserCreditsState } from '@/lib/types';

interface HeaderProps {
  credits: UserCreditsState;
  onOpenUpgrade: () => void;
  onOpenSettings: () => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  credits,
  onOpenUpgrade,
  onOpenSettings,
  hasCustomKey,
}) => {
  const remaining = Math.max(0, credits.maxFreeCredits - credits.creditsUsed);

  return (
    <header className="w-full border-b border-zinc-200 bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 text-base tracking-tight">
                DocToSheet <span className="text-zinc-500 font-normal">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                Micro-SaaS
              </span>
            </div>
            <p className="text-xs text-zinc-600 hidden sm:block">
              Convert unstructured financial & legal text into clean spreadsheets
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Custom API Key Badge if set */}
          {hasCustomKey && (
            <button
              onClick={onOpenSettings}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              title="Custom Gemini API Key is active"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>BYOK Active</span>
            </button>
          )}

          {/* Credits or Pro Pill */}
          {credits.isPro ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>PRO Plan</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
              <span>{remaining} / {credits.maxFreeCredits} Free Credits</span>
            </div>
          )}

          {/* Upgrade Button */}
          {!credits.isPro ? (
            <button
              onClick={onOpenUpgrade}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Upgrade ($19/mo)</span>
            </button>
          ) : null}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-colors"
            title="Settings & API Key"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
