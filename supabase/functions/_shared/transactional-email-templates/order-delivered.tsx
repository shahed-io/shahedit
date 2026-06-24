/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; orderNumber?: string }

const Email = (p: Props) => (
  <Layout
    preview={'অর্ডার ডেলিভার হয়েছে'}
    title={'অর্ডার ডেলিভার হয়েছে'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার অর্ডার সফলভাবে ডেলিভার হয়েছে।`}
    paragraphs={['আমাদের সাথে থাকার জন্য ধন্যবাদ। একটি রিভিউ দিতে ভুলবেন না!']}
    rows={[['অর্ডার নম্বর', p.orderNumber]]}
    ctaLabel={'রিভিউ দিন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="green"
  />
)

export const template = {
  component: Email,
  subject: (d) => `অর্ডার ডেলিভার হয়েছে — ${d.orderNumber ?? ''}`,
  displayName: 'Order Delivered',
  previewData: {"name":"করিম","orderNumber":"SI-1024"},
} satisfies TemplateEntry
