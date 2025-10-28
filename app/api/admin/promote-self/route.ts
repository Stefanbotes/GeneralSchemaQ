// app/api/admin/promote-self/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// tiny helper so we work with either singular or plural delegates
function getDelegate<T extends object = any>(nameSingular: string, namePlural: string) {
  const anyDb = db as any;
  return (anyDb[nameSingular] ?? anyDb[namePlural]) as T;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const ownerEmail = (process.env.OWNER_EMAIL || '').toLowerCase().trim();
  if (!ownerEmail) {
    return NextResponse.json({ error: 'OWNER_EMAIL not set in env' }, { status: 500 });
  }

  const currentEmail = session.user.email.toLowerCase();
  if (currentEmail !== ownerEmail) {
    return NextResponse.json({ error: 'Only owner can use this endpoint' }, { status: 403 });
  }

  // get delegates tolerant to schema differences
  const User = getDelegate('user', 'users');
  const Session = getDelegate('session', 'sessions');

  try {
    // Promote + invalidate tokens
    const updated = await User.update({
      where: { email: ownerEmail },
      data: {
        role: 'ADMIN',
        tokenVersion: { increment: 1 },
        emailVerified: new Date(), // optional
      },
      select: { id: true, email: true, role: true, tokenVersion: true },
    });

    // Drop existing sessions for immediate effect
    try {
      await Session.deleteMany({ where: { userId: updated.id } });
    } catch {
      // ignore if sessions table name differs or doesn't exist
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Update failed' }, { status: 500 });
  }
}
