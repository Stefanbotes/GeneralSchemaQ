// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { createEmailVerificationToken } from '@/lib/email-service';
import { sendVerificationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1) Reject if already registered
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // 2) Create user (require verification)
    const passwordHash = await hash(password, 10);
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: passwordHash,
        role: 'CLIENT',
        emailVerified: null,         // 👈 require clicking email
        tokenVersion: 0,
      },
      select: { id: true, email: true },
    });

    // 3) Build verification link
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      new URL(req.url).origin;

    const { verifyUrl } = await createEmailVerificationToken({
      email: user.email,
      baseUrl,
      expiresInMinutes: 60,
    });

    // 4) Send the email if SMTP is configured; otherwise log link
    const hasSmtp =
      !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
    try {
      if (hasSmtp) {
        await sendVerificationEmail(user.email, verifyUrl);
        console.log('[Signup] verification sent:', { to: user.email });
      } else {
        console.log('[Signup] verification link (no SMTP):', verifyUrl);
      }
    } catch (e: any) {
      // Don’t fail signup if email sending hiccups; user can use "resend"
      console.warn('[Signup] email send failed:', e?.message);
      console.log('[Signup] verification link (fallback):', verifyUrl);
    }

    return NextResponse.json({
      success: true,
      message: hasSmtp
        ? 'Account created. Please check your email to verify your address.'
        : 'Account created. (Email not configured; a verification link was logged on the server.)',
    });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Email is already registered.' },
        { status: 409 }
      );
    }
    console.error('[Signup] error:', err);
    return NextResponse.json(
      { success: false, message: 'Signup failed.' },
      { status: 500 }
    );
  }
}

