import type { AppointmentInput } from './validate'

const RESEND_API = 'https://api.resend.com/emails'

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
  const from = `${fromName.replace(/"/g, '')} <${fromEmail}>`

  const response = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [clinicEmail],
      reply_to: args.input.email,
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  })

  const body = (await response.json().catch(() => null)) as {
    id?: string
    message?: string
    name?: string
  } | null

  if (!response.ok) {
    const msg = body?.message || body?.name || `Resend HTTP ${response.status}`
    console.error('Resend send failed:', response.status, body)
    if (/domain|verify|not authorized|from address/i.test(msg)) {
      throw new Error(
        'Resend: verify your sending domain and set RESEND_FROM_EMAIL to an address on that domain.',
      )
    }
    throw new Error(`Failed to send appointment email: ${msg}`)
  }

  if (!body?.id) {
    throw new Error('Failed to send appointment email: empty response from Resend')
  }
}
