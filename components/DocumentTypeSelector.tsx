'use client';

import React from 'react';
import { Landmark, Receipt, FileText } from 'lucide-react';
import { DocumentType } from '@/lib/types';

interface DocumentTypeSelectorProps {
  selectedType: DocumentType;
  onSelect: (type: DocumentType) => void;
  disabled?: boolean;
}

const OPTIONS: Array<{
  id: DocumentType;
  label: string;
  icon: React.ElementType;
  badge: string;
  description: string;
}> = [
  {
    id: 'bank_statement',
    label: 'Bank Statement',
    icon: Landmark,
    badge: 'Checking / Savings',
    description: 'Dates, Debits, Credits, Balances, & Merchant Categories',
  },
  {
    id: 'invoice',
    label: 'Invoice / Receipt',
    icon: Receipt,
    badge: 'Line Items',
    description: 'Item descriptions, Quantities, Unit Rates, & Subtotals',
  },
  {
    id: 'lease_summary',
    label: 'Lease Summary',
    icon: FileText,
    badge: 'Legal Terms',
    description: 'Key covenants, Rent, Deposit, Escalations, & Clauses',
  },
];

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  selectedType,
  onSelect,
  disabled,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
          Target Schema / Document Type
        </label>
        <span className="text-xs text-zinc-600">
          Auto-structures output into columns
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option.id)}
              className={`flex flex-col text-left p-3.5 rounded-lg border transition-all ${
                isSelected
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50 text-zinc-900'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-zinc-100' : 'text-zinc-600'
                    }`}
                  />
                  <span className="text-sm font-semibold tracking-tight">
                    {option.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {option.badge}
                </span>
              </div>
              <p
                className={`text-xs line-clamp-2 ${
                  isSelected ? 'text-zinc-300' : 'text-zinc-600'
                }`}
              >
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
