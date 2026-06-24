/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'

interface Props { token: string }

const LOGO = 'https://www.shahedit.com/__l5e/assets-v1/35029b9f-76c9-482d-a1a2-afb2c9dffbb1/shahed-it-email-logo-transparent.png'

export const ReauthenticationEmail = ({ token }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </Head>
    <Preview>আপনার ভেরিফিকেশন কোড — Shahed IT</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Img src={LOGO} width="220" height="70" alt="Shahed IT" style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} />
        </Section>
        <Section style={card}>
          <Heading style={h1}>পরিচয় নিশ্চিতকরণ</Heading>
          <Text style={text}>নিচের কোডটি ব্যবহার করে আপনার পরিচয় নিশ্চিত করুন:</Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={muted}>এই কোডটি কিছুক্ষণের মধ্যে মেয়াদোত্তীর্ণ হবে। আপনি যদি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</Text>
          <Hr style={hr} />
          <Text style={footer}>
                        📞 01820-060046 · ✉ info@shahedit.com · 🌐 shahedit.com
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#eeeaf7', fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Nirmala UI', 'Vrinda', 'Segoe UI', Arial, sans-serif", padding: '24px 0' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const brandBar = { background: '#ffffff', borderRadius: '16px', padding: '20px 16px', textAlign: 'center' as const, margin: '0 0 14px', boxShadow: '0 2px 12px rgba(120,60,200,0.06)' }
const brandText = { fontSize: '18px', fontWeight: 800, color: '#3b1e6e', margin: '0 0 0 10px', letterSpacing: '0.5px' }
const card = { background: '#ffffff', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 4px 24px rgba(120,60,200,0.08)' }
const h1 = { fontSize: '22px', fontWeight: 800 as const, color: '#1a0f3a', margin: '0 0 14px' }
const text = { fontSize: '15px', color: '#3f3a52', lineHeight: '1.7', margin: '0 0 8px' }
const muted = { fontSize: '13px', color: '#7a7390', lineHeight: '1.6', margin: '4px 0 0' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '32px', fontWeight: 800 as const, color: '#a855f7', letterSpacing: '8px', background: '#f4ecff', borderRadius: '12px', padding: '16px 24px', display: 'inline-block', margin: 0 }
const hr = { borderColor: '#ece6f5', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#8a83a0', lineHeight: '1.7', margin: 0, textAlign: 'center' as const }
