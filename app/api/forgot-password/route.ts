// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { EmailUtils } from '@/lib/auth-utils';
import { RateLimiter } from '@/lib/rate-limit';
import { createPasswordResetToken } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const limiter = new RateLimiter({
  windowMs: 60_000,      // 1 minute
  max: 5,                // 5 attempts per minute per IP
  keyPrefix: 'forgotpwd' // redis key prefix if using redis
});

export async function POST(req: Request) {
  try {
    const ip = EmailUtils.getClientIp(req) ?? 'unknown';
    const limited = await limiter.consume(ip);
    if (!limited.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
    }

    const json = await req.json().catch(() => ({}));
    const parsed = forgotPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    // Look up the user (do not reveal existence in the response)
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Always respond success (to prevent user enumeration)
    // but only create token/send email if user exists.
    if (user) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        '';

      // create + store reset token and get the URL
      const { resetUrl } = await createPasswordResetToken({
        email,
        baseUrl,
        userId: user.id,
        expiresInMinutes: 30,
      });

      // TODO: send the email via your provider
      // await sendPasswordResetEmail(email, resetUrl);
      console.log('[ForgotPassword] Reset link (dev):', resetUrl);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err: any) {
    console.error('[ForgotPassword] error:', err);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
}

