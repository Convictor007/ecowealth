import type { AppointmentService } from '@/api/types'
import { isViteDevServer, resolvePhpApiBase, useMysqlApi } from '@/api/config'

/**
 * Used only when appointment services API cannot be loaded.
 * Keep in sync with public/api/appointment-services.json / database seed.
 */
export const APPOINTMENT_SERVICES_FALLBACK: AppointmentService[] = [
  { id: 'free-checkup', label: 'Free check-up / consultation' },
  { id: 'colon-hydrotherapy', label: 'Colon hydrotherapy' },
  { id: 'wellness-massage', label: 'Therapeutic massage & wellness' },
  { id: 'iridology', label: 'Iridology' },
  { id: 'herbology', label: 'Herbology' },
  { id: 'herbal-coffee', label: 'Herbal coffee' },
  { id: 'supplements', label: 'Food supplements' },
  { id: 'general-consultation', label: 'General wellness consultation' },
  { id: 'products-inquiry', label: 'Products inquiry (in-clinic)' },
]

/**
 * Booking API URL — saves to MySQL (no email).
 */
export function resolveAppointmentApiUrl(): string {
  const fromEnv = import.meta.env.VITE_APPOINTMENT_API_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim()

  if (typeof window !== 'undefined') {
    const { hostname, pathname, origin } = window.location

    if (useMysqlApi()) {
      const base = resolvePhpApiBase()
      if (pathname.includes('/ecowealth_v2')) {
        return `${origin}/ecowealth_v2/api/appointments/book.php`
      }
      if (isViteDevServer()) {
        return `${origin}/api/appointments`
      }
      return `${base}/appointments.php`
    }

    if (hostname.includes('vercel.app')) {
      return `${origin}/api/appointments`
    }

    if (isViteDevServer()) {
      return `${origin}/api/appointments`
    }

    if (pathname.includes('/ecowealth_v2')) {
      return `${origin}/ecowealth_v2/api/appointments/book.php`
    }

    return `${origin}/api/appointments`
  }

  return '/api/appointments'
}
