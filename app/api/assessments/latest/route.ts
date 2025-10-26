// app/api/assessments/latest/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const latest = await db.assessments.findFirst({
      where: { userId: session.user.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      select: { id: true, completedAt: true, status: true },
    });

    if (!latest) {
      return NextResponse.json({ error: 'No completed assessments found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, assessmentId: latest.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
