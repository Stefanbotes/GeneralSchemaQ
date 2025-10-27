// app/api/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const Body = z.object({
  token: z.string().min(1, 'Missing token'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function badRequest(message: string, extra?: any) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status: 400 });
}
function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues?.[0]?.message ?? 'Invalid payload';
      return badRequest(first, { details: parsed.error.format() });
    }
    const { token, password } = parsed.data;

    // 1) Look up reset token (unique by token)
    const resetToken = await db.password_reset_tokens.findUnique({
      where: { token }, // token is @unique in your schema
      select: {
        id: true,
        token: true,
        userId: true,
        expires: true,
        used: true,
      },
    });

    if (!resetToken) {
      return unauthorized('Invalid or unknown reset token.');
    }
    if (resetToken.used) {
      return unauthorized('This reset token has already been used.');
    }
    if (resetToken.expires <= new Date()) {
      return unauthorized('This reset token has expired.');
    }

    // 2) Ensure user exists
    const user = await db.user.findUnique({
      where: { id: resetToken.userId },
      select: { id: true, email: true },
    });
    if (!user) {
      return unauthorized('User not found for this token.');
    }

    // 3) Hash new password
    const hashed = await hash(password, 12);

    // 4) Apply updates in a transaction:
    //    - update user password (+ passwordChangedAt, + bump tokenVersion)
    //    - invalidate all existing sessions for this user
    //    - mark token as used
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          passwordChangedAt: new Date(),
          tokenVersion: { increment: 1 }, // useful if you also include version in your sessions/JWT logic
        },
      }),
      db.session.deleteMany({
        where: { userId: user.id },
      }),
      db.password_reset_tokens.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (err: any) {
    console.error('[reset-password] error:', err);
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Internal error' },
      { status: 500 }
    );
  }
}
