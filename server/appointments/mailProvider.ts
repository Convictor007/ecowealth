import type { AppointmentInput } from './validate'
import { isResendConfigured } from './sendViaResend'
import { isSmtpConfigured } from './sendViaSmtp'

export type MailProvider = 'resend' | 'smtp' | 'none'

/** Prefer Resend on Vercel; SMTP for local XAMPP-style setups. */
export function resolveMailProvider(): MailProvider {
  const forced = (process.env.MAIL_PROVIDER || '').toLowerCase()
  if (forced === 'resend' && isResendConfigured()) return 'resend'
  if (forced === 'smtp' && isSmtpConfigured()) return 'smtp'
  if (isResendConfigured()) return 'resend'
  if (isSmtpConfigured()) return 'smtp'
  return 'none'
}

export function isEmailConfigured(): boolean {
  return resolveMailProvider() !== 'none'
}

export async function sendAppointmentEmail(input: AppointmentInput): Promise<void> {
  const provider = resolveMailProvider()
  const { buildAppointmentEmail } = await import('./emailTemplate')
  const { subject, html, text } = buildAppointmentEmail(input)

  if (provider === 'resend') {
    const { sendViaResend } = await import('./sendViaResend')
    await sendViaResend({ input, subject, html, text })
    return
  }

  if (provider === 'smtp') {
    const { sendViaSmtp } = await import('./sendViaSmtp')
    await sendViaSmtp({ input, subject, html, text })
    return
  }

  throw new Error(
    'Appointment email is not configured. Set RESEND_API_KEY (recommended) or MAIL_SMTP_USER + MAIL_SMTP_PASS.',
  )
}
