
// Email verification API endpoint
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { TokenUtils } from '@/lib/auth-utils';
import { RateLimiter } from '@/lib/rate-limit';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const clientIP = RateLimiter.getClientIP(request);
    
    // Check rate limiting
    const rateLimitResult = await RateLimiter.checkRateLimit('emailVerification', clientIP, 'ip');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many verification attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600'
          }
        }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = verifyEmailSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { token, email } = validationResult.data;
    const hashedToken = TokenUtils.hashToken(token);

    // Find verification token
    const verificationToken = await db.verification_tokens.findFirst({
      where: {
        token: hashedToken,
        email: email.toLowerCase(),
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user as verified
    await db.$transaction([
      db.user.update({
        where: { email: email.toLowerCase() },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      db.verification_tokens.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return NextResponse.json({
      message: 'Email verified successfully. You can now log in.',
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
