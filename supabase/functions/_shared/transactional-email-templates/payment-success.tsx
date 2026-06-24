/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; amount?: number | string; orderNumber?: string; method?: string }

const Email = (p: Props) => (
  <Layout
    preview={'পেমেন্ট সফল হয়েছে'}
    title={'পেমেন্ট সফল'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।`}
    paragraphs={[]}
    rows={[['অর্ডার নম্বর', p.orderNumber], ['পরিমাণ', `৳ ${p.amount ?? '—'}`], ['পেমেন্ট মাধ্যম', p.method]]}
    ctaLabel={'অর্ডার দেখুন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="green"
  />
)

export const template = {
  component: Email,
  subject: (d) => `পেমেন্ট সফল — ৳ ${d.amount ?? ''}`,
  displayName: 'পেমেন্ট সফল',
  previewData: {"name":"করিম","amount":15000,"orderNumber":"SI-1024","method":"বিকাশ"},
} satisfies TemplateEntry
