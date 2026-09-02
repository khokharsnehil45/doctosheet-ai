import { NextRequest, NextResponse } from 'next/server';
import { parseDocumentWithGemini } from '@/lib/gemini';
import { parseOfflineDocument } from '@/lib/fallbackParser';
import { DocumentType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, documentType, customApiKey, forceOffline } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document text is required.' },
        { status: 400 }
      );
    }

    const validDocTypes: DocumentType[] = ['bank_statement', 'invoice', 'lease_summary'];
    const docType: DocumentType = validDocTypes.includes(documentType)
      ? documentType
      : 'bank_statement';

    if (forceOffline) {
      const offlineResult = parseOfflineDocument(text, docType);
      return NextResponse.json(offlineResult);
    }

    const result = await parseDocumentWithGemini(text, docType, customApiKey);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to parse document text.';
    console.error('Error processing document parse request:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
