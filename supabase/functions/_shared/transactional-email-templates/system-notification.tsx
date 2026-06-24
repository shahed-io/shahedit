/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; heading?: string; body?: string; ctaLabel?: string; ctaUrl?: string }

const Email = (p: Props) => (
  <Layout
    preview={'সিস্টেম নোটিফিকেশন'}
    title={p.heading ?? 'সিস্টেম নোটিফিকেশন'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'},`}
    paragraphs={[p.body ?? 'আপনার একাউন্ট সম্পর্কিত একটি নোটিফিকেশন আছে।']}
    
    ctaLabel={p.ctaLabel ?? 'বিস্তারিত দেখুন'}
    ctaUrl={p.ctaUrl ?? 'https://shahedit.com/dashboard'}
    accent="purple"
  />
)

export const template = {
  component: Email,
    subject: (d) => d.heading ?? 'সিস্টেম নোটিফিকেশন — Shahed IT',
  displayName: 'সিস্টেম নোটিফিকেশন',
  previewData: {"name":"করিম","heading":"একাউন্ট আপডেট","body":"আপনার প্রোফাইল আপডেট হয়েছে।"},
} satisfies TemplateEntry
