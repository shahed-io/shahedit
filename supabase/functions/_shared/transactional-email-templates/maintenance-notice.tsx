/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; startTime?: string; duration?: string }

const Email = (p: Props) => (
  <Layout
    preview={'নির্ধারিত রক্ষণাবেক্ষণ'}
    title={'রক্ষণাবেক্ষণ নোটিশ'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আমরা সিস্টেম রক্ষণাবেক্ষণের কাজ করব।`}
    paragraphs={['এই সময়ে সার্ভিস সাময়িকভাবে বন্ধ থাকতে পারে। অসুবিধার জন্য দুঃখিত।']}
    rows={[['শুরুর সময়', p.startTime], ['সময়কাল', p.duration]]}
    
    
    accent="amber"
  />
)

export const template = {
  component: Email,
  subject: 'নির্ধারিত রক্ষণাবেক্ষণ — Shahed IT',
  displayName: 'রক্ষণাবেক্ষণ নোটিশ',
  previewData: {"name":"করিম","startTime":"২০২৬-০৬-১৫ রাত ২:০০","duration":"১ ঘণ্টা"},
} satisfies TemplateEntry
