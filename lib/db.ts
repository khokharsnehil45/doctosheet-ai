import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { ColumnDefinition, TableRow, DocumentType } from './types';

export interface SavedConversionItem {
  id: string;
  userId: string;
  title: string;
  documentType: DocumentType;
  fileName: string | null;
  rowsCount: number;
  totalAmount: number | null;
  columns: ColumnDefinition[];
  rows: TableRow[];
  engine: string | null;
  processingTimeMs: number | null;
  createdAt: string;
}

// In-memory / local fallback store when Supabase is not reached
const localConversionsStore: Map<string, SavedConversionItem[]> = new Map();

export async function dbSaveConversion(conversion: {
  id: string;
  userId: string;
  title: string;
  documentType: DocumentType;
  fileName?: string | null;
  rowsCount: number;
  totalAmount?: number | null;
  columns: ColumnDefinition[];
  rows: TableRow[];
  engine?: string;
  processingTimeMs?: number;
}): Promise<SavedConversionItem> {
  const item: SavedConversionItem = {
    id: conversion.id,
    userId: conversion.userId,
    title: conversion.title,
    documentType: conversion.documentType,
    fileName: conversion.fileName || null,
    rowsCount: conversion.rowsCount,
    totalAmount: conversion.totalAmount !== undefined ? conversion.totalAmount : null,
    columns: conversion.columns,
    rows: conversion.rows,
    engine: conversion.engine || null,
    processingTimeMs: conversion.processingTimeMs || null,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // First ensure user exists in users table (foreign key)
      const { data: userRecord } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', conversion.userId)
        .maybeSingle();

      if (!userRecord) {
        await supabaseAdmin.from('users').upsert({
          id: conversion.userId,
          email: `${conversion.userId}@guest.doctosheet.local`,
          name: 'Active User',
          credits_used: 1,
        });
      }

      const { error } = await supabaseAdmin.from('conversions').upsert({
        id: item.id,
        user_id: item.userId,
        title: item.title,
        document_type: item.documentType,
        file_name: item.fileName,
        rows_count: item.rowsCount,
        total_amount: item.totalAmount,
        columns_json: item.columns,
        rows_json: item.rows,
        engine: item.engine,
        processing_time_ms: item.processingTimeMs,
      });

      if (error) {
        console.warn('[DocToSheet DB] Supabase upsert error:', error.message);
      }
    } catch (err) {
      console.warn('[DocToSheet DB] Supabase save exception:', err);
    }
  }

  // Also update local cache
  const userList = localConversionsStore.get(conversion.userId) || [];
  localConversionsStore.set(conversion.userId, [item, ...userList.filter((x) => x.id !== item.id)]);

  return item;
}

export async function dbGetUserConversions(
  userId: string,
  limit = 50
): Promise<SavedConversionItem[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('conversions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data.map((r) => ({
          id: r.id,
          userId: r.user_id,
          title: r.title,
          documentType: r.document_type as DocumentType,
          fileName: r.file_name,
          rowsCount: r.rows_count,
          totalAmount: r.total_amount ? Number(r.total_amount) : null,
          columns: Array.isArray(r.columns_json) ? r.columns_json : JSON.parse(r.columns_json || '[]'),
          rows: Array.isArray(r.rows_json) ? r.rows_json : JSON.parse(r.rows_json || '[]'),
          engine: r.engine,
          processingTimeMs: r.processing_time_ms,
          createdAt: r.created_at,
        }));
      }
    } catch (err) {
      console.warn('[DocToSheet DB] Supabase fetch exception:', err);
    }
  }

  return localConversionsStore.get(userId) || [];
}

export async function dbDeleteConversion(id: string, userId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('conversions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (!error) {
        const userList = localConversionsStore.get(userId) || [];
        localConversionsStore.set(
          userId,
          userList.filter((x) => x.id !== id)
        );
        return true;
      }
    } catch (err) {
      console.warn('[DocToSheet DB] Supabase delete exception:', err);
    }
  }

  const userList = localConversionsStore.get(userId) || [];
  localConversionsStore.set(
    userId,
    userList.filter((x) => x.id !== id)
  );
  return true;
}
