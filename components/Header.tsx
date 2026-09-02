'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  FileSpreadsheet,
  KeyRound,
  Crown,
  User as UserIcon,
  LogOut,
  LogIn,
  History,
} from 'lucide-react';
import { User } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  user: User | null;
  historyCount?: number;
  onOpenHistory: () => void;
  onOpenUpgrade: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  historyCount = 0,
  onOpenHistory,
  onOpenUpgrade,
  onOpenSettings,
  onLogout,
}) => {
  const isPro = Boolean(user?.isPro);
  const remaining = user
    ? Math.max(0, user.maxFreeCredits - (user.creditsUsed || 0))
    : 2;
  const hasCustomKey = Boolean(user?.customApiKey && user.customApiKey.trim().length > 0);

  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base tracking-tight">
                DocToSheet <span className="text-zinc-500 dark:text-zinc-400 font-normal">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Micro-SaaS
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Convert unstructured financial & legal text into clean spreadsheets
            </p>
          </div>
        </Link>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* History / Saved Spreadsheets Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="View saved spreadsheets in Supabase database"
          >
            <History className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden sm:inline">Spreadsheets</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Custom API Key Badge if set */}
          {hasCustomKey && (
            <button
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
              title="Personal Gemini API Key is linked to your account"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>BYOK</span>
            </button>
          )}

          {/* User Credits or Pro Pill */}
          {user ? (
            isPro ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-medium">
                <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>PRO</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{remaining} / {user.maxFreeCredits}</span>
              </div>
            )
          ) : null}

          {/* Upgrade Button */}
          {user && !isPro && (
            <button
              onClick={onOpenUpgrade}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>Upgrade</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors cursor-pointer"
            title="Settings & API Key"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* User Profile & Logout or Login */}
          {user ? (
            <div className="flex items-center gap-1 pl-1 border-l border-zinc-200 dark:border-zinc-800">
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium max-w-[110px] sm:max-w-[140px] truncate"
                title={`Logged in as ${user.email}`}
              >
                <UserIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                <span className="truncate">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-white transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
