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
    <div className="w-full bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
      {/* Title & summary information */}
      <div>
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          {title || 'Extracted Sheet'}
        </h3>
        <p className="text-xs text-zinc-600 mt-0.5">
          {rows.length} rows parsed and structured • Ready for immediate export
        </p>
      </div>

      {/* Export Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        {/* Copy for Sheets / Excel */}
        <button
          type="button"
          onClick={handleCopyTSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"
          title="Copy tab-delimited values for instant paste into Google Sheets or MS Excel"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-600" />
              <span>Copy for Sheets</span>
            </>
          )}
        </button>

        {/* Download JSON */}
        <button
          type="button"
          onClick={handleDownloadJSON}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"
          title="Download JSON format"
        >
          <FileCode className="w-3.5 h-3.5 text-zinc-600" />
          <span>JSON</span>
        </button>

        {/* Download Excel */}
        <button
          type="button"
          onClick={handleDownloadExcel}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"
          title="Download formatted Microsoft Excel spreadsheet file"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Download .XLS</span>
        </button>

        {/* Download CSV (Primary CTA) */}
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs cursor-pointer"
          title="Download RFC 4180 standard CSV file"
        >
          <Download className="w-3.5 h-3.5 text-zinc-100" />
          <span>Download .CSV</span>
        </button>

        {/* Parse another document */}
        <button
          type="button"
          onClick={onReset}
          className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md border border-zinc-200 transition-colors cursor-pointer"
          title="Parse another document"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
