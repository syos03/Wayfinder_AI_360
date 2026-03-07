/**
 * New Review Notification
 * Sent when someone reviews a destination
 */

import * as React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import EmailLayout from '../base/layout';
import Button from '../components/button';

interface NewReviewEmailProps {
  recipientName: string;
  reviewerName: string;
  destinationName: string;
  rating: number;
  comment: string;
  reviewUrl: string;
  unsubscribeUrl: string;
}

export default function NewReviewEmail({
  recipientName,
  reviewerName,
  destinationName,
  rating,
  comment,
  reviewUrl,
  unsubscribeUrl,
}: NewReviewEmailProps) {
  return (
    <EmailLayout
      preview={`${reviewerName} đã đánh giá ${destinationName}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section>
        <Heading style={h1}>Đánh giá mới! ⭐</Heading>
        
        <Text style={text}>
          Xin chào <strong>{recipientName}</strong>,
        </Text>

        <Text style={text}>
          <strong>{reviewerName}</strong> vừa đánh giá{' '}
          <strong>{destinationName}</strong>:
        </Text>

        <Section style={reviewBox}>
          <Text style={ratingText}>
            {'⭐'.repeat(rating)} ({rating}/5)
          </Text>
          <Text style={commentText}>
            "{comment.substring(0, 150)}
            {comment.length > 150 ? '...' : ''}"
          </Text>
        </Section>

        <Button href={reviewUrl}>Xem đánh giá đầy đủ</Button>

        <Text style={textSmall}>
          💡 Bạn có thể trả lời đánh giá này để giao lưu với cộng đồng!
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

const reviewBox = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #3b82f6',
  margin: '24px 0',
};

const ratingText = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#f59e0b',
  margin: '0 0 12px 0',
};

const commentText = {
  fontSize: '15px',
  color: '#4b5563',
  fontStyle: 'italic' as const,
  lineHeight: '22px',
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

