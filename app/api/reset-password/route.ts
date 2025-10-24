
// Reset password API endpoint
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { PasswordUtils, TokenUtils } from '@/lib/auth-utils';
import { RateLimiter } from '@/lib/rate-limit';
import { EmailService } from '@/lib/email-service';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
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
    const validationResult = resetPasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;
    const hashedToken = TokenUtils.hashToken(token);

    // Find password reset token
    const resetToken = await db.password_reset_tokens.findFirst({
      where: {
        token: hashedToken,
        expires: { gt: new Date() },
        used: false,
      },
      include: {
        users: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await PasswordUtils.hash(password);

    // Update user password and invalidate sessions
    await db.$transaction([
      db.users.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
          tokenVersion: { increment: 1 }, // Invalidate existing sessions
          loginAttempts: 0, // Reset login attempts
          lockoutUntil: null,
        },
      }),
      db.password_reset_tokens.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Invalidate all existing sessions for this user
      db.sessions.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    // Send confirmation email
    try {
      await EmailService.sendPasswordChangeConfirmation(
        resetToken.users.email,
        resetToken.users.firstName
      );
    } catch (emailError) {
      console.error('Failed to send password change confirmation:', emailError);
      // Don't fail the password reset if email fails
    }

    return NextResponse.json({
      message: 'Password reset successfully. You can now log in with your new password.',
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
