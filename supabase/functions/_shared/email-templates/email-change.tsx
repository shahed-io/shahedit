/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'

interface Props { siteName: string; oldEmail: string; email: string; newEmail: string; confirmationUrl: string }

const LOGO = 'https://www.shahedit.com/__l5e/assets-v1/6da40b38-e1e3-4a8b-a91e-4bff75e2051d/shahed-it-existing-logo-transparent.png'

export const EmailChangeEmail = ({ siteName, oldEmail, newEmail, confirmationUrl }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </Head>
    <Preview>{siteName}-এ ইমেইল পরিবর্তন নিশ্চিত করুন</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Img src={LOGO} width="360" alt="Shahed IT" style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} />
        </Section>
        <Section style={card}>
          <Heading style={h1}>ইমেইল পরিবর্তন নিশ্চিত করুন</Heading>
          <Text style={text}>
            আপনি {siteName}-এ আপনার ইমেইল{' '}
            <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link>{' '}থেকে{' '}
             <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>-এ পরিবর্তনের অনুরোধ করেছেন।
          </Text>
          <Text style={text}>পরিবর্তনটি নিশ্চিত করতে নিচের বাটন চাপ দিন:</Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button style={button} href={confirmationUrl}>ইমেইল পরিবর্তন নিশ্চিত করুন</Button>
          </Section>
          <Text style={muted}>আপনি যদি এই পরিবর্তন না করে থাকেন, অনুগ্রহ করে দ্রুত আপনার অ্যাকাউন্ট সুরক্ষিত করুন।</Text>
          <Hr style={hr} />
          <Text style={footer}>
                        📞 01820-060046 · ✉ info@shahedit.com · 🌐 shahedit.com
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#eeeaf7', fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Nirmala UI', 'Vrinda', 'Segoe UI', Arial, sans-serif", padding: '24px 0' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const brandBar = { background: '#ffffff', borderRadius: '16px', padding: '20px 16px', textAlign: 'center' as const, margin: '0 0 14px', boxShadow: '0 2px 12px rgba(120,60,200,0.06)' }
const brandText = { fontSize: '18px', fontWeight: 800, color: '#3b1e6e', margin: '0 0 0 10px', letterSpacing: '0.5px' }
const card = { background: '#ffffff', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 4px 24px rgba(120,60,200,0.08)' }
const h1 = { fontSize: '22px', fontWeight: 800 as const, color: '#1a0f3a', margin: '0 0 14px' }
const text = { fontSize: '15px', color: '#3f3a52', lineHeight: '1.7', margin: '0 0 8px' }
const muted = { fontSize: '13px', color: '#7a7390', lineHeight: '1.6', margin: '4px 0 0' }
const link = { color: '#a855f7', textDecoration: 'underline' }
const button = { background: 'linear-gradient(135deg,#a855f7,#d946ef)', color: '#ffffff', fontSize: '15px', fontWeight: 700, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#ece6f5', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#8a83a0', lineHeight: '1.7', margin: 0, textAlign: 'center' as const }
