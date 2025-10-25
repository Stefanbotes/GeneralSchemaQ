// app/api/admin/which-db/route.ts
import { NextResponse } from 'next/server';

// avoid caching
export const dynamic = 'force-dynamic';

export async function GET() {
  // Prefer PRISMA_DATABASE_URL if you switched schema.prisma to use it
  const url = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || '';

  const using =
    url.includes('accelerate.prisma-data.net')
      ? '✅ Accelerate (Independent Clone DB)'
      : url.includes('db.prisma.io')
      ? '⚠️ Prisma Cloud Postgres (shared)'
      : url
      ? '❓ Unknown URL'
      : '🚫 No DB URL in env';

  // Return only a redacted hint (no secrets)
  const host = (() => {
    try {
      const u = new URL(url.replace(/^prisma\+/, '')); // URL() dislikes prisma+ scheme
      return `${u.protocol}//${u.host}`;
    } catch {
      if (url.startsWith('prisma+postgres://accelerate.prisma-data.net')) {
        return 'prisma+postgres://accelerate.prisma-data.net';
      }
      if (url.includes('@')) return 'redacted';
      return 'unparsable';
    }
  })();

  return NextResponse.json({ using, host });
}
