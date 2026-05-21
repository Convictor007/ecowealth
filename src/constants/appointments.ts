import type { AppointmentService } from '@/api/types'
import servicesData from '../../public/api/appointment-services.json'

/** Single source for service options (see public/api/appointment-services.json) */
export const APPOINTMENT_SERVICES_FALLBACK: AppointmentService[] = servicesData.services

/**
 * Booking API URL — Vercel uses /api/appointments; XAMPP uses book.php under /ecowealth_v2
 */
export function resolveAppointmentApiUrl(): string {
  const fromEnv = import.meta.env.VITE_APPOINTMENT_API_URL as string | undefined
  if (fromEnv) return fromEnv

  if (typeof window !== 'undefined') {
    const { hostname, port, pathname, origin } = window.location
    const phpPath = '/ecowealth_v2/api/appointments/book.php'

    if (hostname.includes('vercel.app')) {
      return `${origin}/api/appointments`
    }

    if (port === '5173' || port === '4173') {
      return `http://${hostname}/ecowealth_v2/api/appointments/book.php`
    }

    if (pathname.includes('/ecowealth_v2')) {
      return `${origin}${phpPath}`
    }

    return `${origin}/api/appointments`
  }

  return import.meta.env.DEV
    ? 'http://localhost/ecowealth_v2/api/appointments/book.php'
    : '/api/appointments'
}
