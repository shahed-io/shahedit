/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; from?: string; preview?: string }

const Email = (p: Props) => (
  <Layout
    preview={'নতুন বার্তা এসেছে'}
    title={'নতুন বার্তা'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার জন্য একটি নতুন বার্তা এসেছে${p.from ? ` ${p.from} থেকে` : ''}।`}
    paragraphs={[p.preview ? `"${p.preview}"` : '']}
    
    ctaLabel={'বার্তা দেখুন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="blue"
  />
)

export const template = {
  component: Email,
  subject: (d) => `নতুন বার্তা${d.from ? ` — ${d.from}` : ''}`,
  displayName: 'নতুন বার্তা নোটিফিকেশন',
  previewData: {"name":"করিম","from":"অ্যাডমিন","preview":"আপনার প্রজেক্ট প্রস্তুত।"},
} satisfies TemplateEntry
