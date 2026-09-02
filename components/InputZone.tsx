'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  Sparkles,
  Trash2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
  X,
  FolderOpen,
} from 'lucide-react';
import { DocumentType, FileAttachment } from '@/lib/types';
import { SAMPLE_DOCUMENTS } from '@/lib/samples';

interface InputZoneProps {
  text: string;
  onChangeText: (text: string) => void;
  fileAttachment: FileAttachment | null;
  onSelectFileAttachment: (file: FileAttachment | null) => void;
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
  fileAttachment,
  onSelectFileAttachment,
  onSelectDocumentType,
  onParse,
  isLoading,
  forceOffline,
  onToggleForceOffline,
  disabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);
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
    // Reset file input value so user can re-select the same file if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFilePicker = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFile = (file: File) => {
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|tiff)$/i.test(file.name);

    const reader = new FileReader();

    if (isPDF || isImage) {
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (typeof base64 === 'string') {
          onSelectFileAttachment({
            name: file.name,
            mimeType: isPDF ? 'application/pdf' : file.type || 'image/png',
            base64,
            sizeBytes: file.size,
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Text file (.txt, .csv, .log, .md)
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          onChangeText(content);
          onSelectFileAttachment(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSample = (type: DocumentType) => {
    onSelectDocumentType(type);
    onChangeText(SAMPLE_DOCUMENTS[type]?.rawText || '');
    onSelectFileAttachment(null);
  };

  const handleClear = () => {
    onChangeText('');
    onSelectFileAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasDataToParse = Boolean(text.trim().length > 0 || fileAttachment);

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
        {/* Real Hidden File Input */}
        <input
          type="file"
          id="doctosheet-file-input"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.log,.md,.tsv,application/pdf,image/*"
          className="sr-only"
        />

        {/* File Attachment Card if file loaded */}
        {fileAttachment ? (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center shadow-xs">
                {fileAttachment.mimeType === 'application/pdf' ? (
                  <FileText className="w-5 h-5 text-red-400" />
                ) : fileAttachment.mimeType.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {fileAttachment.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {fileAttachment.mimeType === 'application/pdf'
                      ? 'PDF Document'
                      : fileAttachment.mimeType.startsWith('image/')
                      ? 'Image Scan / Receipt'
                      : 'Data File'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {formatFileSize(fileAttachment.sizeBytes)} • Ready for AI Vision / OCR Extraction
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectFileAttachment(null)}
              className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              title="Remove attached file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Drag & Drop banner */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => triggerFilePicker()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerFilePicker();
              }
            }}
            className={`w-full py-5 px-4 rounded-xl border border-dashed transition-all flex items-center justify-between cursor-pointer select-none ${
              isDragging
                ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-950/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Drop PDF statement, image receipt, or document text here
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Direct support for <strong className="text-zinc-700 dark:text-zinc-300">.PDF</strong>, <strong className="text-zinc-700 dark:text-zinc-300">.PNG</strong>, <strong className="text-zinc-700 dark:text-zinc-300">.JPG</strong>, or copy/paste raw text below
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => triggerFilePicker(e)}
              className="text-xs text-zinc-700 dark:text-zinc-200 font-medium px-3.5 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Browse files</span>
            </button>
          </div>
        )}

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            disabled={disabled || isLoading}
            placeholder={
              fileAttachment
                ? 'Optional: Add special extraction instructions or notes about this file...'
                : 'Or paste raw unstructured document text here (statement lines, invoices, lease clauses)...'
            }
            rows={fileAttachment ? 3 : 7}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all resize-y bg-zinc-50/30 dark:bg-zinc-950/60"
          />

          {(text || fileAttachment) && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Footer info & CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            {fileAttachment ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Attached: {fileAttachment.name}
              </span>
            ) : (
              <>
                <span>
                  <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{text.trim() ? text.trim().split('\n').length : 0}</strong> lines
                </span>
                <span>•</span>
                <span>
                  <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{text.length}</strong> chars
                </span>
              </>
            )}
            <span>•</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {forceOffline ? 'Mode: Offline' : 'Mode: Gemini Flash Vision OCR'}
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onParse}
            disabled={!hasDataToParse || isLoading || disabled}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300 dark:text-zinc-700" />
                <span>{fileAttachment ? 'Running OCR & Structuring...' : 'Structuring Data...'}</span>
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
