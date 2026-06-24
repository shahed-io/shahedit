/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; amount?: number | string; orderNumber?: string; reason?: string }

const Email = (p: Props) => (
  <Layout
    preview={'পেমেন্ট ব্যর্থ হয়েছে'}
    title={'পেমেন্ট ব্যর্থ ❌'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, দুঃখিত, আপনার পেমেন্ট সম্পন্ন করা যায়নি।`}
    paragraphs={[`কারণ: ${p.reason ?? 'অজানা'}`, 'অনুগ্রহ করে আবার চেষ্টা করুন অথবা ভিন্ন পেমেন্ট পদ্ধতি ব্যবহার করুন।']}
    rows={[['অর্ডার নম্বর', p.orderNumber], ['পরিমাণ', `৳ ${p.amount ?? '—'}`]]}
    ctaLabel={'আবার পেমেন্ট করুন'}
    ctaUrl={'https://shahedit.com/payment'}
    accent="red"
  />
)

export const template = {
  component: Email,
  subject: 'পেমেন্ট ব্যর্থ — Shahed IT',
  displayName: 'Payment Failed',
  previewData: {"name":"করিম","amount":15000,"orderNumber":"SI-1024","reason":"পর্যাপ্ত ব্যালেন্স নেই"},
} satisfies TemplateEntry
