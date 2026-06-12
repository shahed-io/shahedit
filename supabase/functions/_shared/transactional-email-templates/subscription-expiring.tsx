/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; planName?: string; expiresAt?: string; daysLeft?: number }

const Email = (p: Props) => (
  <Layout
    preview={'সাবস্ক্রিপশন মেয়াদ শেষ হচ্ছে শীঘ্রই'}
    title={'সাবস্ক্রিপশন শীঘ্রই শেষ হচ্ছে ⏰'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার সাবস্ক্রিপশন আর ${p.daysLeft ?? 'কয়েক'} দিনের মধ্যে শেষ হবে।`}
    paragraphs={['সেবা চালু রাখতে এখনই renew করুন।']}
    rows={[['Plan', p.planName], ['Expires', p.expiresAt]]}
    ctaLabel={'Renew করুন'}
    ctaUrl={'https://shahedit.com/pricing'}
    accent="amber"
  />
)

export const template = {
  component: Email,
  subject: 'আপনার সাবস্ক্রিপশন শীঘ্রই শেষ হচ্ছে',
  displayName: 'Subscription Expiring',
  previewData: {"name":"Karim","planName":"Business Pro","expiresAt":"২০২৬-০৬-২০","daysLeft":7},
} satisfies TemplateEntry
