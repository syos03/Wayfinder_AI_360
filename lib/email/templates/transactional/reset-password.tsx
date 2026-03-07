/**
 * Password Reset Email Template
 * Sent when user requests password reset
 */

import * as React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import EmailLayout from '../base/layout';
import Button from '../components/button';

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({
  name,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Đặt lại mật khẩu Wayfinder AI">
      <Section>
        <Heading style={h1}>Đặt lại mật khẩu 🔒</Heading>
        
        <Text style={text}>
          Xin chào <strong>{name}</strong>,
        </Text>

        <Text style={text}>
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Wayfinder AI
          của bạn.
        </Text>

        <Text style={text}>
          Nhấn vào nút bên dưới để tạo mật khẩu mới:
        </Text>

        <Button href={resetUrl}>Đặt lại mật khẩu</Button>

        <Text style={textSmall}>
          Link này sẽ hết hạn sau <strong>1 giờ</strong> vì lý do bảo mật.
        </Text>

        <Text style={warningText}>
          <strong>⚠️ Lưu ý bảo mật:</strong>
          <br />
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và
          tài khoản của bạn sẽ vẫn an toàn. Có thể ai đó đã nhập nhầm địa chỉ
          email của bạn.
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

const warningText = {
  ...text,
  backgroundColor: '#fef3c7',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
};

const signature = {
  ...text,
  marginTop: '32px',
};

