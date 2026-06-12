import type { ComponentType } from 'npm:react@18.3.1'
import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as orderConfirmation } from './order-confirmation.tsx'
import { template as welcome } from './welcome.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-confirmation': contactConfirmation,
  'order-confirmation': orderConfirmation,
  'welcome': welcome,
}
