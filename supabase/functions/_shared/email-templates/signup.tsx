/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'

interface Props { siteName: string; confirmationUrl: string }

const LOGO = 'https://www.shahedit.com/__l5e/assets-v1/ff0eebd6-2743-4605-9d95-c9984684e8d7/shahed-it-mark.png'

export const SignupEmail = ({ siteName, confirmationUrl }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head />
    <Preview>{siteName}-এ আপনার ইমেইল নিশ্চিত করুন</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Img src={LOGO} width="44" height="44" alt="SHAHED IT" style={{ borderRadius: 10 }} />
          <Text style={brandText}>SHAHED IT</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>স্বাগতম! ইমেইল নিশ্চিত করুন</Heading>
          <Text style={text}>
            {siteName}-এ অ্যাকাউন্ট খোলার জন্য ধন্যবাদ। নিচের বাটনে ক্লিক করে আপনার ইমেইল ঠিকানা যাচাই করুন।
          </Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button style={button} href={confirmationUrl}>ইমেইল নিশ্চিত করুন</Button>
          </Section>
          <Text style={muted}>
            আপনি যদি এই অ্যাকাউন্ট তৈরি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            SHAHED IT · Sopura, Rajshahi, Bangladesh<br />
            📞 01820-060046 · ✉ info@shahedit.com · 🌐 shahedit.com
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#f4f1fb', fontFamily: "'Segoe UI', Arial, sans-serif", padding: '24px 0' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const brandBar = { display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 4px 18px' }
const brandText = { fontSize: '18px', fontWeight: 800, color: '#3b1e6e', margin: '0 0 0 10px', letterSpacing: '0.5px' }
const card = { background: '#ffffff', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 4px 24px rgba(120,60,200,0.08)' }
const h1 = { fontSize: '22px', fontWeight: 800 as const, color: '#1a0f3a', margin: '0 0 14px' }
const text = { fontSize: '15px', color: '#3f3a52', lineHeight: '1.7', margin: '0 0 8px' }
const muted = { fontSize: '13px', color: '#7a7390', lineHeight: '1.6', margin: '4px 0 0' }
const button = { background: 'linear-gradient(135deg,#a855f7,#d946ef)', color: '#ffffff', fontSize: '15px', fontWeight: 700, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#ece6f5', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#8a83a0', lineHeight: '1.7', margin: 0, textAlign: 'center' as const }
