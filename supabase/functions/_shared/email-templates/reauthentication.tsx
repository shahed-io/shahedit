/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'

interface Props { token: string }

const LOGO = 'https://www.shahedit.com/__l5e/assets-v1/dc40713e-4534-4663-8291-cbe66f17d60c/shahed-it-mark.png'
const BENGALI_FONT_FAMILY = "'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Nirmala UI', 'Vrinda', 'Bangla MN', 'Bangla Sangam MN', Arial, sans-serif"
const BENGALI_FONT_CSS = `@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolLudA.ttf) format('truetype')}@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:600;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsldMudA.ttf) format('truetype')}@font-face{font-family:'Noto Sans Bengali';font-style:normal;font-weight:700;src:url(https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6Kmsm5MudA.ttf) format('truetype')}html,body,table,td,p,a,span,div,h1,h2,h3{font-family:${BENGALI_FONT_FAMILY}!important;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}body{word-break:normal;overflow-wrap:break-word}p,span,a,td,h1{unicode-bidi:plaintext}`

export const ReauthenticationEmail = ({ token }: Props) => (
  <Html lang="bn-BD" dir="ltr" translate="no">
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="google" content="notranslate" />
      <style>{BENGALI_FONT_CSS}</style>
    </Head>
    <Preview>আপনার যাচাই কোড — Shahed IT</Preview>
    <Body style={main} className="notranslate">
      <Container style={container}>
        <Section style={brandBar}>
          <Img src={LOGO} width="220" alt="Shahed IT" style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} />
        </Section>
        <Section style={card}>
          <Heading style={h1}>পরিচয় নিশ্চিতকরণ</Heading>
          <Text style={text}>নিচের কোডটি ব্যাবহার করে আপনার পরিচয় নিশ্চিত করুন:</Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={muted}>এই কোডটি কিছুক্ষণের মধ্যে মেয়াদ শেষ হবে। আপনি যদি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</Text>
          <Hr style={hr} />
          <Text style={footer}>
                        ফোন: 01820-060046 · info@shahedit.com · shahedit.com
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#eeeaf7', fontFamily: BENGALI_FONT_FAMILY, padding: '24px 0', wordBreak: 'normal' as const, overflowWrap: 'break-word' as const }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const brandBar = { background: '#ffffff', borderRadius: '16px', padding: '20px 16px', textAlign: 'center' as const, margin: '0 0 14px', boxShadow: '0 2px 12px rgba(120,60,200,0.06)' }
const brandText = { fontSize: '18px', fontWeight: 800, color: '#3b1e6e', margin: '0 0 0 10px', letterSpacing: '0.5px' }
const card = { background: '#ffffff', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 4px 24px rgba(120,60,200,0.08)' }
const h1 = { fontSize: '22px', fontWeight: 800 as const, color: '#1a0f3a', margin: '0 0 14px', lineHeight: '32px', fontFamily: BENGALI_FONT_FAMILY }
const text = { fontSize: '15px', color: '#3f3a52', lineHeight: '26px', margin: '0 0 8px', fontFamily: BENGALI_FONT_FAMILY, wordBreak: 'normal' as const, overflowWrap: 'break-word' as const }
const muted = { fontSize: '13px', color: '#7a7390', lineHeight: '23px', margin: '4px 0 0', fontFamily: BENGALI_FONT_FAMILY }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '32px', fontWeight: 800 as const, color: '#a855f7', letterSpacing: '8px', background: '#f4ecff', borderRadius: '12px', padding: '16px 24px', display: 'inline-block', margin: 0 }
const hr = { borderColor: '#ece6f5', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#8a83a0', lineHeight: '20px', margin: 0, textAlign: 'center' as const, fontFamily: BENGALI_FONT_FAMILY }
