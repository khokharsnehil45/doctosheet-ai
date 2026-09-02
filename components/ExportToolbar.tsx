'use client';

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  RotateCcw,
  FileCode,
} from 'lucide-react';
import { ParsedDocumentResult } from '@/lib/types';
import {
  generateCSV,
  generateTSV,
  generateExcelXML,
  downloadFile,
} from '@/lib/exportUtils';

interface ExportToolbarProps {
  result: ParsedDocumentResult;
  onReset: () => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  result,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const { title, columns, rows, documentType } = result;

  const baseFilename = `DocToSheet_${documentType}_${new Date().toISOString().slice(0, 10)}`;

  const handleDownloadCSV = () => {
    const csvContent = generateCSV(columns, rows);
    downloadFile(csvContent, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleDownloadExcel = () => {
    const excelContent = generateExcelXML(title, columns, rows);
    downloadFile(
      excelContent,
      `${baseFilename}.xls`,
      'application/vnd.ms-excel;charset=utf-8;'
    );
  };

  const handleDownloadJSON = () => {
    const jsonContent = JSON.stringify(rows, null, 2);
    downloadFile(jsonContent, `${baseFilename}.json`, 'application/json');
  };

  const handleCopyTSV = async () => {
    try {
      const tsvContent = generateTSV(columns, rows);
      await navigator.clipboard.writeText(tsvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-xs transition-colors">
      {/* Title & summary information */}
      <div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="truncate">{title || 'Extracted Sheet'}</span>
        </h3>
        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {rows.length} rows structured • Ready for export
        </p>
      </div>

      {/* Export Action Buttons Grid on Mobile */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
        {/* Copy for Sheets / Excel */}
        <button
          type="button"
          onClick={handleCopyTSV}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          title="Copy tab-delimited values for instant paste into Google Sheets or MS Excel"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Copy TSV</span>
            </>
          )}
        </button>

        {/* Download JSON */}
        <button
          type="button"
          onClick={handleDownloadJSON}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          title="Download JSON format"
        >
          <FileCode className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>JSON</span>
        </button>

        {/* Download Excel */}
        <button
          type="button"
          onClick={handleDownloadExcel}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          title="Download formatted Microsoft Excel spreadsheet file"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Excel .XLS</span>
        </button>

        {/* Download CSV (Primary CTA) */}
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-white transition-all shadow-xs cursor-pointer"
          title="Download RFC 4180 standard CSV file"
        >
          <Download className="w-3.5 h-3.5 text-zinc-100 dark:text-zinc-950" />
          <span>Download .CSV</span>
        </button>
      </div>

      {/* Parse another button */}
      <button
        type="button"
        onClick={onReset}
        className="w-full sm:w-auto py-2 sm:p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer flex items-center justify-center gap-1 text-xs"
        title="Parse another document"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="sm:hidden">Reset & New Doc</span>
      </button>
    </div>
  );
};
