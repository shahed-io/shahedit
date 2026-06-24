/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; orderNumber?: string }

const Email = (p: Props) => (
  <Layout
    preview={'অর্ডার প্রসেসিং শুরু হয়েছে'}
    title={'অর্ডার প্রসেসিং শুরু'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আমরা আপনার অর্ডার নিয়ে কাজ শুরু করেছি।`}
    paragraphs={['আপডেট পেতে ড্যাশবোর্ডে চোখ রাখুন।']}
    rows={[['অর্ডার নম্বর', p.orderNumber]]}
    ctaLabel={'অর্ডার দেখুন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="purple"
  />
)

export const template = {
  component: Email,
  subject: (d) => `অর্ডার প্রসেসিং — ${d.orderNumber ?? ''}`,
  displayName: 'অর্ডার প্রসেসিং',
  previewData: {"name":"করিম","orderNumber":"SI-1024"},
} satisfies TemplateEntry
