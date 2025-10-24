
// Rate limiting utilities
import { db } from './db';
import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
}

export const RATE_LIMIT_CONFIGS = {
  registration: { windowMs: 60 * 60 * 1000, maxAttempts: 5 }, // 5 per hour
  login: { windowMs: 15 * 60 * 1000, maxAttempts: 10 }, // 10 per 15 minutes
  passwordReset: { windowMs: 60 * 60 * 1000, maxAttempts: 3 }, // 3 per hour
  emailVerification: { windowMs: 60 * 60 * 1000, maxAttempts: 5 }, // 5 per hour
} as const;

export class RateLimiter {
  static async checkRateLimit(
    action: keyof typeof RATE_LIMIT_CONFIGS,
    identifier: string, // IP address or user ID
    identifierType: 'ip' | 'user'
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const config = RATE_LIMIT_CONFIGS[action];
    const windowStart = new Date(Date.now() - config.windowMs);

    try {
      // Find existing rate limit record
      const whereClause = identifierType === 'ip' 
        ? { ipAddress: identifier, action, windowStart: { gte: windowStart } }
        : { userId: identifier, action, windowStart: { gte: windowStart } };

      const existingRecord = await db.rate_limit_records.findFirst({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      if (!existingRecord) {
        // Create new rate limit record
        await db.rate_limit_records.create({
          data: {
            action,
            attempts: 1,
            windowStart: new Date(),
            ...(identifierType === 'ip' ? { ipAddress: identifier } : { userId: identifier })
          }
        });
        return { allowed: true };
      }

      if (existingRecord.attempts >= config.maxAttempts) {
        const retryAfter = Math.ceil((existingRecord.windowStart.getTime() + config.windowMs - Date.now()) / 1000);
        return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
      }

      // Increment attempts
      await db.rate_limit_records.update({
        where: { id: existingRecord.id },
        data: { attempts: { increment: 1 } }
      });

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // On error, allow the request but log the issue
      return { allowed: true };
    }
  }

  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP.trim();
    }
    
    return request.ip || 'unknown';
  }

  static async cleanupExpiredRecords(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      await db.rate_limit_records.deleteMany({
        where: {
          createdAt: { lt: cutoffTime }
        }
      });
    } catch (error) {
      console.error('Failed to cleanup rate limit records:', error);
    }
  }
}
