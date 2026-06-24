/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; ticketNumber?: string; reply?: string }

const Email = (p: Props) => (
  <Layout
    preview={'সাপোর্ট টিকেটে নতুন উত্তর'}
    title={'টিকেটে নতুন উত্তর 💬'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার টিকেটে আমাদের টিম উত্তর দিয়েছে।`}
    paragraphs={[p.reply ? `"${p.reply}"` : '']}
    rows={[['টিকেট নম্বর', p.ticketNumber]]}
    ctaLabel={'উত্তর দেখুন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="blue"
  />
)

export const template = {
  component: Email,
  subject: (d) => `টিকেট #${d.ticketNumber ?? ''} এ নতুন উত্তর`,
  displayName: 'Support Ticket Replied',
  previewData: {"name":"করিম","ticketNumber":"T-1024","reply":"আপনার সমস্যাটি সমাধান হয়েছে।"},
} satisfies TemplateEntry
