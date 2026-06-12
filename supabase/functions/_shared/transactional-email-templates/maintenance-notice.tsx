/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; startTime?: string; duration?: string }

const Email = (p: Props) => (
  <Layout
    preview={'নির্ধারিত maintenance'}
    title={'Maintenance Notice 🔧'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আমরা সিস্টেম maintenance চালাব।`}
    paragraphs={['এই সময়ে service সাময়িকভাবে বন্ধ থাকতে পারে। অসুবিধার জন্য দুঃখিত।']}
    rows={[['Start', p.startTime], ['Duration', p.duration]]}
    
    
    accent="amber"
  />
)

export const template = {
  component: Email,
  subject: 'Scheduled Maintenance — Shahed IT',
  displayName: 'Maintenance Notice',
  previewData: {"name":"Karim","startTime":"২০২৬-০৬-১৫ ২:০০ AM","duration":"১ ঘণ্টা"},
} satisfies TemplateEntry
