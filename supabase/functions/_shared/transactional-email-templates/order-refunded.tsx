/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; orderNumber?: string; amount?: number | string }

const Email = (p: Props) => (
  <Layout
    preview={'অর্ডার রিফান্ড হয়েছে'}
    title={'অর্ডার রিফান্ড হয়েছে'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার অর্ডারের রিফান্ড প্রসেস করা হয়েছে।`}
    paragraphs={[]}
    rows={[['অর্ডার নম্বর', p.orderNumber], ['রিফান্ড', `৳ ${p.amount ?? '—'}`]]}
    
    
    accent="green"
  />
)

export const template = {
  component: Email,
  subject: 'অর্ডার রিফান্ড — Shahed IT',
  displayName: 'অর্ডার রিফান্ড',
  previewData: {"name":"করিম","orderNumber":"SI-1024","amount":15000},
} satisfies TemplateEntry
