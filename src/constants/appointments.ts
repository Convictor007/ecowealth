import type { AppointmentService } from '@/api/types'

/**
 * Used only when /api/appointment-services.json cannot be loaded.
 * Keep in sync with public/api/appointment-services.json.
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

const VITE_DEV_PORTS = new Set(['5173', '5174', '4173'])

/**
 * Booking API URL — Vercel & Vite dev use /api/appointments; XAMPP uses book.php when deployed under /ecowealth_v2
 */
export function resolveAppointmentApiUrl(): string {
  const fromEnv = import.meta.env.VITE_APPOINTMENT_API_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim()

  if (typeof window !== 'undefined') {
    const { hostname, port, pathname, origin } = window.location
    const phpPath = '/ecowealth_v2/api/appointments/book.php'

    if (hostname.includes('vercel.app')) {
      return `${origin}/api/appointments`
    }

    // Vite dev / preview: same-origin handler (vite-plugin-appointments-dev)
    if (VITE_DEV_PORTS.has(port)) {
      return `${origin}/api/appointments`
    }

    if (pathname.includes('/ecowealth_v2')) {
      return `${origin}${phpPath}`
    }

    return `${origin}/api/appointments`
  }

  return '/api/appointments'
}
