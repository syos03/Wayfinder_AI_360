/**
 * Resend Client Configuration
 * Email sending service using Resend API
 */

import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('⚠️ RESEND_API_KEY not configured. Emails will not be sent.');
}

export const resend = new Resend(resendApiKey || 'dummy-key');

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'noreply@wayfinder.ai',
  fromName: process.env.RESEND_FROM_NAME || 'Wayfinder AI',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  supportEmail: 'support@wayfinder.ai',
};

// Helper to format sender
export function getFromAddress(): string {
  return `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`;
}

