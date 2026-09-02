'use client';

import React, { useState } from 'react';
import { ColumnDefinition, TableRow } from '@/lib/types';
import { Search, Trash2, Plus, Edit2, Check, X } from 'lucide-react';

interface PreviewTableProps {
  columns: ColumnDefinition[];
  rows: TableRow[];
  onUpdateRows: (updatedRows: TableRow[]) => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  columns,
  rows,
  onUpdateRows,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnKey: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const filteredRows = rows.filter((row) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(row).some((val) =>
      String(val ?? '').toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteRow = (index: number) => {
    const nextRows = rows.filter((_, i) => i !== index);
    onUpdateRows(nextRows);
  };

  const handleStartEdit = (rowIndex: number, columnKey: string, currentVal: string | number | null) => {
    setEditingCell({ rowIndex, columnKey });
    setEditValue(String(currentVal ?? ''));
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const { rowIndex, columnKey } = editingCell;
    const nextRows = [...rows];
    nextRows[rowIndex] = {
      ...nextRows[rowIndex],
      [columnKey]: editValue,
    };
    onUpdateRows(nextRows);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleAddBlankRow = () => {
    const blankRow: TableRow = {};
    columns.forEach((col) => {
      blankRow[col.key] = col.type === 'currency' ? '$0.00' : '-';
    });
    onUpdateRows([blankRow, ...rows]);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
      {/* Table Toolbar Header */}
      <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/50">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter extracted rows..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-md border border-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-600">
            Showing <strong className="text-zinc-900">{filteredRows.length}</strong> of{' '}
            {rows.length} rows
          </span>
          <button
            onClick={handleAddBlankRow}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-100/75 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center text-zinc-600">#</th>
              {columns.map((col) => (
                <th key={col.key} className="py-3 px-4 text-zinc-700 font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="py-3 px-3 w-12 text-center text-zinc-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-normal text-zinc-800">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="py-12 text-center text-zinc-600 italic bg-white"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-zinc-50/80 transition-colors group"
                >
                  {/* Row Number */}
                  <td className="py-2.5 px-3 text-center text-zinc-600 font-mono text-[11px]">
                    {rIdx + 1}
                  </td>

                  {/* Columns */}
                  {columns.map((col) => {
                    const isEditing =
                      editingCell?.rowIndex === rIdx &&
                      editingCell?.columnKey === col.key;
                    const val = row[col.key] ?? '';

                    return (
                      <td
                        key={col.key}
                        className="py-2.5 px-4 font-mono text-zinc-900 whitespace-pre-wrap max-w-xs truncate group/cell cursor-pointer relative"
                        onClick={() => {
                          if (!isEditing) handleStartEdit(rIdx, col.key, val);
                        }}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              autoFocus
                              className="px-2 py-0.5 text-xs border border-zinc-900 rounded bg-white text-zinc-900 focus:outline-none w-full shadow-xs"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit();
                              }}
                              className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="p-1 text-zinc-600 hover:text-zinc-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{String(val || '-')}</span>
                            <Edit2 className="w-3 h-3 text-zinc-600 opacity-0 group-hover/cell:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Delete Row Action */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleDeleteRow(rIdx)}
                      className="p-1 text-zinc-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors opacity-40 group-hover:opacity-100 cursor-pointer"
                      title="Delete row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-2.5 bg-zinc-50 border-t border-zinc-200 text-center text-[11px] text-zinc-600">
        Tip: Click any cell in the table to edit its value inline before exporting.
      </div>
    </div>
  );
};
