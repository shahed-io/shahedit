/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'

const BRAND = {
  name: 'Shahed IT',
  tagline: 'Smart IT Solutions',
  logoUrl:
    'https://www.shahedit.com/__l5e/assets-v1/4139358d-78cb-41df-a58a-67274b79b3af/shahed-it-compact-logo-transparent.png',
}

const BENGALI_FONT_CSS = `@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolLudA.ttf) format('truetype')}@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:600;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsldMudA.ttf) format('truetype')}@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:700;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6Kmsm5MudA.ttf) format('truetype')}@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:800;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsglMudA.ttf) format('truetype')}`


export interface LayoutProps {
  preview: string
  title: string
  intro?: string
  paragraphs?: string[]
  rows?: Array<[string, string | number | undefined]>
  ctaLabel?: string
  ctaUrl?: string
  accent?: 'purple' | 'green' | 'red' | 'amber' | 'blue'
}

const ACCENTS = {
  purple: '#7c3aed',
  green: '#16a34a',
  red: '#dc2626',
  amber: '#d97706',
  blue: '#2563eb',
}

export const Layout = ({
  preview, title, intro, paragraphs = [], rows, ctaLabel, ctaUrl, accent = 'purple',
}: LayoutProps) => {
  const color = ACCENTS[accent]
  return (
    <Html lang="bn" dir="ltr" translate="no">
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="google" content="notranslate" />
        <style>{BENGALI_FONT_CSS}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main} className="notranslate">
        <Container style={container}>
          <Section style={brandBar}>
            <Img
              src={BRAND.logoUrl}
              alt={BRAND.name}
              width={220}
              style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
            />
          </Section>




          <Section style={{ ...card, borderColor: color + '33' }}>
            <Heading style={h1}>{title}</Heading>
            {intro ? <Text style={text}>{intro}</Text> : null}
            {paragraphs.map((p, i) => (
              <Text key={i} style={text}>{p}</Text>
            ))}
            {rows && rows.length > 0 ? (
              <Section style={box}>
                {rows.map(([k, v], i) => (
                  <Text key={i} style={rowStyle}>
                    <span style={lbl}>{k}</span>
                    <span style={val}>{v ?? '—'}</span>
                  </Text>
                ))}
              </Section>
            ) : null}
            {ctaLabel && ctaUrl ? (
              <Button href={ctaUrl} style={{ ...button, backgroundColor: color }}>{ctaLabel}</Button>
            ) : null}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>01820-060046 · info@shahedit.com · shahedit.com</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#eeeaf7', fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Nirmala UI', 'Vrinda', 'Segoe UI', Arial, sans-serif", margin: 0, padding: '24px 0' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const header = { padding: '12px 0 18px', textAlign: 'center' as const }
const brandBar = { background: '#ffffff', borderRadius: '16px', padding: '20px 16px', textAlign: 'center' as const, margin: '0 0 14px', boxShadow: '0 2px 12px rgba(120,60,200,0.06)' }


const card = { backgroundColor: '#faf7ff', border: '1px solid', borderRadius: '14px', padding: '26px 22px' }
const h1 = { fontSize: '20px', color: '#1a1325', margin: '0 0 12px', fontWeight: 700 }
const text = { fontSize: '15px', lineHeight: '24px', color: '#444', margin: '0 0 12px' }
const box = { backgroundColor: '#ffffff', borderRadius: '10px', padding: '10px 14px', margin: '12px 0' }
const rowStyle = { fontSize: '14px', margin: '6px 0', color: '#1a1325', display: 'block' }
const lbl = { color: '#888', display: 'inline-block', width: '42%' }
const val = { color: '#1a1325', fontWeight: 600 }
const button = { color: '#ffffff', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'inline-block', marginTop: '8px' }
const hr = { borderColor: '#eee', margin: '22px 0 12px' }
const footer = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0 }
