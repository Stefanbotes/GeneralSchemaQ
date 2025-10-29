// app/api/reset-password/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hash as bcryptHash } from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // Optionally add confirmPassword here and compare if your UI sends it.
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, error: errs }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // 1) Hash the plaintext token to match what we stored in DB
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    // 2) Look up the reset token by its *hashed* value
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token: hashed }, // token is UNIQUE in your schema
      select: {
        id: true,
        token: true,
        email: true,
        userId: true,
        expires: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset link.' },
        { status: 400 }
      );
    }

    // 3) Check expiry
    if (resetToken.expires && resetToken.expires.getTime() < Date.now()) {
      // Clean up expired token
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { success: false, message: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 4) Identify the user (prefer userId; fallback to email)
    const user =
      (resetToken.userId &&
        (await db.user.findUnique({
          where: { id: resetToken.userId },
          select: { id: true, email: true },
        }))) ||
      (resetToken.email &&
        (await db.user.findUnique({
          where: { email: resetToken.email.toLowerCase() },
          select: { id: true, email: true },
        })));

    if (!user) {
      // Clean up dangling token
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { success: false, message: 'Account not found for this token.' },
        { status: 400 }
      );
    }

    // 5) Hash the new password
    const passwordHash = await bcryptHash(password, 10);

    // 6) Transaction: update password, delete tokens, invalidate sessions
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          passwordChangedAt: new Date(),
          tokenVersion: { increment: 1 }, // helps invalidate JWTs if you rely on tokenVersion
        },
      }),
      db.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
      db.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. Please sign in with your new password.',
    });
  } catch (err: any) {
    console.error('[ResetPassword] error:', err);
    const msg = err?.message || 'Password reset failed.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

