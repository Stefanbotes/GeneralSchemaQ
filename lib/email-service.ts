// lib/email-service.ts
import crypto from "crypto";
import { db } from "@/lib/db";

type EmailParams = {
  email: string;                 // user email (stored in VerificationToken.identifier)
  baseUrl?: string;              // e.g. https://yourapp.com (optional; we’ll fallback to env)
  userId?: string;               // optional (for password reset linkage)
  expiresInMinutes?: number;     // default 60 for verification, 30 for reset (set per caller)
};

/** Generate a random token and its SHA256 hash (store hash, send plaintext) */
function generateTokenPair() {
  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashed };
}

/** Date `minutes` from now */
function minutesFromNow(minutes: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

/** Resolve a safe base URL (caller param > NEXT_PUBLIC_APP_URL > NEXTAUTH_URL) */
function resolveBaseUrl(input?: string) {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "";

  const base = (input || fromEnv).trim();
  if (!base) {
    // We don’t throw here to keep callers simple; they can still read the URL in logs.
    // If you prefer strict behavior, throw new Error("No baseUrl configured");
  }
  return base.replace(/\/$/, "");
}

/**
 * Create + store an email verification token (NextAuth-style table)
 * Model: VerificationToken { identifier, token, expires, ... }
 * We store the *hash* of the token; return plaintext + URL for email.
 */
export async function createEmailVerificationToken({
  email,
  baseUrl,
  expiresInMinutes = 60,
}: EmailParams) {
  const normalizedEmail = email.toLowerCase().trim();
  const { token, hashed } = generateTokenPair();
  const base = resolveBaseUrl(baseUrl);

  // Clear old tokens for this identifier
  try {
    await db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
  } catch {
    /* ignore if table not yet migrated */
  }

  // Store hashed token
  await db.verificationToken.create({
    data: {
      identifier: normalizedEmail,   // <- NOT "email"
      token: hashed,                 // <- store hash, never plaintext
      expires: minutesFromNow(expiresInMinutes),
    },
  });

  const verifyUrl = `${base}/api/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(
    normalizedEmail
  )}`;

  return { token, verifyUrl };
}

/**
 * Create + store a password reset token.
 * Your Prisma model maps to table "password_reset_tokens", so the delegate is `db.passwordResetToken`.
 * We keep a cautious (db as any) in case of naming drift during migrations.
 */
export async function createPasswordResetToken({
  email,
  baseUrl,
  userId,
  expiresInMinutes = 30,
}: EmailParams) {
  const normalizedEmail = email.toLowerCase().trim();
  const { token, hashed } = generateTokenPair();
  const base = resolveBaseUrl(baseUrl);

  // Clean old tokens for this email (optional but helpful)
  try {
    await (db as any).passwordResetToken?.deleteMany?.({ where: { email: normalizedEmail } });
  } catch {
    /* ignore */
  }

  // Store hashed token
  await (db as any).passwordResetToken?.create?.({
    data: {
      token: hashed,                         // store hash
      email: normalizedEmail,
      userId: userId ?? null,
      expires: minutesFromNow(expiresInMinutes),
    },
  });

  // IMPORTANT: point to the page route, not bare /reset-password
  const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(
    normalizedEmail
  )}`;

  return { token, resetUrl };
}

/** Convenience grouped export */
export const EmailService = {
  createEmailVerificationToken,
  createPasswordResetToken,
};
