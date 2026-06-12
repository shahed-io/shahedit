/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; ticketNumber?: string; subject?: string }

const Email = (p: Props) => (
  <Layout
    preview={'সাপোর্ট টিকেট তৈরি হয়েছে'}
    title={'সাপোর্ট টিকেট তৈরি হয়েছে'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার টিকেট আমরা পেয়েছি। শীঘ্রই উত্তর দেব।`}
    paragraphs={[]}
    rows={[['Ticket #', p.ticketNumber], ['Subject', p.subject]]}
    ctaLabel={'টিকেট দেখুন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="purple"
  />
)

export const template = {
  component: Email,
  subject: (d) => `টিকেট #${d.ticketNumber ?? ''} তৈরি হয়েছে`,
  displayName: 'Support Ticket Created',
  previewData: {"name":"Karim","ticketNumber":"T-1024","subject":"Login সমস্যা"},
} satisfies TemplateEntry
