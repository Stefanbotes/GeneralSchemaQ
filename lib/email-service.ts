
// Email service with Nodemailer and security features
import nodemailer from 'nodemailer';
import { TokenUtils } from './auth-utils';
import { db } from './db';

export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendEmail(config: EmailConfig): Promise<boolean> {
    try {
      // Development mode - log emails instead of sending
      if (process.env.EMAIL_DEBUG === 'true' || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('\n=== EMAIL DEBUG MODE ===');
        console.log('To:', config.to);
        console.log('Subject:', config.subject);
        console.log('Text Content:', config.text);
        console.log('========================\n');
        return true; // Return true for development
      }

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        ...config,
      });

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Email verification
  static async sendVerificationEmail(email: string, firstName: string): Promise<string> {
    const rawToken = TokenUtils.generateSecureToken();
    const hashedToken = TokenUtils.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await db.verification_tokens.create({
      data: {
        token: hashedToken,
        email,
        expires: expiresAt,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    const html = this.getVerificationEmailHTML(firstName, verificationUrl);
    const text = this.getVerificationEmailText(firstName, verificationUrl);

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Leadership Personas Assessment',
      html,
      text,
    });

    return rawToken;
  }

  // Password reset email
  static async sendPasswordResetEmail(userId: string, email: string, firstName: string): Promise<string> {
    const rawToken = TokenUtils.generateSecureToken();
    const hashedToken = TokenUtils.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store password reset token
    await db.password_reset_tokens.create({
      data: {
        token: hashedToken,
        userId,
        expires: expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${rawToken}`;

    const html = this.getPasswordResetEmailHTML(firstName, resetUrl);
    const text = this.getPasswordResetEmailText(firstName, resetUrl);

    await this.sendEmail({
      to: email,
      subject: 'Password Reset - Leadership Personas Assessment',
      html,
      text,
    });

    return rawToken;
  }

  // Password change confirmation
  static async sendPasswordChangeConfirmation(email: string, firstName: string): Promise<void> {
    const html = this.getPasswordChangeConfirmationHTML(firstName);
    const text = this.getPasswordChangeConfirmationText(firstName);

    await this.sendEmail({
      to: email,
      subject: 'Password Changed - Leadership Personas Assessment',
      html,
      text,
    });
  }

  // HTML Email Templates with XSS protection
  private static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private static getVerificationEmailHTML(firstName: string, verificationUrl: string): string {
    const safeName = this.escapeHtml(firstName);
    const safeUrl = this.escapeHtml(verificationUrl);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <h2>Hi ${safeName},</h2>
              <p>Welcome to Leadership Personas Assessment! Please verify your email address to complete your registration.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${safeUrl}" class="button">Verify Email Address</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${safeUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Leadership Personas Assessment. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getVerificationEmailText(firstName: string, verificationUrl: string): string {
    return `
Hi ${firstName},

Welcome to Leadership Personas Assessment! Please verify your email address to complete your registration.

Click this link to verify your email:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

© 2025 Leadership Personas Assessment. All rights reserved.
    `.trim();
  }

  private static getPasswordResetEmailHTML(firstName: string, resetUrl: string): string {
    const safeName = this.escapeHtml(firstName);
    const safeUrl = this.escapeHtml(resetUrl);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #fef2f2; border-left: 4px solid #f87171; padding: 15px; margin: 20px 0; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hi ${safeName},</h2>
              <p>We received a request to reset your password for your Leadership Personas Assessment account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${safeUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${safeUrl}</p>
              <div class="warning">
                <strong>Security Notice:</strong>
                <ul>
                  <li>This link will expire in 15 minutes</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Leadership Personas Assessment. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getPasswordResetEmailText(firstName: string, resetUrl: string): string {
    return `
Hi ${firstName},

We received a request to reset your password for your Leadership Personas Assessment account.

Click this link to reset your password:
${resetUrl}

SECURITY NOTICE:
- This link will expire in 15 minutes
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged until you create a new one

© 2025 Leadership Personas Assessment. All rights reserved.
    `.trim();
  }

  private static getPasswordChangeConfirmationHTML(firstName: string): string {
    const safeName = this.escapeHtml(firstName);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .success { background: #ecfdf5; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed Successfully</h1>
            </div>
            <div class="content">
              <h2>Hi ${safeName},</h2>
              <div class="success">
                <p><strong>Your password has been successfully changed.</strong></p>
              </div>
              <p>If you didn't make this change, please contact our support team immediately.</p>
              <p>For your security, you may be asked to log in again on your devices.</p>
            </div>
            <div class="footer">
              <p>© 2025 Leadership Personas Assessment. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getPasswordChangeConfirmationText(firstName: string): string {
    return `
Hi ${firstName},

Your password has been successfully changed.

If you didn't make this change, please contact our support team immediately.

For your security, you may be asked to log in again on your devices.

© 2025 Leadership Personas Assessment. All rights reserved.
    `.trim();
  }
}
