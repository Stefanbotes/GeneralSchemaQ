import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function clean(s?: string | null) { return (s ?? '').trim(); }

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  });
}

export async function GET(req: NextRequest) {
  // Preview: confirm the user exists and show related counts
  try {
    const expected = clean(process.env.ADMIN_SECRET_KEY);
    const provided = clean(req.headers.get('x-admin-secret') ?? new URL(req.url).searchParams.get('admin_secret'));
    if (!expected || provided !== expected) return unauthorized();

    const url = new URL(req.url);
    const email = clean(url.searchParams.get('email'));
    if (!email) {
      return NextResponse.json({ success: false, error: 'Missing ?email=...' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: true, data: { exists: false } });
    }

    // Count related rows (ignore errors if some tables don’t exist in your schema)
    const stats: Record<string, number> = {};
    try { stats.sessions = await db.session.count({ where: { userId: user.id } }); } catch {}
    try { stats.accounts = await db.account.count({ where: { userId: user.id } }); } catch {}
    try { stats.verificationTokens = await db.verificationToken.count({ where: { identifier: email } }); } catch {}
    try { stats.passwordResetTokens = await db.passwordResetToken.count({ where: { email } }); } catch {}
    try { stats.assessmentResults = await db.assessment_results.count({ where: { userId: user.id } }); } catch {}
    try { stats.assessmentResponses = await db.assessment_responses.count({ where: { userId: user.id } }); } catch {}

    return NextResponse.json({ success: true, data: { exists: true, user, relatedCounts: stats } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? 'GET failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Hard-delete a user by email, cascading through related tables
  try {
    const expected = clean(process.env.ADMIN_SECRET_KEY);
    const provided = clean(req.headers.get('x-admin-secret') ?? new URL(req.url).searchParams.get('admin_secret'));
    if (!expected || provided !== expected) return unauthorized();

    const url = new URL(req.url);
    const email = clean(url.searchParams.get('email'));
    const really = clean(url.searchParams.get('really')); // require confirmation
    if (!email) return NextResponse.json({ success: false, error: 'Missing ?email=...' }, { status: 400 });
    if (really !== 'yes') {
      return NextResponse.json({
        success: false,
        error: 'Add &really=yes to confirm deletion (irreversible).',
      }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: true, message: 'No-op: user not found' });
    }

    await db.$transaction(async (tx) => {
      // Delete child/related rows first; wrap each in try/catch in case a table isn’t present
      try { await tx.session.deleteMany({ where: { userId: user.id } }); } catch {}
      try { await tx.account.deleteMany({ where: { userId: user.id } }); } catch {}
      try { await tx.verificationToken.deleteMany({ where: { identifier: email } }); } catch {}
      try { await tx.passwordResetToken.deleteMany({ where: { email } }); } catch {}
      try { await tx.assessment_responses.deleteMany({ where: { userId: user.id } }); } catch {}
      try { await tx.assessment_results.deleteMany({ where: { userId: user.id } }); } catch {}

      // Finally the user
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({
      success: true,
      message: `Deleted user ${email} and related data`,
      data: { userId: user.id, email },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? 'DELETE failed' }, { status: 500 });
  }
}
