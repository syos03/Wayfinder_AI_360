/**
 * Email Sending Utility
 * Centralized email sending with logging and error handling
 */

import { resend, getFromAddress } from './resend';
import { connectDB } from '@/lib/db/mongodb';
import EmailLog from '@/lib/models/EmailLog';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  type?: 'transactional' | 'notification' | 'marketing';
  template?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Send email via Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    // Check if Resend is configured (skip dummy-key)
    if (!resendApiKey || resendApiKey === 'dummy-key') {
      console.warn('⚠️ RESEND_API_KEY not set. Email not sent:', {
        to: options.to,
        subject: options.subject,
      });
      
      // In development, just log
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV] Email would be sent:', {
          to: options.to,
          subject: options.subject,
          template: options.template,
        });
        
        // Log email to database even in dev mode
        await logEmail({
          userId: options.userId,
          type: options.type || 'transactional',
          template: options.template || 'custom',
          recipient: Array.isArray(options.to) ? options.to[0] : options.to,
          subject: options.subject,
          status: 'sent',
          metadata: { ...options.metadata, mode: 'development' },
        });
        
        return { success: true, messageId: 'dev-mode' };
      }
      
      return { success: false, error: 'Resend API key not configured' };
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    // Debug: Log full response
    console.log('🔍 Resend response:', JSON.stringify(result, null, 2));

    if (!result.data?.id) {
      console.error('❌ Resend error details:', {
        error: result.error,
        data: result.data,
        fullResult: result,
      });
      throw new Error('Failed to send email: No message ID returned');
    }

    // Log email to database
    await logEmail({
      userId: options.userId,
      type: options.type || 'transactional',
      template: options.template || 'custom',
      recipient: Array.isArray(options.to) ? options.to[0] : options.to,
      subject: options.subject,
      status: 'sent',
      resendId: result.data.id,
      metadata: options.metadata,
    });

    console.log('✅ Email sent successfully:', {
      to: options.to,
      subject: options.subject,
      messageId: result.data.id,
    });

    return {
      success: true,
      messageId: result.data.id,
    };
  } catch (error: any) {
    console.error('❌ Failed to send email:', {
      to: options.to,
      subject: options.subject,
      error: error.message,
    });

    // Log failed email
    try {
      await logEmail({
        userId: options.userId,
        type: options.type || 'transactional',
        template: options.template || 'custom',
        recipient: Array.isArray(options.to) ? options.to[0] : options.to,
        subject: options.subject,
        status: 'failed',
        metadata: { ...options.metadata, error: error.message },
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Log email to database
 */
async function logEmail(data: {
  userId?: string;
  type: string;
  template: string;
  recipient: string;
  subject: string;
  status: string;
  resendId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await connectDB();
    
    await EmailLog.create({
      userId: data.userId,
      type: data.type,
      template: data.template,
      recipient: data.recipient,
      subject: data.subject,
      status: data.status,
      resendId: data.resendId,
      metadata: data.metadata,
      sentAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to log email:', error);
    // Don't throw - logging failure shouldn't stop email sending
  }
}

/**
 * Send batch emails
 */
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<{
  success: number;
  failed: number;
  results: Array<{ success: boolean; error?: string }>;
}> {
  const results = await Promise.all(
    emails.map(email => sendEmail(email))
  );

  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success,
    failed,
    results,
  };
}

