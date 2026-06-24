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
    rows={[['ডিভাইস', p.device], ['লোকেশন', p.location], ['সময়', p.when]]}
    ctaLabel={'অ্যাকাউন্ট সুরক্ষিত করুন'}
    ctaUrl={'https://shahedit.com/profile'}
    accent="amber"
  />
)

export const template = {
  component: Email,
  subject: 'নতুন ডিভাইস থেকে লগইন — Shahed IT',
  displayName: 'নতুন ডিভাইস লগইন সতর্কতা',
  previewData: {"name":"করিম","device":"Chrome on Windows","location":"রাজশাহী, বাংলাদেশ","when":"আজ বিকাল ৩:২০"},
} satisfies TemplateEntry
