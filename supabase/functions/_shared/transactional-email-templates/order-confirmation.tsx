/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Button, Hr, Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO = 'https://www.shahedit.com/__l5e/assets-v1/35029b9f-76c9-482d-a1a2-afb2c9dffbb1/shahed-it-email-logo-transparent.png'

interface Props {
  name?: string
  orderNumber?: string
  productTitle?: string
  amount?: number | string
  paymentMethod?: string
}

const Email = ({ name, orderNumber, productTitle, amount, paymentMethod }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Preview>আপনার অর্ডার নিশ্চিত হয়েছে — {orderNumber ?? ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO} width="220" height="70" alt="Shahed IT" style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} />
        </Section>
        <Section style={card}>
          <Heading style={h1}>অর্ডার নিশ্চিত হয়েছে 🎉</Heading>
          <Text style={text}>
            প্রিয় {name ?? 'গ্রাহক'}, আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। নিচে আপনার
            অর্ডারের সংক্ষিপ্ত বিবরণ দেওয়া হলো।
          </Text>
          <Section style={box}>
            <Row><Column style={lbl}>অর্ডার নম্বর</Column><Column style={val}>{orderNumber ?? '—'}</Column></Row>
            <Row><Column style={lbl}>সার্ভিস</Column><Column style={val}>{productTitle ?? '—'}</Column></Row>
            <Row><Column style={lbl}>মোট মূল্য</Column><Column style={val}>৳ {amount ?? '—'}</Column></Row>
            <Row><Column style={lbl}>পেমেন্ট মাধ্যম</Column><Column style={val}>{paymentMethod ?? '—'}</Column></Row>
          </Section>
          <Text style={text}>
            পেমেন্ট যাচাই সম্পন্ন হলে আমাদের টিম দ্রুততম সময়ে কাজ শুরু করবে। আপনি যেকোনো সময়
            ড্যাশবোর্ড থেকে অর্ডারের সর্বশেষ আপডেট দেখতে পারবেন।
          </Text>
          <Button href="https://shahedit.com/dashboard" style={button}>ড্যাশবোর্ড দেখুন</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>সাহায্য প্রয়োজন? কল করুন <strong>01820-060046</strong></Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `অর্ডার নিশ্চিত — ${d.orderNumber ?? 'Shahed IT'}`,
  displayName: 'Order Confirmation',
  previewData: { name: 'করিম', orderNumber: 'SI-1024', productTitle: 'বিজনেস ওয়েবসাইট', amount: 15000, paymentMethod: 'bKash' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Nirmala UI', 'Vrinda', 'Segoe UI', Arial, sans-serif", margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '12px 0 20px', textAlign: 'center' as const }
const card = { backgroundColor: '#faf7ff', border: '1px solid #ece5ff', borderRadius: '14px', padding: '28px 24px' }
const h1 = { fontSize: '22px', color: '#1a1325', margin: '0 0 14px', fontWeight: 700, lineHeight: '32px' }
const text = { fontSize: '15px', lineHeight: '26px', color: '#3f3a47', margin: '0 0 14px' }
const box = { backgroundColor: '#ffffff', borderRadius: '10px', padding: '14px 16px', margin: '14px 0' }
const lbl = { fontSize: '13px', color: '#888', padding: '8px 0', width: '40%' }
const val = { fontSize: '14px', color: '#1a1325', fontWeight: 600, padding: '8px 0' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'inline-block', marginTop: '8px' }
const hr = { borderColor: '#eee', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0, lineHeight: '20px' }
