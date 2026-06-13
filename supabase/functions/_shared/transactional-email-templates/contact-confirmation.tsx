/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  message?: string
}

const Email = ({ name, message }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Preview>আপনার বার্তা আমরা পেয়েছি — Shahed IT</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>Shahed IT</Heading>
        </Section>
        <Section style={card}>
          <Heading style={h1}>ধন্যবাদ{name ? `, ${name}` : ''}!</Heading>
          <Text style={text}>
            আপনার পাঠানো বার্তাটি আমরা সফলভাবে পেয়েছি। আমাদের সাপোর্ট টিম যাচাই করে সাধারণত
            ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবে।
          </Text>
          {message ? (
            <Section style={quote}>
              <Text style={quoteLabel}>আপনার বার্তা</Text>
              <Text style={quoteText}>"{message}"</Text>
            </Section>
          ) : null}
          <Text style={text}>
            জরুরি প্রয়োজনে সরাসরি কল করুন <strong>01820-060046</strong> নম্বরে
            (সকাল ১০টা থেকে রাত ১০টা পর্যন্ত)।
          </Text>
          <Button href="https://shahedit.com" style={button}>আমাদের ওয়েবসাইট দেখুন</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Shahed IT · সপুরা, রাজশাহী, বাংলাদেশ</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'আপনার বার্তা আমরা পেয়েছি — Shahed IT',
  displayName: 'Contact Form Confirmation',
  previewData: { name: 'করিম', message: 'আমি একটি প্রফেশনাল ওয়েবসাইট তৈরি করতে চাই।' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Hind Siliguri','Noto Sans Bengali',Inter,Arial,sans-serif", margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '12px 0 20px', textAlign: 'center' as const }
const brand = { fontSize: '24px', fontWeight: 700, color: '#7c3aed', margin: 0, letterSpacing: '0.5px' }
const card = { backgroundColor: '#faf7ff', border: '1px solid #ece5ff', borderRadius: '14px', padding: '28px 24px' }
const h1 = { fontSize: '22px', color: '#1a1325', margin: '0 0 14px', fontWeight: 700, lineHeight: '32px' }
const text = { fontSize: '15px', lineHeight: '26px', color: '#3f3a47', margin: '0 0 14px' }
const quote = { borderLeft: '3px solid #a855f7', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', margin: '16px 0' }
const quoteLabel = { fontSize: '12px', color: '#888', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const quoteText = { fontSize: '14px', lineHeight: '24px', color: '#555', fontStyle: 'italic' as const, margin: 0 }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'inline-block', marginTop: '8px' }
const hr = { borderColor: '#eee', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0, lineHeight: '20px' }
