/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; amount?: number | string; orderNumber?: string; method?: string }

const Email = (p: Props) => (
  <Layout
    preview={'পেমেন্ট সফল হয়েছে'}
    title={'পেমেন্ট সফল ✅'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।`}
    paragraphs={[]}
    rows={[['Order #', p.orderNumber], ['Amount', `৳ ${p.amount ?? '—'}`], ['Method', p.method]]}
    ctaLabel={'Order দেখুন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="green"
  />
)

export const template = {
  component: Email,
  subject: (d) => `পেমেন্ট সফল — ৳ ${d.amount ?? ''}`,
  displayName: 'Payment Success',
  previewData: {"name":"Karim","amount":15000,"orderNumber":"SI-1024","method":"bKash"},
} satisfies TemplateEntry
