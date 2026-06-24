/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; invoiceNumber?: string; amount?: number | string; dueDate?: string; invoiceUrl?: string }

const Email = (p: Props) => (
  <Layout
    preview={'আপনার ইনভয়েস'}
    title={'নতুন ইনভয়েস'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার ইনভয়েস তৈরি হয়েছে।`}
    paragraphs={['বিস্তারিত নিচে দেখুন এবং নির্ধারিত সময়ের মধ্যে পেমেন্ট সম্পন্ন করুন।']}
    rows={[['ইনভয়েস নম্বর', p.invoiceNumber], ['পরিমাণ', `৳ ${p.amount ?? '—'}`], ['শেষ তারিখ', p.dueDate]]}
    ctaLabel={'ইনভয়েস দেখুন'}
    ctaUrl={p.invoiceUrl ?? 'https://shahedit.com/dashboard'}
    accent="blue"
  />
)

export const template = {
  component: Email,
  subject: (d) => `ইনভয়েস ${d.invoiceNumber ?? ''} — Shahed IT`,
  displayName: 'Invoice Email',
  previewData: {"name":"করিম","invoiceNumber":"INV-2026-0042","amount":15000,"dueDate":"২০২৬-০৬-২০"},
} satisfies TemplateEntry
