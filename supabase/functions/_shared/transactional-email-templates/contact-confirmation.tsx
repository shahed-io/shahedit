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
    <Head />
    <Preview>আপনার বার্তা পেয়েছি — Shahed IT</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>Shahed IT</Heading>
        </Section>
        <Section style={card}>
          <Heading style={h1}>ধন্যবাদ{name ? `, ${name}` : ''}!</Heading>
          <Text style={text}>
            আপনার বার্তা আমরা সফলভাবে পেয়েছি। আমাদের টিম শীঘ্রই (সাধারণত ২৪ ঘণ্টার মধ্যে) আপনার সাথে যোগাযোগ করবে।
          </Text>
          {message ? (
            <Section style={quote}>
              <Text style={quoteText}>"{message}"</Text>
            </Section>
          ) : null}
          <Text style={text}>
            জরুরি প্রয়োজনে কল করুন: <strong>01820-060046</strong> (সকাল ১০টা - রাত ১০টা)
          </Text>
          <Button href="https://shahedit.com" style={button}>আমাদের ওয়েবসাইট দেখুন</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Shahed IT · Sopura, Rajshahi, Bangladesh</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'আপনার বার্তা পেয়েছি — Shahed IT',
  displayName: 'Contact Form Confirmation',
  previewData: { name: 'Karim', message: 'আমি একটি website বানাতে চাই।' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '12px 0 20px', textAlign: 'center' as const }
const brand = { fontSize: '22px', fontWeight: 700, color: '#7c3aed', margin: 0, letterSpacing: '0.5px' }
const card = { backgroundColor: '#faf7ff', border: '1px solid #ece5ff', borderRadius: '14px', padding: '28px 24px' }
const h1 = { fontSize: '22px', color: '#1a1325', margin: '0 0 12px', fontWeight: 700 }
const text = { fontSize: '15px', lineHeight: '24px', color: '#444', margin: '0 0 14px' }
const quote = { borderLeft: '3px solid #a855f7', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '6px', margin: '14px 0' }
const quoteText = { fontSize: '14px', color: '#555', fontStyle: 'italic' as const, margin: 0 }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'inline-block', marginTop: '8px' }
const hr = { borderColor: '#eee', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0 }
