/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; planName?: string; endsAt?: string }

const Email = (p: Props) => (
  <Layout
    preview={'সাবস্ক্রিপশন বাতিল হয়েছে'}
    title={'সাবস্ক্রিপশন বাতিল হয়েছে'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার সাবস্ক্রিপশন বাতিল করা হয়েছে।`}
    paragraphs={[`সেবা চলবে: ${p.endsAt ?? 'বর্তমান মেয়াদ পর্যন্ত'} পর্যন্ত।`, 'আবার কাজ করতে আপনার সাথে দেখা হবে আশা করি।']}
    rows={[['Plan', p.planName]]}
    ctaLabel={'আবার চালু করুন'}
    ctaUrl={'https://shahedit.com/pricing'}
    accent="amber"
  />
)

export const template = {
  component: Email,
  subject: 'সাবস্ক্রিপশন বাতিল হয়েছে — Shahed IT',
  displayName: 'Subscription Cancelled',
  previewData: {"name":"Karim","planName":"Business Pro","endsAt":"২০২৬-০৭-০১"},
} satisfies TemplateEntry
