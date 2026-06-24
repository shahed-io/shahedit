/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO = 'https://www.shahedit.com/__l5e/assets-v1/4139358d-78cb-41df-a58a-67274b79b3af/shahed-it-compact-logo-transparent.png'
const BENGALI_FONT_FAMILY = "'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Nirmala UI', 'Vrinda', 'Bangla MN', 'Bangla Sangam MN', Arial, sans-serif"
const BENGALI_FONT_CSS = `@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolLudA.ttf) format('truetype')}@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:600;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsldMudA.ttf) format('truetype')}@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:700;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6Kmsm5MudA.ttf) format('truetype')}html,body,table,td,p,a,span,div,h1,h2,h3{font-family:${BENGALI_FONT_FAMILY}!important;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}body{word-break:normal;overflow-wrap:break-word}p,span,a,td,h1{unicode-bidi:plaintext}`

interface Props {
  name?: string
  message?: string
}

const Email = ({ name, message }: Props) => (
  <Html lang="bn-BD" dir="ltr" translate="no">
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="google" content="notranslate" />
      <style>{BENGALI_FONT_CSS}</style>
    </Head>
    <Preview>আপনার বার্তা আমরা পেয়েছি — Shahed IT</Preview>
    <Body style={main} className="notranslate">
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO} width="220" alt="Shahed IT" style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} />
        </Section>
        <Section style={card}>
          <Heading style={h1}>ধন্যবাদ{name ? `, ${name}` : ''}!</Heading>
          <Text style={text}>
            আপনার পাঠানো বার্তাটি আমরা সফলভাবে পেয়েছি। আমাদের সাপোর্ট টিম যাচাই করে সাধারণত
            ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবে।
          </Text>
          {message ? (
            <Section style={quote}>
              <Text style={quoteLabel}>আপনার বার্তা</Text>
              <Text style={quoteText}>"{message}"</Text>
            </Section>
          ) : null}
          <Text style={text}>
            জরুরি প্রয়োজনে সরাসরি কল করুন <strong>01820-060046</strong> নম্বরে
            (সকাল ১০টা থেকে রাত ১০টা পর্যন্ত)।
          </Text>
          <Button href="https://shahedit.com" style={button}>আমাদের ওয়েবসাইট দেখুন</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>01820-060046 · info@shahedit.com · shahedit.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'আপনার বার্তা আমরা পেয়েছি — Shahed IT',
  displayName: 'যোগাযোগ ফর্ম কনফার্মেশন',
  previewData: { name: 'করিম', message: 'আমি একটি প্রফেশনাল ওয়েবসাইট তৈরি করতে চাই।' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: BENGALI_FONT_FAMILY, margin: 0, padding: 0, wordBreak: 'normal' as const, overflowWrap: 'break-word' as const }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '12px 0 20px', textAlign: 'center' as const }
const card = { backgroundColor: '#faf7ff', border: '1px solid #ece5ff', borderRadius: '14px', padding: '28px 24px' }
const h1 = { fontSize: '22px', color: '#1a1325', margin: '0 0 14px', fontWeight: 700, lineHeight: '32px', fontFamily: BENGALI_FONT_FAMILY }
const text = { fontSize: '15px', lineHeight: '26px', color: '#3f3a47', margin: '0 0 14px', fontFamily: BENGALI_FONT_FAMILY, wordBreak: 'normal' as const, overflowWrap: 'break-word' as const }
const quote = { borderLeft: '3px solid #a855f7', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', margin: '16px 0' }
const quoteLabel = { fontSize: '12px', color: '#888', margin: '0 0 4px', fontWeight: 600, fontFamily: BENGALI_FONT_FAMILY }
const quoteText = { fontSize: '14px', lineHeight: '24px', color: '#555', fontStyle: 'italic' as const, margin: 0, fontFamily: BENGALI_FONT_FAMILY }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'inline-block', marginTop: '8px', fontFamily: BENGALI_FONT_FAMILY }
const hr = { borderColor: '#eee', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0, lineHeight: '20px', fontFamily: BENGALI_FONT_FAMILY }
