// lib/mailer.ts
import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,                 // e.g. smtp.sendgrid.net, smtp.mailgun.org
  port: Number(process.env.SMTP_PORT) || 587,   // 587 for STARTTLS
  secure: false,                                // true if you use port 465
  auth: {
    user: process.env.SMTP_USER!,               // e.g. "apikey" for SendGrid, full user for Mailgun
    pass: process.env.SMTP_PASS!,               // API key / password
  },
});

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const from = process.env.SMTP_FROM || "no-reply@yourdomain.com";
  return mailer.sendMail({
    from,
    to,
    subject: "Verify your email",
    html: `<p>Click to verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.SMTP_FROM || "no-reply@yourdomain.com";
  return mailer.sendMail({
    from,
    to,
    subject: "Reset your password",
    html: `<p>Reset link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}
