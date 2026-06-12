/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; orderNumber?: string; courier?: string; tracking?: string }

const Email = (p: Props) => (
  <Layout
    preview={'আপনার অর্ডার শিপ হয়েছে'}
    title={'অর্ডার শিপ হয়েছে 📦'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, আপনার অর্ডার পথে আছে।`}
    paragraphs={[]}
    rows={[['Order #', p.orderNumber], ['Courier', p.courier], ['Tracking', p.tracking]]}
    ctaLabel={'Track করুন'}
    ctaUrl={'https://shahedit.com/dashboard'}
    accent="blue"
  />
)

export const template = {
  component: Email,
  subject: (d) => `Shipped — ${d.orderNumber ?? ''}`,
  displayName: 'Order Shipped',
  previewData: {"name":"Karim","orderNumber":"SI-1024","courier":"Sundarban Courier","tracking":"SC-998877"},
} satisfies TemplateEntry
