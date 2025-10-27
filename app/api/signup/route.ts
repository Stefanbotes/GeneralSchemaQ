// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const Body = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function bad(message: string, extra?: any) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues?.[0]?.message ?? 'Invalid payload';
      return bad(first, { details: parsed.error.format() });
    }

    const { firstName, lastName, email, password } = parsed.data;

    // 1) Check if email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return bad('An account with this email already exists.');
    }

    // 2) Hash password
    const passwordHash = await hash(password, 12);

    // 3) Create user (omit emailVerified or set to null)
    const user = await db.user.create({
      data: {
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: passwordHash,
        role: 'CLIENT',          // default role
        // emailVerified: null,   // optional; omitting also results in null
      },
      select: { id: true, email: true },
    });

    // 4) Create verification token (NextAuth expects { identifier, token, expires })
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await db.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    // TODO: send verification email with the tokenized link:
    // e.g. `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email to verify your address.',
      user: { id: user.id, email: user.email },
    });
  } catch (err: any) {
    // Handle unique constraint race just in case
    if (err?.code === 'P2002' && err?.meta?.target?.includes('email')) {
      return bad('An account with this email already exists.');
    }
    console.error('[signup] error:', err);
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Internal error' },
      { status: 500 }
    );
  }
}
