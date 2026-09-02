'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  Sparkles,
  Trash2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { DocumentType } from '@/lib/types';
import { SAMPLE_DOCUMENTS } from '@/lib/samples';

interface InputZoneProps {
  text: string;
  onChangeText: (text: string) => void;
  documentType?: DocumentType;
  onSelectDocumentType: (type: DocumentType) => void;
  onParse: () => void;
  isLoading: boolean;
  forceOffline: boolean;
  onToggleForceOffline: (val: boolean) => void;
  disabled?: boolean;
}

export const InputZone: React.FC<InputZoneProps> = ({
  text,
  onChangeText,
  onSelectDocumentType,
  onParse,
  isLoading,
  forceOffline,
  onToggleForceOffline,
  disabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onChangeText(content);
      }
    };
    reader.readAsText(file);
  };

  const loadSample = (type: DocumentType) => {
    onSelectDocumentType(type);
    onChangeText(SAMPLE_DOCUMENTS[type]?.rawText || '');
    setFileName(`sample_${type}.txt`);
  };

  const handleClear = () => {
    onChangeText('');
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const charCount = text.length;
  const lineCount = text.trim() ? text.trim().split('\n').length : 0;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs transition-colors">
      {/* Top action row: Sample buttons & quick controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mr-1">
            Load Sample:
          </span>
          <button
            type="button"
            onClick={() => loadSample('bank_statement')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Bank Statement
          </button>
          <button
            type="button"
            onClick={() => loadSample('invoice')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Invoice
          </button>
          <button
            type="button"
            onClick={() => loadSample('lease_summary')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Lease Summary
          </button>
        </div>

        {/* Engine mode selector toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceOffline}
              onChange={(e) => onToggleForceOffline(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-0 focus:ring-offset-0"
            />
            <span>Offline Deterministic Engine</span>
          </label>
        </div>
      </div>

      {/* Drop Zone & Input Grid */}
      <div className="space-y-4">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".txt,.csv,.log,.md,.tsv,.json,.pdf"
          className="hidden"
        />

        {/* Drag & Drop banner */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full py-4 px-4 rounded-xl border border-dashed transition-all flex items-center justify-between cursor-pointer ${
            isDragging
              ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-950/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shadow-xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {fileName ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" /> Loaded: {fileName}
                  </span>
                ) : (
                  'Drop raw document text file here, or click to browse'
                )}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Accepts plain text, PDF exports, bank OCR dumps, or paste directly below
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 hidden sm:inline-block">
            Browse files
          </span>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            disabled={disabled || isLoading}
            placeholder="Paste raw unstructured document text here (e.g. statement lines, invoice bills, lease contract terms)..."
            rows={8}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all resize-y bg-zinc-50/30 dark:bg-zinc-950/60"
          />

          {text && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Footer info & CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{lineCount}</strong> lines
            </span>
            <span>•</span>
            <span>
              <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{charCount}</strong> characters
            </span>
            <span>•</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {forceOffline ? 'Mode: 100% Offline' : 'Mode: Gemini 1.5 Flash AI'}
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onParse}
            disabled={!text.trim() || isLoading || disabled}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300 dark:text-zinc-700" />
                <span>Structuring Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Transform to Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
