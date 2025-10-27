// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { createEmailVerificationToken } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
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

    const { firstName, lastName, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // 1) Uniqueness check
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // 2) Create user
    const passwordHash = await hash(password, 10);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: passwordHash,
        role: 'CLIENT',            // default
        emailVerified: null,       // Date | null in your schema
        tokenVersion: 0,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
      },
    });

    // 3) Create verification token + URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      '';

    const { verifyUrl } = await createEmailVerificationToken({
      email: user.email,
      baseUrl,
      expiresInMinutes: 60,
    });

    // TODO: send email via your provider
    // await sendVerificationEmail(user.email, verifyUrl);
    console.log('[Signup] verification link (dev):', verifyUrl);

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email for a verification link.',
    });
  } catch (err: any) {
    console.error('[Signup] error:', err);
    // Try to expose a readable error
    const msg =
      err?.code === 'P2002'
        ? 'Email is already registered.'
        : err?.message || 'Signup failed.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

