// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { createEmailVerificationToken } from '@/lib/email-service';

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

    // Check existing user
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

    const passwordHash = await hash(password, 10);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: passwordHash,
        role: 'CLIENT',

        // ⛳ TEMP UNBLOCKER:
        // Your live DB currently has users.emailVerified as NOT NULL.
        // Setting it to a Date satisfies the constraint so signup works.
        // (Later, once the DB column is nullable, you can change this back to null.)
        emailVerified: new Date(),

        tokenVersion: 0,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Work out a base URL that always exists
    const envBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      '';
    const origin = (() => {
      try { return new URL(req.url).origin; } catch { return ''; }
    })();
    const baseUrl = envBase || origin;

    // Create email verification link (still generated; you can ignore it if you’re treating users as verified)
    const { verifyUrl } = await createEmailVerificationToken({
      email: user.email,
      baseUrl,
      expiresInMinutes: 60,
    });

    // For now, just log the link (or send via your provider)
    console.log('[Signup] verification link:', verifyUrl);

    return NextResponse.json({
      success: true,
      message: 'Account created.',
    });
  } catch (err: any) {
    // Prisma error hygiene
    const code = err?.code;
    if (code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Email is already registered.' },
        { status: 409 }
      );
    }
    console.error('[Signup] error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Signup failed.',
        diagnostics: { code: err?.code, meta: err?.meta, message: err?.message },
      },
      { status: 500 }
    );
  }
}
