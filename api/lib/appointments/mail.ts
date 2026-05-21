import { createTransport } from 'nodemailer'
import type { AppointmentPayload } from './validate'
import type { AppointmentServerConfig } from './config'
import { buildAppointmentEmail } from './email'

export async function sendAppointmentEmail(
  appointment: AppointmentPayload,
  config: AppointmentServerConfig,
): Promise<boolean> {
  const { clinicEmail, smtp, mailFromName } = config
  if (!clinicEmail || !smtp.user || !smtp.pass) {
    return false
  }

  const { subject, html, text } = buildAppointmentEmail(appointment, config)

  const transport = createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  })

  await transport.sendMail({
    from: `"${mailFromName.replace(/"/g, '')}" <${smtp.fromEmail}>`,
    to: clinicEmail,
    replyTo: appointment.email,
    subject,
    text,
    html,
  })

  return true
}
