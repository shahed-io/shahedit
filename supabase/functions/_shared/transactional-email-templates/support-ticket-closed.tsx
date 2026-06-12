/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; ticketNumber?: string }

const Email = (p: Props) => (
  <Layout
    preview={'সাপোর্ট টিকেট বন্ধ হয়েছে'}
    title={'টিকেট বন্ধ হয়েছে'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার টিকেট সমাধান হিসেবে চিহ্নিত করা হয়েছে।`}
    paragraphs={['যদি আবার সাহায্য দরকার হয়, নতুন টিকেট খুলুন।']}
    rows={[['Ticket #', p.ticketNumber]]}
    ctaLabel={'নতুন টিকেট'}
    ctaUrl={'https://shahedit.com/contact'}
    accent="purple"
  />
)

export const template = {
  component: Email,
  subject: (d) => `টিকেট #${d.ticketNumber ?? ''} বন্ধ হয়েছে`,
  displayName: 'Support Ticket Closed',
  previewData: {"name":"Karim","ticketNumber":"T-1024"},
} satisfies TemplateEntry
