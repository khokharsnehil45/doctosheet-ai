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
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors">
      {/* Top action row: Sample buttons & quick controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Samples:
          </span>
          <button
            type="button"
            onClick={() => loadSample('bank_statement')}
            className="px-2.5 py-1 text-[11px] sm:text-xs font-medium whitespace-nowrap rounded-md bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Bank Statement
          </button>
          <button
            type="button"
            onClick={() => loadSample('invoice')}
            className="px-2.5 py-1 text-[11px] sm:text-xs font-medium whitespace-nowrap rounded-md bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Invoice
          </button>
          <button
            type="button"
            onClick={() => loadSample('lease_summary')}
            className="px-2.5 py-1 text-[11px] sm:text-xs font-medium whitespace-nowrap rounded-md bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Lease Summary
          </button>
        </div>

        {/* Engine mode selector toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceOffline}
              onChange={(e) => onToggleForceOffline(e.target.checked)}
              className="w-4 h-4 sm:w-3.5 sm:h-3.5 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-0"
            />
            <span className="text-[11px] sm:text-xs">Offline Engine</span>
          </label>
        </div>
      </div>

      {/* Drop Zone & Input Grid */}
      <div className="space-y-3 sm:space-y-4">
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
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                {fileAttachment.mimeType === 'application/pdf' ? (
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                ) : fileAttachment.mimeType.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px] sm:max-w-xs">
                    {fileAttachment.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {fileAttachment.mimeType === 'application/pdf' ? 'PDF' : 'Image'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {formatFileSize(fileAttachment.sizeBytes)} • Ready for OCR Extraction
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectFileAttachment(null)}
              className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer flex-shrink-0"
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
            className={`w-full p-4 sm:py-5 sm:px-4 rounded-xl border border-dashed transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer select-none ${
              isDragging
                ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-950/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shadow-xs flex-shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Tap to upload PDF, Receipt, or Image
                </p>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Supports <strong className="text-zinc-700 dark:text-zinc-300">.PDF</strong>, <strong className="text-zinc-700 dark:text-zinc-300">.PNG</strong>, <strong className="text-zinc-700 dark:text-zinc-300">.JPG</strong>, or paste text below
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => triggerFilePicker(e)}
              className="w-full sm:w-auto text-xs text-zinc-700 dark:text-zinc-200 font-semibold px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Browse device</span>
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
                ? 'Optional: Add special instructions or notes...'
                : 'Or paste raw unstructured text (bank statements, bills, lease terms)...'
            }
            rows={fileAttachment ? 2 : 6}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-3.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all resize-y bg-zinc-50/30 dark:bg-zinc-950/60"
          />

          {(text || fileAttachment) && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute top-2.5 right-2.5 p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Footer info & CTA Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            {fileAttachment ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                ✓ {fileAttachment.name}
              </span>
            ) : (
              <span>
                <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{text.trim() ? text.trim().split('\n').length : 0}</strong> lines • <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{text.length}</strong> chars
              </span>
            )}
            <span className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 hidden xs:inline">
              {forceOffline ? 'Offline' : 'Gemini Vision AI'}
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onParse}
            disabled={!hasDataToParse || isLoading || disabled}
            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300 dark:text-zinc-700" />
                <span>{fileAttachment ? 'Running OCR...' : 'Structuring...'}</span>
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
