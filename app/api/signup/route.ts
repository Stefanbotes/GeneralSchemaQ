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

    const passwordHash = await hash(password, 10);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: passwordHash,
        role: 'CLIENT',
        // if you want “must click email” turn this to null
        emailVerified: new Date(),
        tokenVersion: 0,
      },
      select: { id: true, email: true },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      new URL(req.url).origin;

    const { verifyUrl } = await createEmailVerificationToken({
      email: user.email,
      baseUrl,
      expiresInMinutes: 60,
    });

    // Try to send; log on fallback
    try {
      await sendVerificationEmail(user.email, verifyUrl);
      console.log('[Signup] verification sent:', { to: user.email });
    } catch (e: any) {
      console.warn('[Signup] email send failed:', e?.message);
      console.log('[Signup] verification link:', verifyUrl);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created. Check your email for a verification link.',
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
