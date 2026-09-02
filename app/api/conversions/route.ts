import { NextRequest, NextResponse } from 'next/server';
import { dbGetUserConversions, dbSaveConversion } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ conversions: [] });
    }

    const conversions = await dbGetUserConversions(userId);
    return NextResponse.json({ conversions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      userId,
      title,
      documentType,
      fileName,
      rowsCount,
      totalAmount,
      columns,
      rows,
      engine,
      processingTimeMs,
    } = body;

    if (!userId || !columns || !rows) {
      return NextResponse.json({ error: 'Missing required conversion payload fields' }, { status: 400 });
    }

    const conversionId = id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const saved = await dbSaveConversion({
      id: conversionId,
      userId,
      title: title || 'Extracted Sheet',
      documentType: documentType || 'bank_statement',
      fileName,
      rowsCount: rowsCount || rows.length,
      totalAmount,
      columns,
      rows,
      engine,
      processingTimeMs,
    });

    return NextResponse.json({ success: true, conversion: saved });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save conversion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
