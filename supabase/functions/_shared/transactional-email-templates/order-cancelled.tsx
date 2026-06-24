/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; orderNumber?: string; reason?: string }

const Email = (p: Props) => (
  <Layout
    preview={'অর্ডার বাতিল হয়েছে'}
    title={'অর্ডার বাতিল হয়েছে'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার অর্ডারটি বাতিল করা হয়েছে।`}
    paragraphs={[`কারণ: ${p.reason ?? 'উল্লেখ করা হয়নি'}`]}
    rows={[['অর্ডার নম্বর', p.orderNumber]]}
    ctaLabel={'যোগাযোগ করুন'}
    ctaUrl={'https://shahedit.com/contact'}
    accent="red"
  />
)

export const template = {
  component: Email,
  subject: (d) => `অর্ডার বাতিল — ${d.orderNumber ?? ''}`,
  displayName: 'অর্ডার বাতিল',
  previewData: {"name":"করিম","orderNumber":"SI-1024","reason":"গ্রাহকের অনুরোধ"},
} satisfies TemplateEntry
