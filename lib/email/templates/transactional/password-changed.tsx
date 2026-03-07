/**
 * Password Changed Notification
 * Sent after password is successfully changed
 */

import * as React from 'react';
import { Heading, Text, Section, Link } from '@react-email/components';
import EmailLayout from '../base/layout';

interface PasswordChangedEmailProps {
  name: string;
  changeDate: string;
  supportUrl: string;
}

export default function PasswordChangedEmail({
  name,
  changeDate,
  supportUrl,
}: PasswordChangedEmailProps) {
  return (
    <EmailLayout preview="Mật khẩu của bạn đã được thay đổi">
      <Section>
        <Heading style={h1}>Mật khẩu đã được thay đổi ✅</Heading>
        
        <Text style={text}>
          Xin chào <strong>{name}</strong>,
        </Text>

        <Text style={text}>
          Mật khẩu tài khoản Wayfinder AI của bạn đã được thay đổi thành công vào
          lúc <strong>{changeDate}</strong>.
        </Text>

        <Text style={successText}>
          ✅ Tài khoản của bạn hiện đang an toàn với mật khẩu mới.
        </Text>

        <Text style={warningText}>
          <strong>⚠️ Bạn không thực hiện thay đổi này?</strong>
          <br />
          Nếu bạn không thay đổi mật khẩu, tài khoản của bạn có thể đã bị xâm
          nhập. Vui lòng liên hệ với chúng tôi ngay lập tức qua{' '}
          <Link href={supportUrl} style={link}>
            support@wayfinder.ai
          </Link>
        </Text>

        <Text style={text}>
          <strong>Mẹo bảo mật:</strong>
          <br />
          • Sử dụng mật khẩu mạnh, dài ít nhất 8 ký tự
          <br />
          • Không chia sẻ mật khẩu với bất kỳ ai
          <br />
          • Thay đổi mật khẩu định kỳ
          <br />• Không sử dụng lại mật khẩu từ các tài khoản khác
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

const successText = {
  ...text,
  backgroundColor: '#d1fae5',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #10b981',
  fontWeight: '500' as const,
};

const warningText = {
  ...text,
  backgroundColor: '#fee2e2',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #ef4444',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const signature = {
  ...text,
  marginTop: '32px',
};

