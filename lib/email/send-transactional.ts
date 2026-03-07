/**
 * Transactional Email Helpers
 * Functions to send transactional emails
 */

import { render } from '@react-email/render';
import { sendEmail } from './send';
import { EMAIL_CONFIG } from './resend';
import WelcomeEmail from './templates/transactional/welcome';
import VerifyEmail from './templates/transactional/verify-email';
import ResetPasswordEmail from './templates/transactional/reset-password';
import PasswordChangedEmail from './templates/transactional/password-changed';

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `${EMAIL_CONFIG.appUrl}/auth/verify-email?token=${verificationToken}`;

  const html = render(
    WelcomeEmail({
      name,
      verifyUrl,
    })
  );

  return sendEmail({
    to,
    subject: 'Chào mừng đến với Wayfinder AI! 🧭',
    html,
    type: 'transactional',
    template: 'welcome',
  });
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `${EMAIL_CONFIG.appUrl}/auth/verify-email?token=${verificationToken}`;

  const html = render(
    VerifyEmail({
      name,
      verifyUrl,
    })
  );

  return sendEmail({
    to,
    subject: 'Xác minh địa chỉ email của bạn',
    html,
    type: 'transactional',
    template: 'verify-email',
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${EMAIL_CONFIG.appUrl}/auth/reset-password?token=${resetToken}`;

  const html = render(
    ResetPasswordEmail({
      name,
      resetUrl,
    })
  );

  return sendEmail({
    to,
    subject: 'Đặt lại mật khẩu Wayfinder AI',
    html,
    type: 'transactional',
    template: 'reset-password',
  });
}

/**
 * Send password changed notification
 */
export async function sendPasswordChangedEmail(
  to: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const changeDate = new Date().toLocaleString('vi-VN');
  const supportUrl = `mailto:${EMAIL_CONFIG.supportEmail}`;

  const html = render(
    PasswordChangedEmail({
      name,
      changeDate,
      supportUrl,
    })
  );

  return sendEmail({
    to,
    subject: 'Mật khẩu của bạn đã được thay đổi',
    html,
    type: 'transactional',
    template: 'password-changed',
  });
}

