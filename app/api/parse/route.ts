import { NextRequest } from 'next/server';
import { POST as generatePost } from '@/app/api/generate/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return generatePost(req);
}
