/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; when?: string }

const Email = (p: Props) => (
  <Layout
    preview={'আপনার পাসওয়ার্ড পরিবর্তিত হয়েছে'}
    title={'পাসওয়ার্ড পরিবর্তিত হয়েছে'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার Shahed IT একাউন্টের পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।`}
    paragraphs={[`সময়: ${p.when ?? new Date().toLocaleString('bn-BD')}`, `যদি আপনি না করে থাকেন, এখনই একাউন্ট সুরক্ষিত করুন এবং আমাদের সাথে যোগাযোগ করুন।`]}
    
    ctaLabel={'নিরাপত্তা চেক করুন'}
    ctaUrl={'https://shahedit.com/profile'}
    accent="amber"
  />
)

export const template = {
  component: Email,
  subject: 'আপনার পাসওয়ার্ড পরিবর্তিত হয়েছে — Shahed IT',
  displayName: 'Password Changed Alert',
  previewData: {"name":"করিম"},
} satisfies TemplateEntry
