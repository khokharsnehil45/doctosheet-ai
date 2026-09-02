'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Menu,
  X,
  ShieldCheck,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isPro = Boolean(user?.isPro);
  const remaining = user
    ? Math.max(0, user.maxFreeCredits - (user.creditsUsed || 0))
    : 2;
  const hasCustomKey = Boolean(user?.customApiKey && user.customApiKey.trim().length > 0);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base tracking-tight">
              DocToSheet <span className="text-zinc-500 dark:text-zinc-400 font-normal">AI</span>
            </span>
            <span className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hidden sm:inline-block">
              SaaS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation (>= sm) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Theme Switcher */}
          <ThemeToggle />

          {/* History / Saved Spreadsheets */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Saved spreadsheets in Supabase"
          >
            <History className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Spreadsheets</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* BYOK Badge if set */}
          {hasCustomKey && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>BYOK</span>
            </button>
          )}

          {/* User Credits / Pro Status */}
          {user ? (
            isPro ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>PRO</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{remaining} / {user.maxFreeCredits} Credits</span>
              </div>
            )
          ) : null}

          {/* Upgrade Button */}
          {user && !isPro && (
            <button
              onClick={onOpenUpgrade}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white transition-all shadow-xs cursor-pointer"
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

          {/* User Profile & Logout */}
          {user ? (
            <div className="flex items-center gap-1 pl-1 border-l border-zinc-200 dark:border-zinc-800">
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium max-w-[130px] truncate"
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

        {/* Mobile Navigation Bar (< sm): Clean, Symmetrical & No Overflow */}
        <div className="flex sm:hidden items-center gap-1.5">
          {/* Theme Toggle */}
          <ThemeToggle className="p-1.5" />

          {/* Spreadsheets History Trigger */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors relative cursor-pointer"
            title="Saved Spreadsheets"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Credits or Pro Pill */}
          {user && (
            isPro ? (
              <div className="px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>PRO</span>
              </div>
            ) : (
              <div className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold">
                {remaining} left
              </div>
            )
          )}

          {/* Mobile Hamburger / Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="sm:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150"
        >
          {/* User Profile Card */}
          {user ? (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {user.name || user.email.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </Link>
          )}

          {/* Quick Menu Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {user && !isPro && (
              <button
                type="button"
                onClick={() => {
                  onOpenUpgrade();
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade ($19)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className={`py-2.5 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                !user || isPro ? 'col-span-2' : ''
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Settings & Key</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Encrypted Session</span>
            </span>
            <span>{isPro ? 'Pro Unlimited' : `${remaining} credits remaining`}</span>
          </div>
        </div>
      )}
    </header>
  );
};
