// lib/mailer.ts
import nodemailer from "nodemailer";

let isVerified = false;

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM."
    );
  }

  // 587 STARTTLS (secure=false), 465 SMTPS (secure=true)
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // Helpful in some providers behind strict TLS during dev:
    tls: { rejectUnauthorized: false },
  });
}

async function ensureVerified(transporter: nodemailer.Transporter) {
  if (isVerified) return;
  try {
    await transporter.verify();
    isVerified = true;
  } catch (err: any) {
    // Surface exact SMTP handshake error
    throw new Error(`SMTP verify failed: ${err?.message ?? String(err)}`);
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const transporter = getTransport();
  await ensureVerified(transporter);

  const from = process.env.SMTP_FROM || "no-reply@example.com";

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Verify your email",
    html: `<p>Click to verify your email:</p>
           <p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });

  // Log provider response id for debugging
  console.log("[mailer] sent verification", { messageId: info.messageId, to });
  return info;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = getTransport();
  await ensureVerified(transporter);

  const from = process.env.SMTP_FROM || "no-reply@example.com";

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Reset your password",
    html: `<p>Click to reset your password:</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  console.log("[mailer] sent reset", { messageId: info.messageId, to });
  return info;
}
