/**
 * Base Email Layout
 * Common layout for all emails with header and footer
 */

import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export default function EmailLayout({
  preview,
  children,
  unsubscribeUrl,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>🧭 Wayfinder AI</Heading>
            <Text style={tagline}>Smart Travel Planner for Vietnam</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Wayfinder AI - Khám phá Việt Nam một cách thông minh
            </Text>
            <Text style={footerText}>
              📧 Email: support@wayfinder.ai | 🌐 Web: wayfinder.ai
            </Text>
            {unsubscribeUrl && (
              <Text style={footerText}>
                <Link href={unsubscribeUrl} style={link}>
                  Hủy đăng ký nhận email
                </Link>
              </Text>
            )}
            <Text style={footerSmall}>
              © 2025 Wayfinder AI. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#3b82f6',
};

const logo = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const tagline = {
  color: '#e0e7ff',
  fontSize: '14px',
  margin: '8px 0 0',
  padding: '0',
};

const content = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 48px 20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
};

const footerSmall = {
  color: '#aab7c4',
  fontSize: '11px',
  margin: '16px 0 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

