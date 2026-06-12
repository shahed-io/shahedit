/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; planName?: string; expiresAt?: string }

const Email = (p: Props) => (
  <Layout
    preview={'সাবস্ক্রিপশন চালু হয়েছে'}
    title={'সাবস্ক্রিপশন চালু হয়েছে 🎉'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার সাবস্ক্রিপশন সফলভাবে activate হয়েছে।`}
    paragraphs={['ধন্যবাদ আমাদের সাথে থাকার জন্য।']}
    rows={[['Plan', p.planName], ['Expires', p.expiresAt]]}
    ctaLabel={'Dashboard দেখুন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="green"
  />
)

export const template = {
  component: Email,
  subject: (d) => `সাবস্ক্রিপশন চালু — ${d.planName ?? 'Shahed IT'}`,
  displayName: 'Subscription Activated',
  previewData: {"name":"Karim","planName":"Business Pro","expiresAt":"২০২৭-০৬-১২"},
} satisfies TemplateEntry
