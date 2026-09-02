import { NextRequest, NextResponse } from 'next/server';
import { dbDeleteConversion } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || req.headers.get('x-user-id');

    if (!id || !userId) {
      return NextResponse.json({ error: 'Missing conversion ID or User ID' }, { status: 400 });
    }

    const success = await dbDeleteConversion(id, userId);
    return NextResponse.json({ success });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete conversion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
