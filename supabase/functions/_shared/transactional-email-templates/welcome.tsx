/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO = 'https://www.shahedit.com/__l5e/assets-v1/6da40b38-e1e3-4a8b-a91e-4bff75e2051d/shahed-it-existing-logo-transparent.png'

interface Props { name?: string }

const Email = ({ name }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Preview>Shahed IT-তে আপনাকে স্বাগতম!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Img src={LOGO} width="360" alt="Shahed IT" style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} /></Section>
        <Section style={card}>
          <Heading style={h1}>স্বাগতম{name ? `, ${name}` : ''} 👋</Heading>
          <Text style={text}>
            Shahed IT পরিবারে যোগ দেওয়ার জন্য আপনাকে অভিনন্দন। আপনার অ্যাকাউন্ট
            সফলভাবে তৈরি হয়েছে এবং এখন থেকে আপনি আমাদের সকল সার্ভিস, প্যাকেজ ও
            বিশেষ অফার সরাসরি ড্যাশবোর্ড থেকে ব্যবহার করতে পারবেন।
          </Text>
          <Text style={text}>
            শুরু করতে নিচের বাটন চাপ দিন। কোনো প্রশ্ন থাকলে আমাদের সাপোর্ট টিম
            সব সময় আপনার পাশে আছে।
          </Text>
          <Button href="https://shahedit.com/dashboard" style={button}>ড্যাশবোর্ডে যান</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>01820-060046 · info@shahedit.com · shahedit.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Shahed IT-তে আপনাকে স্বাগতম!',
  displayName: 'Welcome Email',
  previewData: { name: 'করিম' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Nirmala UI', 'Vrinda', 'Segoe UI', Arial, sans-serif", margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '12px 0 20px', textAlign: 'center' as const }
const card = { backgroundColor: '#faf7ff', border: '1px solid #ece5ff', borderRadius: '14px', padding: '28px 24px' }
const h1 = { fontSize: '22px', color: '#1a1325', margin: '0 0 14px', fontWeight: 700, lineHeight: '32px' }
const text = { fontSize: '15px', lineHeight: '26px', color: '#3f3a47', margin: '0 0 14px' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'inline-block', marginTop: '8px' }
const hr = { borderColor: '#eee', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0, lineHeight: '20px' }
