export type DocumentType = 'bank_statement' | 'invoice' | 'lease_summary';

export interface ColumnDefinition {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date';
}

export type TableRow = Record<string, string | number | null>;

export interface FileAttachment {
  base64: string;
  mimeType: string;
  name: string;
  sizeBytes?: number;
}

export interface ParsedDocumentResult {
  documentType: DocumentType;
  title: string;
  summary?: string;
  columns: ColumnDefinition[];
  rows: TableRow[];
  metadata: {
    totalRows: number;
    detectedType: string;
    totalAmount?: number | null;
    currency?: string;
    processingTimeMs?: number;
    engine: 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'deterministic-fallback' | 'custom-gemini';
  };
}

export interface ParseRequestPayload {
  text?: string;
  fileAttachment?: FileAttachment;
  documentType: DocumentType;
  customApiKey?: string;
  forceOffline?: boolean;
}

export interface UserCreditsState {
  creditsUsed: number;
  maxFreeCredits: number;
  isPro: boolean;
  proPlanName?: string;
  unlockedAt?: string;
}

export interface SampleDocument {
  id: DocumentType;
  name: string;
  badge: string;
  description: string;
  rawText: string;
  sampleColumns: string[];
}
