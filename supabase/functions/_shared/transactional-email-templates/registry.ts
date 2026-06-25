import type { ComponentType } from 'npm:react@18.3.1'
import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as orderConfirmation } from './order-confirmation.tsx'
import { template as welcome } from './welcome.tsx'
import { template as passwordChangedAlert } from './password-changed-alert.tsx'
import { template as newDeviceLogin } from './new-device-login.tsx'
import { template as subscriptionActivated } from './subscription-activated.tsx'
import { template as paymentSuccess } from './payment-success.tsx'
import { template as paymentFailed } from './payment-failed.tsx'
import { template as invoiceEmail } from './invoice-email.tsx'
import { template as subscriptionExpiring } from './subscription-expiring.tsx'
import { template as subscriptionCancelled } from './subscription-cancelled.tsx'
import { template as refundProcessed } from './refund-processed.tsx'
import { template as orderProcessing } from './order-processing.tsx'
import { template as orderShipped } from './order-shipped.tsx'
import { template as orderDelivered } from './order-delivered.tsx'
import { template as orderCancelled } from './order-cancelled.tsx'
import { template as orderRefunded } from './order-refunded.tsx'
import { template as supportTicketCreated } from './support-ticket-created.tsx'
import { template as supportTicketReplied } from './support-ticket-replied.tsx'
import { template as supportTicketClosed } from './support-ticket-closed.tsx'
import { template as newMessageNotification } from './new-message-notification.tsx'
import { template as newCommentNotification } from './new-comment-notification.tsx'
import { template as maintenanceNotice } from './maintenance-notice.tsx'
import { template as securityAlert } from './security-alert.tsx'
import { template as systemNotification } from './system-notification.tsx'
import { template as licenseDelivery } from './license-delivery.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'contact-confirmation': contactConfirmation,
  'password-changed-alert': passwordChangedAlert,
  'new-device-login': newDeviceLogin,
  'subscription-activated': subscriptionActivated,
  'subscription-expiring': subscriptionExpiring,
  'subscription-cancelled': subscriptionCancelled,
  'payment-success': paymentSuccess,
  'payment-failed': paymentFailed,
  'invoice-email': invoiceEmail,
  'refund-processed': refundProcessed,
  'order-confirmation': orderConfirmation,
  'order-processing': orderProcessing,
  'order-shipped': orderShipped,
  'order-delivered': orderDelivered,
  'order-cancelled': orderCancelled,
  'order-refunded': orderRefunded,
  'support-ticket-created': supportTicketCreated,
  'support-ticket-replied': supportTicketReplied,
  'support-ticket-closed': supportTicketClosed,
  'new-message-notification': newMessageNotification,
  'new-comment-notification': newCommentNotification,
  'maintenance-notice': maintenanceNotice,
  'security-alert': securityAlert,
  'system-notification': systemNotification,
}
