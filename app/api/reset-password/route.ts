// app/api/reset-password/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const schema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

    // 1) Look up the reset token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token }, // token is unique in your schema
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

    // 2) Check expiry
    if (resetToken.expires && resetToken.expires.getTime() < Date.now()) {
      // Clean up expired token
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { success: false, message: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 3) Identify user (prefer userId; fall back to email if present)
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

    // 4) Hash new password
    const passwordHash = await hash(password, 10);

    // 5) Transaction: update password, delete tokens, invalidate sessions
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          passwordChangedAt: new Date(),
          tokenVersion: { increment: 1 }, // bump to invalidate any JWT-derived sessions if you gate by tokenVersion
        },
      }),

      // Remove the exact token (and optionally all tokens for the same email)
      db.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),

      // Invalidate all existing sessions for this user
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
