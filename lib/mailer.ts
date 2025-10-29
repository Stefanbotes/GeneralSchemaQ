// lib/mailer.ts
import nodemailer from "nodemailer";

let isVerified = false;

function getTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587); // 587 STARTTLS, 465 SMTPS
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error("SMTP not configured: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM");
  }
  const secure = port === 465;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

async function ensureVerified(transporter: nodemailer.Transporter) {
  if (isVerified) return;
  await transporter.verify(); // throws with a clear reason if misconfigured
  isVerified = true;
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const transporter = getTransport();
  await ensureVerified(transporter);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const info = await transporter.sendMail({
    from,
    to,
    subject: "Verify your email",
    html: `<p>Click to verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
  console.log("[mailer] sent verification", { to, messageId: info.messageId });
  return info;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = getTransport();
  await ensureVerified(transporter);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const info = await transporter.sendMail({
    from,
    to,
    subject: "Reset your password",
    html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
  console.log("[mailer] sent reset", { to, messageId: info.messageId });
  return info;
}
