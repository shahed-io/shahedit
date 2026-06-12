/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; alertType?: string; details?: string }

const Email = (p: Props) => (
  <Layout
    preview={'নিরাপত্তা সতর্কতা'}
    title={'⚠️ Security Alert'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার অ্যাকাউন্টে একটি নিরাপত্তা সংক্রান্ত ঘটনা সনাক্ত হয়েছে।`}
    paragraphs={[`Type: ${p.alertType ?? 'Suspicious activity'}`, p.details ?? 'অনুগ্রহ করে আপনার পাসওয়ার্ড পরিবর্তন করুন এবং 2FA চালু করুন।']}
    
    ctaLabel={'এখনই Account secure করুন'}
    ctaUrl={'https://shahedit.com/profile'}
    accent="red"
  />
)

export const template = {
  component: Email,
  subject: '⚠️ Security Alert — Shahed IT',
  displayName: 'Security Alert',
  previewData: {"name":"Karim","alertType":"Unusual login","details":"নতুন country থেকে লগইন চেষ্টা।"},
} satisfies TemplateEntry
