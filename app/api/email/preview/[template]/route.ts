/**
 * Email Preview API
 * Preview email templates in browser
 */

import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import WelcomeEmail from '@/lib/email/templates/transactional/welcome';
import VerifyEmail from '@/lib/email/templates/transactional/verify-email';
import ResetPasswordEmail from '@/lib/email/templates/transactional/reset-password';
import PasswordChangedEmail from '@/lib/email/templates/transactional/password-changed';
import NewReviewEmail from '@/lib/email/templates/notifications/new-review';
import NewFollowerEmail from '@/lib/email/templates/notifications/new-follower';
import BadgeEarnedEmail from '@/lib/email/templates/notifications/badge-earned';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ template: string }> }
) {
  try {
    const { template } = await params;

    let html: string;

    switch (template) {
      case 'welcome':
        html = render(
          WelcomeEmail({
            name: 'Nguyễn Văn A',
            verifyUrl: 'https://wayfinder.ai/verify?token=abc123',
          })
        );
        break;

      case 'verify-email':
        html = render(
          VerifyEmail({
            name: 'Nguyễn Văn A',
            verifyUrl: 'https://wayfinder.ai/verify?token=abc123',
          })
        );
        break;

      case 'reset-password':
        html = render(
          ResetPasswordEmail({
            name: 'Nguyễn Văn A',
            resetUrl: 'https://wayfinder.ai/reset-password?token=xyz789',
          })
        );
        break;

      case 'password-changed':
        html = render(
          PasswordChangedEmail({
            name: 'Nguyễn Văn A',
            changeDate: new Date().toLocaleString('vi-VN'),
            supportUrl: 'mailto:support@wayfinder.ai',
          })
        );
        break;

      case 'new-review':
        html = render(
          NewReviewEmail({
            recipientName: 'Nguyễn Văn A',
            reviewerName: 'Trần Thị B',
            destinationName: 'Vịnh Hạ Long',
            rating: 5,
            comment:
              'Vịnh Hạ Long thực sự tuyệt vời! Cảnh đẹp ngoài sức tưởng tượng, dịch vụ tốt, chắc chắn sẽ quay lại.',
            reviewUrl: 'https://wayfinder.ai/destinations/123#reviews',
            unsubscribeUrl: 'https://wayfinder.ai/unsubscribe?token=abc123',
          })
        );
        break;

      case 'new-follower':
        html = render(
          NewFollowerEmail({
            recipientName: 'Nguyễn Văn A',
            followerName: 'Lê Văn C',
            followerBio: 'Đam mê du lịch và khám phá Việt Nam',
            followerStats: {
              reviews: 25,
              followers: 150,
              following: 80,
            },
            profileUrl: 'https://wayfinder.ai/profile/user123',
            unsubscribeUrl: 'https://wayfinder.ai/unsubscribe?token=abc123',
          })
        );
        break;

      case 'badge-earned':
        html = render(
          BadgeEarnedEmail({
            recipientName: 'Nguyễn Văn A',
            badgeName: 'Nhà Phê Bình',
            badgeIcon: '📝',
            badgeDescription: 'Đã viết 10+ đánh giá chất lượng',
            profileUrl: 'https://wayfinder.ai/profile/user123',
            unsubscribeUrl: 'https://wayfinder.ai/unsubscribe?token=abc123',
          })
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('Email preview error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

