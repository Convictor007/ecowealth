import { z } from 'zod'
import { ALLOWED_SERVICE_IDS } from './services.js'

const serviceEnum = z.enum(ALLOWED_SERVICE_IDS)

export const appointmentSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Please enter your full name.').max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[\d\s+\-()]{7,20}$/, 'Please enter a valid phone number.'),
    service: serviceEnum,
    preferredDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid preferred date.')
      .optional()
      .or(z.literal('')),
    preferredTime: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/, 'Please enter a valid time (HH:MM).')
      .optional()
      .or(z.literal('')),
    notes: z.string().trim().max(1000, 'Notes must be 1000 characters or less.').optional().or(z.literal('')),
    website: z.string().optional(),
  })
  .transform((data) => ({
    fullName: data.fullName,
    phone: data.phone,
    service: data.service,
    preferredDate: data.preferredDate || undefined,
    preferredTime: data.preferredTime || undefined,
    notes: data.notes || undefined,
    website: data.website,
  }))

export type AppointmentInput = z.infer<typeof appointmentSchema>

export function parseAppointmentBody(body: unknown): {
  data?: AppointmentInput
  errors?: Record<string, string>
} {
  const result = appointmentSchema.safeParse(body)
  if (result.success) {
    return { data: result.data }
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !errors[key]) {
      errors[key] = issue.message
    }
  }
  return { errors }
}
