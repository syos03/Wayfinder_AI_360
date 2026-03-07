/**
 * Email Verification Template
 * Sent when user needs to verify their email
 */

import * as React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import EmailLayout from '../base/layout';
import Button from '../components/button';

interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export default function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Xác minh địa chỉ email của bạn">
      <Section>
        <Heading style={h1}>Xác minh địa chỉ email ✉️</Heading>
        
        <Text style={text}>
          Xin chào <strong>{name}</strong>,
        </Text>

        <Text style={text}>
          Để hoàn tất đăng ký tài khoản Wayfinder AI, vui lòng xác minh địa chỉ
          email của bạn bằng cách nhấn vào nút bên dưới:
        </Text>

        <Button href={verifyUrl}>Xác minh email ngay</Button>

        <Text style={textSmall}>
          Link xác minh này sẽ hết hạn sau <strong>24 giờ</strong>.
        </Text>

        <Text style={text}>
          Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
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

const textSmall = {
  ...text,
  fontSize: '14px',
  color: '#6b7280',
  fontStyle: 'italic' as const,
};

const signature = {
  ...text,
  marginTop: '32px',
};

