/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string }

const Email = ({ name }: Props) => (
  <Html lang="bn" dir="ltr">
    <Head />
    <Preview>Shahed IT - এ স্বাগতম!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Heading style={brand}>Shahed IT</Heading></Section>
        <Section style={card}>
          <Heading style={h1}>স্বাগতম{name ? `, ${name}` : ''} 👋</Heading>
          <Text style={text}>
            Shahed IT-তে আপনার অ্যাকাউন্ট তৈরি হয়েছে। আমাদের সব services, packages এবং offer ড্যাশবোর্ড থেকে দেখুন।
          </Text>
          <Button href="https://shahedit.com/dashboard" style={button}>শুরু করুন</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Shahed IT · Sopura, Rajshahi, Bangladesh</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Shahed IT - এ স্বাগতম!',
  displayName: 'Welcome Email',
  previewData: { name: 'Karim' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '12px 0 20px', textAlign: 'center' as const }
const brand = { fontSize: '22px', fontWeight: 700, color: '#7c3aed', margin: 0 }
const card = { backgroundColor: '#faf7ff', border: '1px solid #ece5ff', borderRadius: '14px', padding: '28px 24px' }
const h1 = { fontSize: '22px', color: '#1a1325', margin: '0 0 12px', fontWeight: 700 }
const text = { fontSize: '15px', lineHeight: '24px', color: '#444', margin: '0 0 14px' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'inline-block', marginTop: '8px' }
const hr = { borderColor: '#eee', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0 }
