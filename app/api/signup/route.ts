// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { createEmailVerificationToken } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

const schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({} as any));
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          message: 'Please correct the highlighted fields.',
          fieldErrors, // <-- object with arrays of messages per field
        },
        { status: 400 }
      );
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

    await db.user.create({
      data: {
        email: normalizedEmail,
        firstName,
        lastName,
        password: passwordHash,
        role: 'CLIENT',
        emailVerified: null, // Date | null per your schema
        tokenVersion: 0,
      },
    });

    // 3) Create verification token + URL
    const envBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      '';

    // fallback to request origin if envBase is empty
    const reqOrigin = (() => {
      try {
        return new URL(req.url).origin;
      } catch {
        return '';
      }
    })();

    const baseUrl = (envBase || reqOrigin).replace(/\/$/, '');
    const { verifyUrl } = await createEmailVerificationToken({
      email: normalizedEmail,
      baseUrl,
      expiresInMinutes: 60,
    });

    // TODO: send verification email using your provider:
    // await sendVerificationEmail(normalizedEmail, verifyUrl);
    console.log('[Signup] verification link (dev):', verifyUrl);

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email for a verification link.',
    });
  } catch (err: any) {
    console.error('[Signup] error:', err);
    const msg =
      err?.code === 'P2002'
        ? 'Email is already registered.'
        : 'Signup failed.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}

