
// Authentication utilities with bcryptjs hashing and secure token generation
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { db } from './db';
import { UserRole } from '@prisma/client';

// Password validation regex - Simple for testing
export const PASSWORD_REGEX = /^.{4,}$/;

// Password security utilities
export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    try {
      // Use salt rounds of 12 for good security/performance balance
      return await bcrypt.hash(password, 12);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  static async verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  static validate(password: string): boolean {
    return PASSWORD_REGEX.test(password);
  }
}

// Secure token generation and verification
export class TokenUtils {
  static generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  static verifyToken(token: string, hashedToken: string): boolean {
    const computedHash = this.hashToken(token);
    return computedHash === hashedToken;
  }
}

// Account lockout utilities with progressive backoff
export class LockoutUtils {
  private static readonly LOCKOUT_DURATIONS = [
    5 * 60 * 1000,   // 5 minutes
    15 * 60 * 1000,  // 15 minutes  
    30 * 60 * 1000,  // 30 minutes
    60 * 60 * 1000,  // 1 hour
    120 * 60 * 1000, // 2 hours
  ];

  static calculateLockoutDuration(attempts: number): number {
    if (attempts <= 3) return 0;
    
    const index = Math.min(attempts - 4, this.LOCKOUT_DURATIONS.length - 1);
    return this.LOCKOUT_DURATIONS[index];
  }

  static async incrementLoginAttempts(userId: string): Promise<{ locked: boolean; lockoutUntil?: Date }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { loginAttempts: true, lockoutUntil: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const newAttempts = user.loginAttempts + 1;
    const lockoutDuration = this.calculateLockoutDuration(newAttempts);
    const lockoutUntil = lockoutDuration > 0 ? new Date(Date.now() + lockoutDuration) : null;

    await db.user.update({
      where: { id: userId },
      data: {
        loginAttempts: newAttempts,
        lockoutUntil
      }
    });

    return {
      locked: lockoutDuration > 0,
      lockoutUntil: lockoutUntil || undefined
    };
  }

  static async resetLoginAttempts(userId: string): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lockoutUntil: null,
        lastLogin: new Date()
      }
    });
  }

  static async isAccountLocked(userId: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { lockoutUntil: true }
    });

    if (!user?.lockoutUntil) return false;
    
    if (user.lockoutUntil > new Date()) {
      return true;
    }

    // Lockout expired, reset attempts
    await this.resetLoginAttempts(userId);
    return false;
  }
}

// User role utilities
export class RoleUtils {
  private static readonly ROLE_HIERARCHY: Record<UserRole, number> = {
    CLIENT: 1,
    COACH: 2,
    ADMIN: 3,
  };

  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.ROLE_HIERARCHY[userRole] >= this.ROLE_HIERARCHY[requiredRole];
  }

  static canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    return this.ROLE_HIERARCHY[managerRole] > this.ROLE_HIERARCHY[targetRole];
  }
}

// Email validation
export class EmailUtils {
  static validate(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static normalize(email: string): string {
    return email.toLowerCase().trim();
  }
}

// Security headers and CSRF protection
export class SecurityUtils {
  static generateCSRFToken(): string {
    return randomBytes(32).toString('base64');
  }

  static getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https: wss:; frame-src https://www.google.com;"
    };
  }
}
