import { NextRequest, NextResponse } from 'next/server';
import { parseDocumentWithGemini } from '@/lib/gemini';
import { parseOfflineDocument } from '@/lib/fallbackParser';
import { DocumentType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, documentType, forceOffline } = body;

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

    // 1. Force Offline Mode
    if (forceOffline) {
      const offlineResult = parseOfflineDocument(text, docType);
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
        const fallback = parseOfflineDocument(text, docType);
        return NextResponse.json({
          ...fallback,
          metadata: {
            ...fallback.metadata,
            engine: 'deterministic-fallback',
          },
        });
      }

      const proResult = await parseDocumentWithGemini(text, docType, serverKey);
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
      text,
      docType,
      clientApiKeyHeader.trim()
    );

    return NextResponse.json({
      ...clientResult,
      metadata: {
        ...clientResult.metadata,
        engine: 'custom-gemini',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to parse document text.';
    console.error('Error in generation endpoint:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
