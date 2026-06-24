/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; amount?: number | string; orderNumber?: string; method?: string }

const Email = (p: Props) => (
  <Layout
    preview={'রিফান্ড প্রসেস হয়েছে'}
    title={'রিফান্ড সম্পন্ন'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার রিফান্ড সফলভাবে প্রসেস করা হয়েছে।`}
    paragraphs={['৩-৭ কর্মদিবসের মধ্যে টাকা পৌঁছাবে।']}
    rows={[['অর্ডার নম্বর', p.orderNumber], ['পরিমাণ', `৳ ${p.amount ?? '—'}`], ['পেমেন্ট মাধ্যম', p.method]]}
    
    
    accent="green"
  />
)

export const template = {
  component: Email,
  subject: 'রিফান্ড সম্পন্ন হয়েছে — Shahed IT',
  displayName: 'Refund Processed',
  previewData: {"name":"করিম","amount":15000,"orderNumber":"SI-1024","method":"বিকাশ"},
} satisfies TemplateEntry
