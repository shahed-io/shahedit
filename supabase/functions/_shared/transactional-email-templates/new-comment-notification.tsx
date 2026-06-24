/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Layout } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; commenter?: string; on?: string; commentPreview?: string }

const Email = (p: Props) => (
  <Layout
    preview={'নতুন কমেন্ট এসেছে'}
    title={'নতুন কমেন্ট'}
    intro={`প্রিয় ${p.name ?? 'গ্রাহক'}, ${p.commenter ?? 'কেউ'} আপনার ${p.on ?? 'পোস্টে'} কমেন্ট করেছে।`}
    paragraphs={[p.commentPreview ? `"${p.commentPreview}"` : '']}
    
    ctaLabel={'কমেন্ট দেখুন'}
    ctaUrl={'https://shahedit.com'}
    accent="blue"
  />
)

export const template = {
  component: Email,
  subject: 'আপনার পোস্টে নতুন কমেন্ট',
  displayName: 'New Comment Notification',
  previewData: {"name":"করিম","commenter":"রহিম","on":"ব্লগ পোস্টে","commentPreview":"দারুণ লেখা!"},
} satisfies TemplateEntry
