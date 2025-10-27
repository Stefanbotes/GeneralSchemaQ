// lib/email-service.ts
import crypto from "crypto";
import { db } from "@/lib/db";

type EmailParams = {
  email: string;
  baseUrl: string;              // e.g. https://yourapp.com
  userId?: string;              // optional: link token to a user
  expiresInMinutes?: number;    // default 60
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
 * Create + store a verification token for email verification
 * Returns the *plaintext* token to embed in your email link.
 */
export async function createEmailVerificationToken({
  email,
  baseUrl,
  userId,
  expiresInMinutes = 60,
}: EmailParams) {
  const normalizedEmail = email.toLowerCase();
  const { token, hashed } = generateTokenPair();

  // Best-effort: clear any existing tokens for this email to keep it simple
  try {
    await db.verificationToken.deleteMany({ where: { email: normalizedEmail } });
  } catch {
    // ignore if table/index not present yet
  }

  // Store hashed token (NEVER store plaintext)
  await db.verificationToken.create({
    data: {
      token: hashed,                    // hashed token
      email: normalizedEmail,
      userId: userId ?? null,
      expires: minutesFromNow(expiresInMinutes),
    },
  });

  // Build your verification link with the *plaintext* token
  const verifyUrl = `${baseUrl.replace(/\/$/, "")}/api/verify-email?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(normalizedEmail)}`;

  return { token, verifyUrl };
}

/**
 * Create + store a password reset token.
 * Returns the plaintext token + URL you can email to the user.
 */
export async function createPasswordResetToken({
  email,
  baseUrl,
  userId,
  expiresInMinutes = 30,
}: EmailParams) {
  const normalizedEmail = email.toLowerCase();
  const { token, hashed } = generateTokenPair();

  // If you keep a dedicated passwordResetToken model:
  //   await db.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });
  //   await db.passwordResetToken.create({ data: { token: hashed, email: normalizedEmail, userId: userId ?? null, expires: minutesFromNow(expiresInMinutes) } });

  // If you reuse the same verificationToken table for resets, add a `purpose` field in your schema.
  // For now, this shows a dedicated model usage; adjust to your schema.
  try {
    await (db as any).passwordResetToken.deleteMany?.({ where: { email: normalizedEmail } });
  } catch {}
  await (db as any).passwordResetToken.create?.({
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

/* Example email sender (pseudo—replace with your provider)
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, url: string) {
  await resend.emails.send({
    from: 'no-reply@yourdomain.com',
    to,
    subject: 'Verify your email',
    html: `<p>Click to verify: <a href="${url}">${url}</a></p>`,
  });
}
*/
