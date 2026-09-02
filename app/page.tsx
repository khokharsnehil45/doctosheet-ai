'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DocumentTypeSelector } from '@/components/DocumentTypeSelector';
import { InputZone } from '@/components/InputZone';
import { StatCards } from '@/components/StatCards';
import { PreviewTable } from '@/components/PreviewTable';
import { ExportToolbar } from '@/components/ExportToolbar';
import { PaywallModal } from '@/components/PaywallModal';
import { SettingsModal } from '@/components/SettingsModal';
import {
  DocumentType,
  ParsedDocumentResult,
  UserCreditsState,
  TableRow,
} from '@/lib/types';
import {
  getUserQuota,
  canPerformConversion,
  recordConversion,
  getCustomApiKey,
  getProSessionToken,
} from '@/lib/quota';
import { SAMPLE_DOCUMENTS } from '@/lib/samples';
import {
  FileSpreadsheet,
  Zap,
  KeyRound,
  Crown,
  Cpu,
  AlertCircle,
  X,
} from 'lucide-react';

export default function HomePage() {
  const [documentType, setDocumentType] = useState<DocumentType>('bank_statement');
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forceOffline, setForceOffline] = useState<boolean>(false);
  const [result, setResult] = useState<ParsedDocumentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keyValidationPrompt, setKeyValidationPrompt] = useState<boolean>(false);

  // Quota & Modals state
  const [creditsState, setCreditsState] = useState<UserCreditsState>({
    creditsUsed: 0,
    maxFreeCredits: 2,
    isPro: false,
  });
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);

  // Initialize quota from localStorage
  const refreshUserData = () => {
    const quota = getUserQuota();
    setCreditsState(quota);
    const key = getCustomApiKey();
    setHasCustomKey(Boolean(key && key.trim().length > 0));
  };

  useEffect(() => {
    refreshUserData();
    // Default load bank statement sample for convenience
    setInputText(SAMPLE_DOCUMENTS['bank_statement'].rawText);
  }, []);

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    if (!inputText || Object.values(SAMPLE_DOCUMENTS).some((s) => s.rawText === inputText)) {
      setInputText(SAMPLE_DOCUMENTS[type]?.rawText || '');
    }
  };

  const handleParse = async () => {
    setError(null);
    setKeyValidationPrompt(false);

    // 1. Quota Check: If free quota exhausted and not pro, trigger Paywall modal
    const { allowed, isPro } = canPerformConversion();
    if (!allowed && !isPro) {
      setIsPaywallOpen(true);
      return;
    }

    // 2. Hybrid Key Validation Check for Free Tier:
    // If user is on Free tier, has NOT entered their own API key, and did NOT check 'Offline Engine'
    const customKey = getCustomApiKey();
    if (!isPro && !forceOffline && (!customKey || customKey.trim() === '')) {
      setKeyValidationPrompt(true);
      return;
    }

    setIsLoading(true);

    try {
      const proToken = getProSessionToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isPro && proToken) {
        headers['x-pro-token'] = proToken;
        headers['authorization'] = `Bearer ${proToken}`;
      } else if (customKey) {
        headers['x-client-api-key'] = customKey.trim();
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: inputText,
          documentType,
          forceOffline,
          proToken: isPro ? proToken : undefined,
          customApiKey: !isPro ? customKey : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'FREE_TIER_KEY_REQUIRED') {
          setKeyValidationPrompt(true);
          return;
        }
        throw new Error(data.error || data.message || 'Failed to parse document');
      }

      const parsedData: ParsedDocumentResult = data;
      setResult(parsedData);

      // Record successful conversion
      const updatedQuota = recordConversion();
      setCreditsState(updatedQuota);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred during extraction. Please try again.';
      console.error('Parse error:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRows = (updatedRows: TableRow[]) => {
    if (!result) return;
    setResult({
      ...result,
      rows: updatedRows,
      metadata: {
        ...result.metadata,
        totalRows: updatedRows.length,
      },
    });
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseOfflineEngine = () => {
    setForceOffline(true);
    setKeyValidationPrompt(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Header */}
      <Header
        credits={creditsState}
        onOpenUpgrade={() => setIsPaywallOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasCustomKey={hasCustomKey}
      />

      {/* Main Single-Screen Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Intro Hero Badge & Description */}
        <section className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-zinc-900" />
            <span>Instant Document Text to CSV / Excel Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Structure Any Document Text in Seconds
          </h1>
          <p className="text-sm text-zinc-600">
            Paste unstructured bank statements, invoices, or lease agreements. Our hybrid AI & offline engine extracts
            precise rows and columns for 1-click spreadsheet download.
          </p>
        </section>

        {/* Format Selector */}
        <section className="max-w-4xl mx-auto">
          <DocumentTypeSelector
            selectedType={documentType}
            onSelect={handleDocumentTypeChange}
            disabled={isLoading}
          />
        </section>

        {/* Input Zone (Drop, Paste, Sample) */}
        <section className="max-w-4xl mx-auto space-y-4">
          <InputZone
            text={inputText}
            onChangeText={setInputText}
            documentType={documentType}
            onSelectDocumentType={handleDocumentTypeChange}
            onParse={handleParse}
            isLoading={isLoading}
            forceOffline={forceOffline}
            onToggleForceOffline={setForceOffline}
          />

          {/* Minimalist Validation Message when Free User needs Key / Offline / PRO */}
          {keyValidationPrompt && (
            <div className="p-4 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                      API Key Required on Free Tier
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                      Free users must provide their personal Gemini API key in Settings, use the 100% Offline Engine, or upgrade to PRO to use our managed high-speed AI infrastructure.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSettingsOpen(true)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Enter Gemini Key</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUseOfflineEngine}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Use 100% Offline Engine</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPaywallOpen(true)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Upgrade to PRO ($19/mo)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setKeyValidationPrompt(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="font-semibold underline hover:text-red-900 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* Structured Results Display (Hidden by default until parsed) */}
        {result && (
          <section
            id="results-section"
            className="max-w-5xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h2 className="text-base font-bold text-zinc-900">
                  Extracted Structured Dataset
                </h2>
              </div>
              <span className="text-xs text-zinc-600 font-mono">
                {result.rows.length} records ready
              </span>
            </div>

            {/* Quick Stat Cards */}
            <StatCards result={result} />

            {/* Export Toolbar */}
            <ExportToolbar result={result} onReset={handleReset} />

            {/* Editable Data Table */}
            <PreviewTable
              columns={result.columns}
              rows={result.rows}
              onUpdateRows={handleUpdateRows}
            />
          </section>
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white py-6 mt-16 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-zinc-600" />
            <span className="font-semibold text-zinc-700">DocToSheet AI</span>
            <span>• Micro-SaaS for Solo Developers</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-600">
            <span>Client-side Privacy & UTF-8 BOM Compliant</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-zinc-900 underline cursor-pointer"
            >
              Developer Settings & API Key
            </button>
          </div>
        </div>
      </footer>

      {/* Paywall / Pro Upgrade Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSuccessUnlock={refreshUserData}
      />

      {/* Settings / API Key Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshState={refreshUserData}
        isPro={creditsState.isPro}
      />
    </div>
  );
}
