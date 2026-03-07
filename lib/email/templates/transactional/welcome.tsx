/**
 * Welcome Email Template
 * Sent when user registers
 */

import * as React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import EmailLayout from '../base/layout';
import Button from '../components/button';

interface WelcomeEmailProps {
  name: string;
  verifyUrl: string;
}

export default function WelcomeEmail({ name, verifyUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Chào mừng ${name} đến với Wayfinder AI!`}>
      <Section>
        <Heading style={h1}>Chào mừng đến với Wayfinder AI! 👋</Heading>
        
        <Text style={text}>
          Xin chào <strong>{name}</strong>,
        </Text>

        <Text style={text}>
          Cảm ơn bạn đã đăng ký tài khoản Wayfinder AI! Chúng tôi rất vui khi bạn
          tham gia cộng đồng khám phá Việt Nam.
        </Text>

        <Text style={text}>
          Để bắt đầu, hãy xác minh địa chỉ email của bạn:
        </Text>

        <Button href={verifyUrl}>Xác minh email</Button>

        <Text style={text}>
          <strong>Bạn có thể làm gì với Wayfinder AI?</strong>
        </Text>

        <Text style={listText}>
          ✅ Khám phá hàng trăm địa điểm du lịch Việt Nam
          <br />
          ✅ Đọc và viết đánh giá chân thực
          <br />
          ✅ Theo dõi người dùng khác và xây dựng hồ sơ
          <br />
          ✅ Nhận gợi ý cá nhân hóa dựa trên sở thích
          <br />
          ✅ Tìm kiếm thông minh với bộ lọc đa dạng
        </Text>

        <Text style={text}>
          Nếu bạn cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi qua email
          support@wayfinder.ai
        </Text>

        <Text style={text}>
          Chúc bạn có những chuyến đi tuyệt vời! 🌏
        </Text>

        <Text style={signature}>
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

const listText = {
  ...text,
  paddingLeft: '16px',
};

const signature = {
  ...text,
  marginTop: '32px',
};

