// app/api/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function bad(message: string, status = 400, extra?: any) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

export async function POST(req: NextRequest) {
  try {
    // token from query or body
    const url = new URL(req.url);
    const qsToken = url.searchParams.get('token') ?? undefined;
    const body = await req.json().catch(() => ({} as any));
    const token: string | undefined = body.token ?? qsToken;

    if (!token) return bad('Missing token', 400);

    // 1) Find verification token (adapter columns: identifier, token, expires)
    const vt = await db.verificationToken.findFirst({
      where: { token },
      select: { identifier: true, token: true, expires: true },
    });
    if (!vt) return bad('Invalid or unknown token', 401);
    if (vt.expires <= new Date()) return bad('Token expired', 401);

    // 2) Find the user by identifier (email)
    const user = await db.user.findUnique({
      where: { email: vt.identifier.toLowerCase() },
      select: { id: true, email: true, emailVerified: true },
    });
    if (!user) return bad('User not found for this token', 404);

    // 3) If already verified, clean up any stale tokens and exit gracefully
    if (user.emailVerified) {
      await db.verificationToken.deleteMany({ where: { identifier: user.email } });
      return NextResponse.json({ success: true, message: 'Email is already verified.' });
    }

    // 4) Mark verified and delete tokens in a transaction
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.deleteMany({
        where: { identifier: user.email },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (err: any) {
    console.error('[verify-email] error:', err);
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Internal error' },
      { status: 500 }
    );
  }
}

// Optional GET handler if you want to support /api/verify-email?token=...
export async function GET(req: NextRequest) {
  // Reuse POST logic for convenience
  return POST(req);
}

