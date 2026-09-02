import { NextRequest, NextResponse } from 'next/server';
import { parseDocumentWithGemini } from '@/lib/gemini';
import { parseOfflineDocument } from '@/lib/fallbackParser';
import { DocumentType, FileAttachment } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfModule = await import('pdf-parse');
    const parseFn = typeof pdfModule === 'function' ? pdfModule : (pdfModule as unknown as { default: (b: Buffer) => Promise<{ text: string }> }).default;
    if (typeof parseFn === 'function') {
      const data = await parseFn(buffer);
      return data.text || '';
    }
    return '';
  } catch (err) {
    console.warn('[DocToSheet AI] PDF text extraction fallback:', err);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, fileAttachment, documentType, forceOffline } = body;

    const hasText = typeof text === 'string' && text.trim().length > 0;
    const hasFile = Boolean(fileAttachment && fileAttachment.base64);

    if (!hasText && !hasFile) {
      return NextResponse.json(
        { error: 'Document text or a PDF/image file is required.' },
        { status: 400 }
      );
    }

    const validDocTypes: DocumentType[] = ['bank_statement', 'invoice', 'lease_summary'];
    const docType: DocumentType = validDocTypes.includes(documentType)
      ? documentType
      : 'bank_statement';

    // 1. Force Offline Mode or Offline PDF text extraction
    if (forceOffline) {
      let offlineText = text || '';

      // If PDF file provided in offline mode, extract plain text using pdf-parse
      if (hasFile && fileAttachment.mimeType === 'application/pdf') {
        const cleanBase64 = fileAttachment.base64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        const extracted = await extractTextFromPdfBuffer(buffer);
        if (extracted) offlineText = extracted;
      }

      const offlineResult = parseOfflineDocument(offlineText || 'Document Content', docType);
      return NextResponse.json(offlineResult);
    }

    // 2. Extract Hybrid Auth Headers & State
    const proHeader = req.headers.get('x-pro-token') || req.headers.get('x-pro-session');
    const authHeader = req.headers.get('authorization');
    const isProHeader =
      Boolean(proHeader && proHeader.startsWith('pro_')) ||
      Boolean(authHeader && authHeader.startsWith('Bearer pro_')) ||
      Boolean(body.proToken && String(body.proToken).startsWith('pro_'));

    const clientApiKeyHeader = req.headers.get('x-client-api-key') || body.customApiKey;

    // 3. Pro Tier: Strictly use server environment variable process.env.GEMINI_API_KEY
    if (isProHeader) {
      const serverKey = process.env.GEMINI_API_KEY;
      if (!serverKey) {
        console.log('[DocToSheet AI] PRO User Request - Server GEMINI_API_KEY not configured, using offline fallback');
        let offlineText = text || '';
        if (hasFile && fileAttachment.mimeType === 'application/pdf') {
          const cleanBase64 = fileAttachment.base64.replace(/^data:[^;]+;base64,/, '');
          const buffer = Buffer.from(cleanBase64, 'base64');
          const extracted = await extractTextFromPdfBuffer(buffer);
          if (extracted) offlineText = extracted;
        }
        const fallback = parseOfflineDocument(offlineText || 'Document Content', docType);
        return NextResponse.json({
          ...fallback,
          metadata: {
            ...fallback.metadata,
            engine: 'deterministic-fallback',
          },
        });
      }

      const proResult = await parseDocumentWithGemini(
        text || '',
        docType,
        serverKey,
        fileAttachment as FileAttachment | undefined
      );

      return NextResponse.json({
        ...proResult,
        metadata: {
          ...proResult.metadata,
          engine: 'gemini-1.5-flash',
        },
      });
    }

    // 4. Free Tier: Require client-side custom Gemini API key
    if (!clientApiKeyHeader || clientApiKeyHeader.trim() === '') {
      return NextResponse.json(
        {
          error: 'FREE_TIER_KEY_REQUIRED',
          message:
            'Free Tier requires your personal Gemini API key or the Offline Engine. Please enter your API key in Settings or upgrade to PRO.',
        },
        { status: 400 }
      );
    }

    // Process with Free User's client-supplied API key
    const clientResult = await parseDocumentWithGemini(
      text || '',
      docType,
      clientApiKeyHeader.trim(),
      fileAttachment as FileAttachment | undefined
    );

    return NextResponse.json({
      ...clientResult,
      metadata: {
        ...clientResult.metadata,
        engine: 'custom-gemini',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to parse document.';
    console.error('Error in generation endpoint:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
