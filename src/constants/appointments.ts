/**
 * Appointments API URL.
 * - Local Vite (5173) / XAMPP → PHP on Apache
 * - Vercel / production build → same-origin /api/book-appointment (serverless)
 */
export function resolveAppointmentApiUrl(): string {
  const fromEnv = import.meta.env.VITE_APPOINTMENT_API_URL as string | undefined
  if (fromEnv) return fromEnv

  const vercelApi = '/api/book-appointment'
  const phpPath = '/ecowealth_v2/api/appointments/index.php'

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, pathname, origin } = window.location

    if (port === '5173' || port === '4173') {
      return `${protocol}//${hostname}${phpPath}`
    }

    if (pathname.includes('/ecowealth_v2')) {
      return `${origin}${phpPath}`
    }

    if (import.meta.env.PROD) {
      return `${origin}${vercelApi}`
    }
  }

  return import.meta.env.DEV
    ? 'http://localhost/ecowealth_v2/api/appointments/index.php'
    : vercelApi
}

export const APPOINTMENT_API_URL = resolveAppointmentApiUrl()

/** Fallback when appointment-services.json cannot be loaded */
export const APPOINTMENT_SERVICES_FALLBACK = [
  { id: 'free-checkup', label: 'Free check-up / consultation' },
  { id: 'colon-hydrotherapy', label: 'Colon hydrotherapy' },
  { id: 'wellness-massage', label: 'Therapeutic massage & wellness' },
  { id: 'iridology', label: 'Iridology' },
  { id: 'herbology', label: 'Herbology' },
  { id: 'herbal-coffee', label: 'Herbal coffee' },
  { id: 'supplements', label: 'Food supplements' },
  { id: 'general-consultation', label: 'General wellness consultation' },
  { id: 'products-inquiry', label: 'Products inquiry (in-clinic)' },
] as const
