/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; alertType?: string; details?: string }

const Email = (p: Props) => (
  <Layout
    preview={'নিরাপত্তা সতর্কতা'}
    title={'নিরাপত্তা সতর্কতা'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার অ্যাকাউন্টে একটি নিরাপত্তা সংক্রান্ত ঘটনা সনাক্ত হয়েছে।`}
    paragraphs={[`ধরন: ${p.alertType ?? 'সন্দেহজনক কার্যকলাপ'}`, p.details ?? 'অনুগ্রহ করে আপনার পাসওয়ার্ড পরিবর্তন করুন এবং 2FA চালু করুন।']}
    
    ctaLabel={'এখনই অ্যাকাউন্ট সুরক্ষিত করুন'}
    ctaUrl={'https://shahedit.com/profile'}
    accent="red"
  />
)

export const template = {
  component: Email,
  subject: 'নিরাপত্তা সতর্কতা — Shahed IT',
  displayName: 'নিরাপত্তা সতর্কতা',
  previewData: {"name":"করিম","alertType":"অস্বাভাবিক লগইন","details":"নতুন দেশ থেকে লগইন চেষ্টা।"},
} satisfies TemplateEntry
