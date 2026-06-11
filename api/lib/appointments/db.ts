import { createPool, type Pool } from 'mysql2/promise'
import { randomBytes } from 'crypto'
import { APPOINTMENT_SERVICES, serviceLabel } from './services.js'

let pool: Pool | null = null

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DB_NAME?.trim())
}

function getPool(): Pool {
  if (!pool) {
    pool = createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME || 'ecowealth',
      user: process.env.DB_USER || 'ecowealth',
      password: process.env.DB_PASS || 'ecowealth_pass',
      waitForConnections: true,
      connectionLimit: 5,
    })
  }
  return pool
}

export function listAppointmentServices(): { id: string; label: string }[] {
  return [...APPOINTMENT_SERVICES]
}

export type AppointmentRow = {
  fullName: string
  phone: string
  service: string
  preferredDate?: string
  preferredTime?: string
  notes?: string
}

export function serviceExists(serviceId: string): boolean {
  return APPOINTMENT_SERVICES.some((s) => s.id === serviceId)
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').trim()
}

async function findOrCreatePatient(fullName: string, phone: string): Promise<number> {
  const db = getPool()
  const normalized = normalizePhone(phone)

  const [existing] = await db.query(
    'SELECT id, full_name FROM `user` WHERE phone = ? AND role = ? LIMIT 1',
    [normalized, 'patient'],
  )
  const rows = existing as { id: number; full_name: string }[]
  if (rows.length > 0) {
    const userId = rows[0].id
    if (rows[0].full_name !== fullName) {
      await db.execute('UPDATE `user` SET full_name = ? WHERE id = ?', [fullName, userId])
    }
    return userId
  }

  const [result] = await db.execute(
    'INSERT INTO `user` (role, full_name, phone, is_active) VALUES (?, ?, ?, 1)',
    ['patient', fullName, normalized],
  )
  return Number((result as { insertId: number }).insertId)
}

async function writeAudit(
  userId: number,
  entityType: string,
  entityId: number,
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const db = getPool()
  await db.execute(
    `INSERT INTO audit (user_id, entity_type, entity_id, action, payload_json)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, entityType, entityId, action, JSON.stringify(payload)],
  )
}

export async function createAppointment(data: AppointmentRow): Promise<string> {
  const referenceId = randomBytes(4).toString('hex').slice(0, 8).toUpperCase()
  const userId = await findOrCreatePatient(data.fullName, data.phone)
  const label = serviceLabel(data.service)

  const db = getPool()
  const [result] = await db.execute(
    `INSERT INTO appointment (user_id, reference_id, service_slug, service_label, preferred_date, preferred_time, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      userId,
      referenceId,
      data.service,
      label,
      data.preferredDate || null,
      data.preferredTime ? `${data.preferredTime}:00` : null,
      data.notes || null,
    ],
  )
  const appointmentId = Number((result as { insertId: number }).insertId)

  await writeAudit(userId, 'appointment', appointmentId, 'book', {
    referenceId,
    service: data.service,
    serviceLabel: label,
  })

  return referenceId
}
