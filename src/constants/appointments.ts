/**
 * Appointments API URL.
 * - Local Vite (5173) / XAMPP → PHP on Apache
 * - Vercel / production → same-origin /api/book-appointment (never localhost from env)
 */
export function resolveAppointmentApiUrl(): string {
  const fromEnv = import.meta.env.VITE_APPOINTMENT_API_URL as string | undefined
  const vercelApi = '/api/book-appointment'
  const phpPath = '/ecowealth_v2/api/appointments/index.php'

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, pathname, origin } = window.location
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'

    // Live site (Vercel or any public host): always same-origin — avoids CORS / wrong env
    if (!isLocalHost) {
      return `${origin}${vercelApi}`
    }

    if (fromEnv) {
      return fromEnv
    }

    if (port === '5173' || port === '4173') {
      return `${protocol}//${hostname}${phpPath}`
    }

    if (pathname.includes('/ecowealth_v2')) {
      return `${origin}${phpPath}`
    }
  }

  if (fromEnv && import.meta.env.DEV) {
    return fromEnv
  }

  return import.meta.env.DEV
    ? 'http://localhost/ecowealth_v2/api/appointments/index.php'
    : vercelApi
}

/** @deprecated Use resolveAppointmentApiUrl() at request time */
export const APPOINTMENT_API_URL = '/api/book-appointment'

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
