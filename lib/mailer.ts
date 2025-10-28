// lib/mailer.ts
import nodemailer from "nodemailer";

let isVerified = false;

function getTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587); // 587 or 465
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!; // Gmail App Password

  if (!user || !pass) {
    throw new Error("Missing SMTP_USER/SMTP_PASS envs");
  }

  const secure = port === 465; // true for 465, false for 587
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

async function ensureVerified(transporter: nodemailer.Transporter) {
  if (isVerified) return;
  await transporter.verify(); // throws with clear reason if misconfigured
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
    html: `<p>Click to verify:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
  console.log("[mailer] sent verification", { to, messageId: info.messageId });
  return info;
}
