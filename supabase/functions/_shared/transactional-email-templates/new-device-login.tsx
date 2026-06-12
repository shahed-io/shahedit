/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; device?: string; location?: string; when?: string }

const Email = (p: Props) => (
  <Layout
    preview={'নতুন ডিভাইস থেকে লগইন'}
    title={'নতুন ডিভাইস থেকে লগইন'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার অ্যাকাউন্টে একটি নতুন লগইন সনাক্ত হয়েছে।`}
    paragraphs={['যদি এটা আপনি না হন, এখনই পাসওয়ার্ড পরিবর্তন করুন।']}
    rows={[['Device', p.device], ['Location', p.location], ['Time', p.when]]}
    ctaLabel={'Account secure করুন'}
    ctaUrl={'https://shahedit.com/profile'}
    accent="amber"
  />
)

export const template = {
  component: Email,
  subject: 'নতুন ডিভাইস থেকে লগইন — Shahed IT',
  displayName: 'New Device Login Alert',
  previewData: {"name":"Karim","device":"Chrome on Windows","location":"Rajshahi, BD","when":"আজ ৩:২০ PM"},
} satisfies TemplateEntry
