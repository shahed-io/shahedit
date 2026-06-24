/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'

interface Props { siteName: string; siteUrl: string; confirmationUrl: string }

const LOGO = 'https://www.shahedit.com/__l5e/assets-v1/ff0eebd6-2743-4605-9d95-c9984684e8d7/shahed-it-mark.png'

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head />
    <Preview>{siteName}-এ আপনাকে আমন্ত্রণ জানানো হয়েছে</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Img src={LOGO} width="44" height="44" alt="SHAHED IT" style={{ borderRadius: 10 }} />
          <Text style={brandText}>SHAHED IT</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>আপনাকে আমন্ত্রণ জানানো হয়েছে</Heading>
          <Text style={text}>
            আপনাকে <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>-এ যোগ দেওয়ার জন্য আমন্ত্রণ জানানো হয়েছে। নিচের বাটনে ক্লিক করে আমন্ত্রণ গ্রহণ করুন এবং আপনার অ্যাকাউন্ট তৈরি করুন।
          </Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button style={button} href={confirmationUrl}>আমন্ত্রণ গ্রহণ করুন</Button>
          </Section>
          <Text style={muted}>আপনি যদি এই আমন্ত্রণ আশা না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</Text>
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

export default InviteEmail

const main = { backgroundColor: '#f4f1fb', fontFamily: "'Segoe UI', Arial, sans-serif", padding: '24px 0' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const brandBar = { display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 4px 18px' }
const brandText = { fontSize: '18px', fontWeight: 800, color: '#3b1e6e', margin: '0 0 0 10px', letterSpacing: '0.5px' }
const card = { background: '#ffffff', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 4px 24px rgba(120,60,200,0.08)' }
const h1 = { fontSize: '22px', fontWeight: 800 as const, color: '#1a0f3a', margin: '0 0 14px' }
const text = { fontSize: '15px', color: '#3f3a52', lineHeight: '1.7', margin: '0 0 8px' }
const muted = { fontSize: '13px', color: '#7a7390', lineHeight: '1.6', margin: '4px 0 0' }
const link = { color: '#a855f7', textDecoration: 'underline' }
const button = { background: 'linear-gradient(135deg,#a855f7,#d946ef)', color: '#ffffff', fontSize: '15px', fontWeight: 700, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#ece6f5', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#8a83a0', lineHeight: '1.7', margin: 0, textAlign: 'center' as const }
