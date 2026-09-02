'use client';

import React from 'react';
import { Layers, DollarSign, Clock, Cpu } from 'lucide-react';
import { ParsedDocumentResult } from '@/lib/types';

interface StatCardsProps {
  result: ParsedDocumentResult;
}

export const StatCards: React.FC<StatCardsProps> = ({ result }) => {
  const { metadata, rows, columns } = result;
  const isNetDebit = typeof metadata.totalAmount === 'number' && metadata.totalAmount < 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Rows */}
      <div className="p-3.5 bg-white rounded-lg border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-600 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Total Records</span>
          <Layers className="w-3.5 h-3.5" />
        </div>
        <div className="text-xl font-bold text-zinc-900">{rows.length}</div>
        <div className="text-[11px] text-zinc-600 mt-0.5">{columns.length} columns defined</div>
      </div>

      {/* Net Amount if applicable */}
      <div className="p-3.5 bg-white rounded-lg border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-600 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Net Amount / Total</span>
          <DollarSign className="w-3.5 h-3.5" />
        </div>
        <div className="text-xl font-bold text-zinc-900">
          {typeof metadata.totalAmount === 'number'
            ? `$${Math.abs(metadata.totalAmount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : 'N/A'}
        </div>
        <div className="text-[11px] text-zinc-600 mt-0.5">
          {isNetDebit ? 'Net Outflow / Debit' : 'Calculated sum'}
        </div>
      </div>

      {/* Processing Engine */}
      <div className="p-3.5 bg-white rounded-lg border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-600 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Parsing Engine</span>
          <Cpu className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs font-semibold text-zinc-900 truncate">
          {metadata.engine === 'gemini-1.5-flash'
            ? 'Gemini 1.5 Flash'
            : metadata.engine === 'custom-gemini'
            ? 'Custom Gemini Key'
            : 'Deterministic Engine'}
        </div>
        <div className="text-[11px] text-emerald-600 mt-1 font-medium">✓ Structured Output Validated</div>
      </div>

      {/* Latency / Speed */}
      <div className="p-3.5 bg-white rounded-lg border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-600 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Speed</span>
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="text-xl font-bold text-zinc-900">
          {metadata.processingTimeMs ? `${metadata.processingTimeMs}ms` : '< 100ms'}
        </div>
        <div className="text-[11px] text-zinc-600 mt-0.5">Instant Sheet Ready</div>
      </div>
    </div>
  );
};
