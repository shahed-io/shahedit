/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  productTitle?: string
  licenseKey?: string
  orderNumber?: string
  activations?: string
  downloadUrl?: string
}

const Email = (p: Props) => (
  <Layout
    preview={'আপনার License Key'}
    title={'আপনার License Key প্রস্তুত'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, ${p.productTitle ?? 'আপনার প্রোডাক্ট'}-এর License Key নিচে দেওয়া হলো।`}
    paragraphs={['Key-টি সংরক্ষণ করুন এবং প্রোডাক্ট সক্রিয় করতে ব্যবহার করুন।']}
    rows={[
      ['প্রোডাক্ট', p.productTitle],
      ['License Key', p.licenseKey],
      ['অর্ডার নম্বর', p.orderNumber],
      ['সর্বোচ্চ Activation', p.activations],
    ]}
    ctaLabel={p.downloadUrl ? 'ড্যাশবোর্ডে যান' : undefined}
    ctaUrl={p.downloadUrl ?? 'https://shahedit.com/dashboard'}
    accent="purple"
  />
)

export const template = {
  component: Email,
  subject: (d) => `License Key — ${d.productTitle ?? 'Shahed IT'}`,
  displayName: 'License Delivery',
  previewData: { name: 'করিম', productTitle: 'Pro App', licenseKey: 'XXXX-YYYY-ZZZZ-AAAA', orderNumber: 'ORD-1024', activations: '1' },
} satisfies TemplateEntry
