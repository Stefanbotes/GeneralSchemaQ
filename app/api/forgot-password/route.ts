
// Forgot password API endpoint
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { EmailUtils } from '@/lib/auth-utils';
import { RateLimiter } from '@/lib/rate-limit';
import { EmailService } from '@/lib/email-service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const clientIP = RateLimiter.getClientIP(request);
    
    // Check rate limiting
    const rateLimitResult = await RateLimiter.checkRateLimit('passwordReset', clientIP, 'ip');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many password reset attempts. Please try again later.',
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
    const validationResult = forgotPasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid email address',
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;
    const normalizedEmail = EmailUtils.normalize(email);

    // Find user (always return success to prevent email enumeration)
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && user.emailVerified) {
      try {
        // Clean up existing password reset tokens for this user
        await db.password_reset_tokens.deleteMany({
          where: { userId: user.id },
        });

        // Send password reset email
        await EmailService.sendPasswordResetEmail(user.id, normalizedEmail, user.firstName);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Still return success to prevent information leakage
      }
    }

    // Always return success response to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with this email exists, you will receive password reset instructions shortly.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
