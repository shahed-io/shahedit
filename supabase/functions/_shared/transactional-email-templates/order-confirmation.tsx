/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr, Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  orderNumber?: string
  productTitle?: string
  amount?: number | string
  paymentMethod?: string
}

const Email = ({ name, orderNumber, productTitle, amount, paymentMethod }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head />
    <Preview>অর্ডার নিশ্চিত হয়েছে — {orderNumber ?? ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>Shahed IT</Heading>
        </Section>
        <Section style={card}>
          <Heading style={h1}>অর্ডার নিশ্চিত হয়েছে 🎉</Heading>
          <Text style={text}>প্রিয় {name ?? 'গ্রাহক'}, আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।</Text>
          <Section style={box}>
            <Row><Column style={lbl}>Order #</Column><Column style={val}>{orderNumber ?? '—'}</Column></Row>
            <Row><Column style={lbl}>Service</Column><Column style={val}>{productTitle ?? '—'}</Column></Row>
            <Row><Column style={lbl}>Amount</Column><Column style={val}>৳ {amount ?? '—'}</Column></Row>
            <Row><Column style={lbl}>Payment</Column><Column style={val}>{paymentMethod ?? '—'}</Column></Row>
          </Section>
          <Text style={text}>পেমেন্ট ভেরিফাই হওয়ার পর আমাদের টিম কাজ শুরু করবে। আপডেট দেখুন ড্যাশবোর্ডে।</Text>
          <Button href="https://shahedit.com/dashboard" style={button}>Dashboard দেখুন</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>সাহায্য দরকার? কল: 01820-060046</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `অর্ডার নিশ্চিত — ${d.orderNumber ?? 'Shahed IT'}`,
  displayName: 'Order Confirmation',
  previewData: { name: 'Karim', orderNumber: 'SI-1024', productTitle: 'Business Website', amount: 15000, paymentMethod: 'bKash' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '12px 0 20px', textAlign: 'center' as const }
const brand = { fontSize: '22px', fontWeight: 700, color: '#7c3aed', margin: 0 }
const card = { backgroundColor: '#faf7ff', border: '1px solid #ece5ff', borderRadius: '14px', padding: '28px 24px' }
const h1 = { fontSize: '22px', color: '#1a1325', margin: '0 0 12px', fontWeight: 700 }
const text = { fontSize: '15px', lineHeight: '24px', color: '#444', margin: '0 0 14px' }
const box = { backgroundColor: '#ffffff', borderRadius: '10px', padding: '14px 16px', margin: '12px 0' }
const lbl = { fontSize: '13px', color: '#888', padding: '6px 0', width: '40%' }
const val = { fontSize: '14px', color: '#1a1325', fontWeight: 600, padding: '6px 0' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'inline-block', marginTop: '8px' }
const hr = { borderColor: '#eee', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0 }
