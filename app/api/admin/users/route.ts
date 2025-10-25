import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// --- helpers ---------------------------------------------------------
const clean = (s?: string | null) => (s ?? '').trim();

// try to find a Prisma delegate by any of the provided names
function tbl(...names: string[]) {
  const anyDb = db as any;
  for (const n of names) {
    if (anyDb && typeof anyDb[n] === 'object' && anyDb[n] !== null) return anyDb[n];
  }
  // return a stub with no-op methods so code won't crash if a table doesn't exist
  return new Proxy({}, { get: () => async () => undefined });
}

const T = {
  // user table can be 'user' or 'users'
  user: () => tbl('user', 'users'),

  // next-auth-ish tables (singular or plural variants)
  session: () => tbl('session', 'sessions'),
  account: () => tbl('account', 'accounts'),
  verificationToken: () => tbl('verificationToken', 'verificationTokens'),
  passwordResetToken: () => tbl('passwordResetToken', 'passwordResetTokens'),

  // your app tables (adjust names here if yours differ)
  assessmentResponses: () => tbl('assessment_responses', 'assessmentResponses'),
  assessmentResults:   () => tbl('assessment_results',  'assessmentResults'),
};

async function getUserByEmail(email: string) {
  const User = T.user();
  // supports both Prisma 4/5 styles; uses findUnique on a unique email
  return User.findUnique?.({
    where: { email },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  });
}

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

// --- handlers --------------------------------------------------------
export async function GET(req: NextRequest) {
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

    // Related counts (each wrapped so the route still works if a table doesn't exist)
    const stats: Record<string, number> = {};
    try { stats.sessions = await T.session().count({ where: { userId: user.id } }); } catch {}
    try { stats.accounts = await T.account().count({ where: { userId: user.id } }); } catch {}
    try { stats.verificationTokens = await T.verificationToken().count({ where: { identifier: email } }); } catch {}
    try { stats.passwordResetTokens = await T.passwordResetToken().count({ where: { email } }); } catch {}
    try { stats.assessmentResponses = await T.assessmentResponses().count({ where: { userId: user.id } }); } catch {}
    try { stats.assessmentResults = await T.assessmentResults().count({ where: { userId: user.id } }); } catch {}

    return NextResponse.json({ success: true, data: { exists: true, user, relatedCounts: stats } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? 'GET failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const expected = clean(process.env.ADMIN_SECRET_KEY);
    const provided = clean(req.headers.get('x-admin-secret') ?? new URL(req.url).searchParams.get('admin_secret'));
    if (!expected || provided !== expected) return unauthorized();

    const url = new URL(req.url);
    const email = clean(url.searchParams.get('email'));
    const really = clean(url.searchParams.get('really')); // require confirmation
    if (!email) return NextResponse.json({ success: false, error: 'Missing ?email=...' }, { status: 400 });
    if (really !== 'yes') {
      return NextResponse.json(
        { success: false, error: 'Add &really=yes to confirm deletion (irreversible).' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: true, message: 'No-op: user not found' });
    }

    await (db as any).$transaction(async (tx: any) => {
      // Rebind T to use the transaction client where possible
      const TT = {
        session: () => (tx.session ?? tx.sessions ?? {}),
        account: () => (tx.account ?? tx.accounts ?? {}),
        verificationToken: () => (tx.verificationToken ?? tx.verificationTokens ?? {}),
        passwordResetToken: () => (tx.passwordResetToken ?? tx.passwordResetTokens ?? {}),
        assessmentResponses: () => (tx.assessment_responses ?? tx.assessmentResponses ?? {}),
        assessmentResults: () => (tx.assessment_results ?? tx.assessmentResults ?? {}),
        user: () => (tx.user ?? tx.users ?? {}),
      };

      // Best-effort deletes; ignore if a table isn't present in your schema
      try { await TT.session().deleteMany({ where: { userId: user.id } }); } catch {}
      try { await TT.account().deleteMany({ where: { userId: user.id } }); } catch {}
      try { await TT.verificationToken().deleteMany({ where: { identifier: email } }); } catch {}
      try { await TT.passwordResetToken().deleteMany({ where: { email } }); } catch {}
      try { await TT.assessmentResponses().deleteMany({ where: { userId: user.id } }); } catch {}
      try { await TT.assessmentResults().deleteMany({ where: { userId: user.id } }); } catch {}

      await TT.user().delete({ where: { id: user.id } });
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
