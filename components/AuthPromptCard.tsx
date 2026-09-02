'use client';

import React from 'react';
import { LogIn, Sparkles, UserCheck, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AuthPromptCardProps {
  onContinueAsGuest: () => void;
  onDismiss: () => void;
}

export const AuthPromptCard: React.FC<AuthPromptCardProps> = ({
  onContinueAsGuest,
  onDismiss,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                Authentication Required
              </h4>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Save & Track Free Quota
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
              Sign in or continue as a guest to securely link your document conversion quotas, saved API keys, and spreadsheet export history.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/login?redirect=/"
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <button
                type="button"
                onClick={onContinueAsGuest}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Continue as Guest (1-Click)</span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
