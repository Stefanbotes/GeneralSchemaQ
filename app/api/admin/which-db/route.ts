import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const raw = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || '';

  const using = raw.includes('accelerate.prisma-data.net')
    ? '✅ Accelerate (Independent Clone DB)'
    : raw.includes('db.prisma.io')
    ? '⚠️ Prisma Cloud Postgres (shared)'
    : raw
    ? '❓ Unknown URL'
    : '🚫 No DB URL in env';

  let host = 'unparsable';
  try {
    const normalized = raw.replace(/^prisma\+/, '');
    const u = new URL(normalized);
    host = `${u.protocol}//${u.host}`;
  } catch {
    if (raw.startsWith('prisma+postgres://accelerate.prisma-data.net')) {
      host = 'prisma+postgres://accelerate.prisma-data.net';
    } else if (raw.includes('@')) {
      host = 'redacted';
    }
  }

  return NextResponse.json({ using, host });
}
