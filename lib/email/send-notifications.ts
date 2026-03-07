/**
 * Notification Email Helpers
 * Functions to send notification emails
 */

import { render } from '@react-email/render';
import { sendEmail } from './send';
import { EMAIL_CONFIG } from './resend';
import { connectDB } from '@/lib/db/mongodb';
import EmailPreferences from '@/lib/models/EmailPreferences';
import NewReviewEmail from './templates/notifications/new-review';
import NewFollowerEmail from './templates/notifications/new-follower';
import BadgeEarnedEmail from './templates/notifications/badge-earned';

/**
 * Check if user can receive notification emails
 */
async function canReceiveNotification(
  userId: string,
  notificationType: 'reviews' | 'followers' | 'badges' | 'replies'
): Promise<boolean> {
  try {
    await connectDB();
    
    const preferences = await EmailPreferences.findOne({ userId });
    
    if (!preferences) {
      // Default: allow all notifications
      return true;
    }

    // Check if unsubscribed
    if (preferences.unsubscribedAt) {
      return false;
    }

    // Check frequency
    if (preferences.frequency === 'never') {
      return false;
    }

    // Check specific notification type
    return preferences.notifications[notificationType] !== false;
  } catch (error) {
    console.error('Error checking email preferences:', error);
    // Default: allow (fail open)
    return true;
  }
}

/**
 * Generate unsubscribe URL
 */
function getUnsubscribeUrl(userId: string, token: string): string {
  return `${EMAIL_CONFIG.appUrl}/email/unsubscribe?userId=${userId}&token=${token}`;
}

/**
 * Send new review notification
 */
export async function sendNewReviewEmail(params: {
  recipientEmail: string;
  recipientName: string;
  recipientId: string;
  reviewerName: string;
  destinationName: string;
  rating: number;
  comment: string;
  reviewId: string;
  unsubscribeToken: string;
}): Promise<{ success: boolean; error?: string }> {
  // Check preferences
  const canSend = await canReceiveNotification(params.recipientId, 'reviews');
  if (!canSend) {
    return { success: false, error: 'User opted out of review notifications' };
  }

  const reviewUrl = `${EMAIL_CONFIG.appUrl}/destinations/${params.reviewId}#reviews`;
  const unsubscribeUrl = getUnsubscribeUrl(
    params.recipientId,
    params.unsubscribeToken
  );

  const html = await render(
    NewReviewEmail({
      recipientName: params.recipientName,
      reviewerName: params.reviewerName,
      destinationName: params.destinationName,
      rating: params.rating,
      comment: params.comment,
      reviewUrl,
      unsubscribeUrl,
    })
  );

  return sendEmail({
    to: params.recipientEmail,
    subject: `${params.reviewerName} đã đánh giá ${params.destinationName}`,
    html,
    type: 'notification',
    template: 'new-review',
    userId: params.recipientId,
  });
}

/**
 * Send new follower notification
 */
export async function sendNewFollowerEmail(params: {
  recipientEmail: string;
  recipientName: string;
  recipientId: string;
  followerName: string;
  followerBio?: string;
  followerStats: {
    reviews: number;
    followers: number;
    following: number;
  };
  followerProfileId: string;
  unsubscribeToken: string;
}): Promise<{ success: boolean; error?: string }> {
  // Check preferences
  const canSend = await canReceiveNotification(params.recipientId, 'followers');
  if (!canSend) {
    return { success: false, error: 'User opted out of follower notifications' };
  }

  const profileUrl = `${EMAIL_CONFIG.appUrl}/profile/${params.followerProfileId}`;
  const unsubscribeUrl = getUnsubscribeUrl(
    params.recipientId,
    params.unsubscribeToken
  );

  const html = await render(
    NewFollowerEmail({
      recipientName: params.recipientName,
      followerName: params.followerName,
      followerBio: params.followerBio,
      followerStats: params.followerStats,
      profileUrl,
      unsubscribeUrl,
    })
  );

  return sendEmail({
    to: params.recipientEmail,
    subject: `${params.followerName} đã theo dõi bạn trên Wayfinder AI`,
    html,
    type: 'notification',
    template: 'new-follower',
    userId: params.recipientId,
  });
}

/**
 * Send badge earned notification
 */
export async function sendBadgeEarnedEmail(params: {
  recipientEmail: string;
  recipientName: string;
  recipientId: string;
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  unsubscribeToken: string;
}): Promise<{ success: boolean; error?: string }> {
  // Check preferences
  const canSend = await canReceiveNotification(params.recipientId, 'badges');
  if (!canSend) {
    return { success: false, error: 'User opted out of badge notifications' };
  }

  const profileUrl = `${EMAIL_CONFIG.appUrl}/profile/${params.recipientId}`;
  const unsubscribeUrl = getUnsubscribeUrl(
    params.recipientId,
    params.unsubscribeToken
  );

  const html = await render(
    BadgeEarnedEmail({
      recipientName: params.recipientName,
      badgeName: params.badgeName,
      badgeIcon: params.badgeIcon,
      badgeDescription: params.badgeDescription,
      profileUrl,
      unsubscribeUrl,
    })
  );

  return sendEmail({
    to: params.recipientEmail,
    subject: `🎉 Bạn đã nhận huy hiệu ${params.badgeName}!`,
    html,
    type: 'notification',
    template: 'badge-earned',
    userId: params.recipientId,
  });
}

