/**
 * Badge Earned Notification
 * Sent when user earns a new badge
 */

import * as React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import EmailLayout from '../base/layout';
import Button from '../components/button';

interface BadgeEarnedEmailProps {
  recipientName: string;
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  profileUrl: string;
  unsubscribeUrl: string;
}

export default function BadgeEarnedEmail({
  recipientName,
  badgeName,
  badgeIcon,
  badgeDescription,
  profileUrl,
  unsubscribeUrl,
}: BadgeEarnedEmailProps) {
  return (
    <EmailLayout
      preview={`Chúc mừng! Bạn đã nhận huy hiệu ${badgeName}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section>
        <Heading style={h1}>Chúc mừng! 🎉</Heading>
        
        <Text style={text}>
          Xin chào <strong>{recipientName}</strong>,
        </Text>

        <Text style={text}>
          Bạn vừa mở khóa một huy hiệu mới trên Wayfinder AI!
        </Text>

        <Section style={badgeBox}>
          <Text style={badgeIcon}>{badgeIcon}</Text>
          <Heading style={badgeName}>{badgeName}</Heading>
          <Text style={badgeDesc}>{badgeDescription}</Text>
        </Section>

        <Text style={text}>
          Huy hiệu này sẽ được hiển thị trên hồ sơ của bạn và thể hiện những đóng
          góp tích cực của bạn cho cộng đồng Wayfinder AI.
        </Text>

        <Button href={profileUrl}>Xem hồ sơ của bạn</Button>

        <Text style={motivationText}>
          💪 Tiếp tục khám phá và chia sẻ để mở khóa thêm nhiều huy hiệu nhé!
        </Text>

        <Text style={signature}>
          Trân trọng,
          <br />
          <strong>Đội ngũ Wayfinder AI</strong>
        </Text>
      </Section>
    </EmailLayout>
  );
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '32px 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const badgeBox = {
  backgroundColor: '#fef3c7',
  padding: '32px 20px',
  borderRadius: '12px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '3px solid #f59e0b',
};

const badgeIcon = {
  fontSize: '64px',
  margin: '0 0 16px 0',
};

const badgeName = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#92400e',
  margin: '0 0 8px 0',
};

const badgeDesc = {
  fontSize: '15px',
  color: '#78350f',
  margin: '0',
  fontStyle: 'italic' as const,
};

const motivationText = {
  ...text,
  backgroundColor: '#f0fdf4',
  padding: '16px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  fontWeight: '500' as const,
};

const signature = {
  ...text,
  marginTop: '32px',
};

