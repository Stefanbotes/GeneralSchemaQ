// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { createEmailVerificationToken } from '@/lib/email-service';
import { sendVerificationEmail } from '@/lib/mailer'; // make sure lib/mailer.ts exists

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
    const body = await req.json().catch(() => ({} as unknown));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
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

    // Hash password and create user
    const passwordHash = await hash(password, 10);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: passwordHash,
        role: 'CLIENT',

        // TEMP: your live DB currently requires this column (NOT NULL)
        // Set it to a Date so signup works immediately.
        // Later, once you make the column nullable, change this to `null` to enforce verification.
        emailVerified: new Date(),

        tokenVersion: 0,
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    // Base URL for links
    const envBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      '';
    const origin = (() => {
      try {
        return new URL(req.url).origin;
      } catch {
        return '';
      }
    })();
    const baseUrl = envBase || origin;

    // Create a verification link (even though user is verified for now)
    const { verifyUrl } = await createEmailVerificationToken({
      email: user.email,
      baseUrl,
      expiresInMinutes: 60,
    });

    // Try to send email if SMTP is configured; otherwise just log it
    const hasSmtp =
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_USER &&
      !!process.env.SMTP_PASS;

    if (hasSmtp) {
      try {
        await sendVerificationEmail(user.email, verifyUrl);
      } catch (e) {
        console.warn('[Signup] email send failed, falling back to log:', (e as Error)?.message);
        console.log('[Signup] verification link:', verifyUrl);
      }
    } else {
      console.log('[Signup] verification link:', verifyUrl);
    }

    return NextResponse.json({
      success: true,
      message: hasSmtp
        ? 'Account created. Please check your email for a verification link.'
        : 'Account created. (Email service not configured; verify link logged on server.)',
    });
  } catch (err: any) {
    // Prisma error hygiene
    if (err?.code === 'P2002') {
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
