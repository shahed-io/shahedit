/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'

const BRAND = {
  name: 'SHAHED IT',
  tagline: 'Smart IT Solutions',
  logoUrl:
    'https://www.shahedit.com/__l5e/assets-v1/ff0eebd6-2743-4605-9d95-c9984684e8d7/shahed-it-mark.png',
}


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
    <Html lang="bn" dir="ltr">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brandBar}>
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ verticalAlign: 'middle', paddingRight: '14px' }}>
                  <div style={logoCircle}>
                    <Img src={BRAND.logoUrl} alt={BRAND.name} width={36} height={36} style={{ display: 'block' }} />
                  </div>
                </td>
                <td style={{ verticalAlign: 'middle', textAlign: 'left' }}>
                  <div style={brand}>Shahed IT</div>
                  <div style={taglineWrap}>
                    <span style={taglineDash} />
                    <span style={tagline}>SHAHEDIT.COM</span>
                    <span style={taglineDash} />
                  </div>
                </td>
              </tr>
            </table>
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
          <Text style={footer}>Shahed IT · Sopura, Rajshahi · 01820-060046</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#ffffff', fontFamily: "'Hind Siliguri','Noto Sans Bengali',Inter,Arial,sans-serif", margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '12px 0 18px', textAlign: 'center' as const }
const brandBar = { background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1454 50%, #3d1a6b 100%)', borderRadius: '14px', padding: '18px 22px', textAlign: 'center' as const, margin: '0 0 18px' }
const logoCircle = { width: '52px', height: '52px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 25%, #a78bfa, #7c3aed 55%, #4c1d95)', padding: '8px', boxShadow: '0 4px 14px rgba(124,58,237,0.5)', display: 'inline-block', boxSizing: 'border-box' as const }
const brand = { fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '0.5px', color: '#f0abfc', lineHeight: 1 }
const taglineWrap = { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }
const taglineDash = { display: 'inline-block', width: '18px', height: '1px', background: 'rgba(196,181,253,0.5)' }
const tagline = { fontSize: '10px', color: '#c4b5fd', letterSpacing: '3px', fontWeight: 600, whiteSpace: 'nowrap' as const }


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
