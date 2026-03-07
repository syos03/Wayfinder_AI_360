/**
 * New Follower Notification
 * Sent when someone follows the user
 */

import * as React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import EmailLayout from '../base/layout';
import Button from '../components/button';

interface NewFollowerEmailProps {
  recipientName: string;
  followerName: string;
  followerBio?: string;
  followerStats: {
    reviews: number;
    followers: number;
    following: number;
  };
  profileUrl: string;
  unsubscribeUrl: string;
}

export default function NewFollowerEmail({
  recipientName,
  followerName,
  followerBio,
  followerStats,
  profileUrl,
  unsubscribeUrl,
}: NewFollowerEmailProps) {
  return (
    <EmailLayout
      preview={`${followerName} đã theo dõi bạn!`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section>
        <Heading style={h1}>Người theo dõi mới! 👥</Heading>
        
        <Text style={text}>
          Xin chào <strong>{recipientName}</strong>,
        </Text>

        <Text style={text}>
          <strong>{followerName}</strong> đã bắt đầu theo dõi bạn trên Wayfinder
          AI!
        </Text>

        {followerBio && (
          <Section style={profileBox}>
            <Text style={bioText}>"{followerBio}"</Text>
            <Text style={statsText}>
              📝 {followerStats.reviews} đánh giá • 👥{' '}
              {followerStats.followers} người theo dõi • ➡️{' '}
              {followerStats.following} đang theo dõi
            </Text>
          </Section>
        )}

        <Button href={profileUrl}>Xem hồ sơ của {followerName}</Button>

        <Text style={textSmall}>
          💡 Hãy xem hồ sơ và có thể theo dõi lại để kết nối cùng nhau!
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

const profileBox = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #0ea5e9',
  margin: '24px 0',
};

const bioText = {
  fontSize: '15px',
  color: '#1e40af',
  fontStyle: 'italic' as const,
  lineHeight: '22px',
  margin: '0 0 12px 0',
};

const statsText = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0',
};

const textSmall = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
};

const signature = {
  ...text,
  marginTop: '32px',
};

