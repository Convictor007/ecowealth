import { Resend } from 'resend'
import type { AppointmentInput } from './validate'

export function isResendConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const clinicEmail = process.env.CLINIC_EMAIL?.trim()
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
  return Boolean(apiKey && clinicEmail && fromEmail)
}

export async function sendViaResend(args: {
  input: AppointmentInput
  subject: string
  html: string
  text: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!.trim()
  const clinicEmail = process.env.CLINIC_EMAIL!.trim()
  const fromEmail = process.env.RESEND_FROM_EMAIL!.trim()
  const fromName = process.env.MAIL_FROM_NAME || 'Eco Wealth Appointments'

  const resend = new Resend(apiKey)
  const from = `${fromName.replace(/"/g, '')} <${fromEmail}>`

  const { data, error } = await resend.emails.send({
    from,
    to: [clinicEmail],
    replyTo: args.input.email,
    subject: args.subject,
    html: args.html,
    text: args.text,
  })

  if (error) {
    console.error('Resend send failed:', error)
    const msg = error.message || String(error)
    if (/domain|verify|not authorized|from address/i.test(msg)) {
      throw new Error(
        'Resend: verify your sending domain and set RESEND_FROM_EMAIL to an address on that domain.',
      )
    }
    throw new Error(`Failed to send appointment email: ${msg}`)
  }

  if (!data?.id) {
    throw new Error('Failed to send appointment email: empty response from Resend')
  }
}
