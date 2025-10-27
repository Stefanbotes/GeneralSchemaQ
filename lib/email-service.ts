// lib/email-service.ts
import crypto from "crypto";
import { db } from "@/lib/db";

type EmailParams = {
  email: string;                 // user email (we'll store in VerificationToken.identifier)
  baseUrl: string;               // e.g. https://yourapp.com
  userId?: string;               // optional (used for password reset model if you have it)
  expiresInMinutes?: number;     // default 60 for verification, 30 for reset (see callers)
};

/** Generate a random token (hex) and its SHA256 hash */
function generateTokenPair() {
  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashed };
}

/** Create a Date object `minutes` minutes in the future */
function minutesFromNow(minutes: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

/**
 * Create + store an email verification token (NextAuth default model)
 * VerificationToken fields: identifier (email), token (hashed), expires
 * Returns the *plaintext* token and a ready-to-use verify URL.
 */
export async function createEmailVerificationToken({
  email,
  baseUrl,
  expiresInMinutes = 60,
}: EmailParams) {
  const normalizedEmail = email.toLowerCase();
  const { token, hashed } = generateTokenPair();

  // Clear old tokens for this identifier (email)
  try {
    await db.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });
  } catch {
    // ignore if the table doesn't exist yet
  }

  // Store hashed token using NextAuth's VerificationToken shape
  await db.verificationToken.create({
    data: {
      identifier: normalizedEmail,          // <-- NOT "email"
      token: hashed,                        // store the hash, never plaintext
      expires: minutesFromNow(expiresInMinutes),
    },
  });

  const verifyUrl = `${baseUrl.replace(/\/$/, "")}/api/verify-email?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(normalizedEmail)}`;

  return { token, verifyUrl };
}

/**
 * Create + store a password reset token.
 * Adjust the delegate/fields to match your schema.
 * If you have: model password_reset_tokens { token,email,userId,expires,... }
 * the delegate will likely be: db.passwordResetToken
 */
export async function createPasswordResetToken({
  email,
  baseUrl,
  userId,
  expiresInMinutes = 30,
}: EmailParams) {
  const normalizedEmail = email.toLowerCase();
  const { token, hashed } = generateTokenPair();

  // If your Prisma model is `model password_reset_tokens { ... }` with Prisma default naming,
  // the client delegate will be camel-cased singular: `db.passwordResetToken`.
  // Adjust the field names below to your actual schema.
  try {
    await (db as any).passwordResetToken?.deleteMany?.({
      where: { email: normalizedEmail },
    });
  } catch {
    /* ignore */
  }

  await (db as any).passwordResetToken?.create?.({
    data: {
      token: hashed,
      email: normalizedEmail,
      userId: userId ?? null,
      expires: minutesFromNow(expiresInMinutes),
    },
  });

  const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(normalizedEmail)}`;

  return { token, resetUrl };
}

/** Convenience export (optional) for modules that expect an EmailService object */
export const EmailService = {
  createEmailVerificationToken,
  createPasswordResetToken,
};
