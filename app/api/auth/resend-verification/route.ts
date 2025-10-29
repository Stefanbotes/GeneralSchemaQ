// app/api/auth/resend-verification/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createEmailVerificationToken } from '@/lib/email-service';
import { sendVerificationEmail } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({ email: '' }));
    const normalized = (email || '').toLowerCase().trim();
    if (!normalized) {
      return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: normalized },
      select: { email: true, emailVerified: true },
    });

    // Don’t leak existence; just return ok
    if (!user || user.emailVerified) return NextResponse.json({ ok: true });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      new URL(req.url).origin;

    const { verifyUrl } = await createEmailVerificationToken({
      email: normalized,
      baseUrl,
      expiresInMinutes: 60,
    });

    await sendVerificationEmail(normalized, verifyUrl);
    console.log('[Resend] verification sent:', { to: normalized });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[Resend] error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to resend' }, { status: 500 });
  }
}
