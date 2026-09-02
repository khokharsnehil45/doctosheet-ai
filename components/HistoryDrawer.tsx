'use client';

import React, { useState } from 'react';
import {
  X,
  History,
  FileSpreadsheet,
  Download,
  Trash2,
  FolderOpen,
  Search,
  Landmark,
  Receipt,
  FileText,
} from 'lucide-react';
import { SavedConversionItem } from '@/lib/db';
import { generateCSV, generateExcelXML, downloadFile } from '@/lib/exportUtils';
import { ParsedDocumentResult } from '@/lib/types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversions: SavedConversionItem[];
  onLoadConversion: (result: ParsedDocumentResult) => void;
  onDeleteConversion: (id: string) => void;
  isLoading?: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  conversions,
  onLoadConversion,
  onDeleteConversion,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = conversions.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      (c.fileName && c.fileName.toLowerCase().includes(term)) ||
      c.documentType.toLowerCase().includes(term)
    );
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank_statement':
        return <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'invoice':
        return <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'lease_summary':
        return <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />;
    }
  };

  const handleDownloadCSV = (c: SavedConversionItem) => {
    const csv = generateCSV(c.columns, c.rows);
    downloadFile(csv, `${c.title.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleDownloadExcel = (c: SavedConversionItem) => {
    const xls = generateExcelXML(c.title, c.columns, c.rows);
    downloadFile(xls, `${c.title.replace(/\s+/g, '_')}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
  };

  const handleLoad = (c: SavedConversionItem) => {
    onLoadConversion({
      documentType: c.documentType,
      title: c.title,
      summary: c.fileName ? `Loaded from history: ${c.fileName}` : 'Loaded from history',
      columns: c.columns,
      rows: c.rows,
      metadata: {
        totalRows: c.rowsCount,
        detectedType: c.documentType,
        totalAmount: c.totalAmount,
        currency: 'USD',
        processingTimeMs: c.processingTimeMs || 0,
        engine: 'gemini-1.5-flash',
      },
    });
    onClose();
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Saved Spreadsheets & History
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Synced to Cloud Database ({conversions.length} records)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved spreadsheets..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Loading saved spreadsheets from database...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {searchTerm ? 'No matching spreadsheets found.' : 'No saved spreadsheets yet.'}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Documents you parse will automatically sync here for 1-click re-download without using extra credits.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-2 group shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mt-0.5">
                      {getIcon(item.documentType)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {item.rowsCount} rows • {formatDate(item.createdAt)}
                      </p>
                      {item.fileName && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          📁 {item.fileName}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteConversion(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete saved sheet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                  <button
                    onClick={() => handleLoad(item)}
                    className="flex-1 py-1.5 px-2 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>Open in Table</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCSV(item)}
                    className="py-1.5 px-2.5 rounded-md bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    title="Download CSV"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => handleDownloadExcel(item)}
                    className="py-1.5 px-2.5 rounded-md bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    title="Download Excel XLS"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>XLS</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
          Supabase PostgreSQL Database Cloud Storage
        </div>
      </div>
    </div>
  );
};
