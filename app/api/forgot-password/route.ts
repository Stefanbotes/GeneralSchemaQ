// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createPasswordResetToken } from '@/lib/email-service';
import { sendPasswordResetEmail } from '@/lib/mailer'; // ✅ send real mail

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // ✅ ensure Node runtime (SMTP/envs available)

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Very small per-IP rate limiter (in-memory per lambda instance).
 * If you need durable/global limits, use Redis/upstash/etc.
 */
type Bucket = { count: number; resetAt: number };
const WINDOW_MS = 60_000; // 1 minute window
const MAX_ATTEMPTS = 5;   // 5 requests per window

// Use a global map so the bucket persists across hot calls in the same instance
const globalAny = global as any;
if (!globalAny.__forgotPwdBuckets) {
  globalAny.__forgotPwdBuckets = new Map<string, Bucket>();
}
const buckets: Map<string, Bucket> = globalAny.__forgotPwdBuckets;

function getClientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function consume(ip: string) {
  const now = Date.now();
  const existing = buckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(ip, { count: 1, resetAt });
    return { ok: true, remaining: MAX_ATTEMPTS - 1, resetAt };
  }
  if (existing.count >= MAX_ATTEMPTS) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  buckets.set(ip, existing);
  return { ok: true, remaining: MAX_ATTEMPTS - existing.count, resetAt: existing.resetAt };
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = consume(ip);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000)).toString(),
          },
        }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = forgotPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Look up the user (do not disclose existence in response)
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (user) {
      const envBase =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        new URL(req.url).origin; // ✅ reliable fallback

      const { resetUrl } = await createPasswordResetToken({
        email,
        baseUrl: envBase,
        userId: user.id,
        expiresInMinutes: 30,
      });

      // ✅ Send the email (falls back to server log if SMTP not set)
      const hasSmtp = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
      if (hasSmtp) {
        try {
          await sendPasswordResetEmail(email, resetUrl);
          console.log('[ForgotPassword] reset email sent:', { to: email });
        } catch (e: any) {
          console.warn('[ForgotPassword] email send failed, logging link instead:', e?.message);
          console.log('[ForgotPassword] reset link (dev):', resetUrl);
        }
      } else {
        console.log('[ForgotPassword] reset link (dev):', resetUrl);
      }
    }

    // Always respond success (prevents user enumeration)
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err: any) {
    console.error('[ForgotPassword] error:', err);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
}

