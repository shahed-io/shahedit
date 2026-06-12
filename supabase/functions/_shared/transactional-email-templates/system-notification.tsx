/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; heading?: string; body?: string; ctaLabel?: string; ctaUrl?: string }

const Email = (p: Props) => (
  <Layout
    preview={'সিস্টেম নোটিফিকেশন'}
    title={p.heading ?? 'System Notification'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'},`}
    paragraphs={[p.body ?? 'আপনার অ্যাকাউন্ট সম্পর্কিত একটি নোটিফিকেশন আছে।']}
    
    ctaLabel={p.ctaLabel ?? 'বিস্তারিত দেখুন'}
    ctaUrl={p.ctaUrl ?? 'https://shahedit.com/dashboard'}
    accent="purple"
  />
)

export const template = {
  component: Email,
  subject: (d) => d.heading ?? 'System Notification — Shahed IT',
  displayName: 'System Notification',
  previewData: {"name":"Karim","heading":"Account update","body":"আপনার profile আপডেট হয়েছে।"},
} satisfies TemplateEntry
